import { spawn } from 'node:child_process';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const PROJECT_DIR = resolve(fileURLToPath(import.meta.url), '..', '..');

function createClient() {
  const child = spawn(process.execPath, ['src/index.js'], {
    cwd: PROJECT_DIR,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  let buf = '';
  let stderrBuf = '';
  child.stderr.on('data', (d) => { stderrBuf += d.toString(); });

  let nextId = 1;
  const pending = new Map();

  child.stdout.on('data', (chunk) => {
    buf += chunk.toString();
    let idx;
    while ((idx = buf.indexOf('\n')) !== -1) {
      const line = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);
      if (!line) continue;
      try {
        const msg = JSON.parse(line);
        if (msg.id !== undefined && pending.has(msg.id)) {
          const { resolve, timeout } = pending.get(msg.id);
          pending.delete(msg.id);
          clearTimeout(timeout);
          resolve(msg);
        }
      } catch {
        // 不完整的 JSON，继续等待
      }
    }
  });

  function request(method, params = {}, timeoutMs = 5000) {
    const id = nextId++;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`请求 ${id} (${method}) 超时\nstderr: ${stderrBuf.slice(-500)}`));
      }, timeoutMs);
      pending.set(id, { resolve, timeout });
      child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    });
  }

  function notify(method, params = {}) {
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n');
  }

  function kill() {
    child.kill('SIGKILL');
    // Windows 没有 SIGKILL，用 SIGTERM 兜底
    setTimeout(() => {
      try { child.kill(); } catch {}
    }, 100);
  }

  return { request, notify, kill };
}

test('MCP Server 完整功能测试', { timeout: 10000 }, async () => {
  const client = createClient();
  try {
    // 1. 初始化
    const init = await client.request('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'test', version: '1.0.0' },
    });
    assert.equal(init.result.serverInfo.name, 'hiker-mcp');

    // 发送 initialized 通知
    client.notify('notifications/initialized');
    await new Promise((r) => setTimeout(r, 100));

    // 2. 列出工具
    const tools = await client.request('tools/list');
    const names = tools.result.tools.map((t) => t.name);
    const expected = [
      'list_rules', 'get_rule', 'save_rule', 'validate_rule', 'format_rule_code',
      'list_js_plugins', 'get_js_plugin', 'save_js_plugin', 'format_js_code',
      'get_rule_docs', 'get_connection_status', 'share_rule_paste',
    ];
    for (const name of expected) {
      assert.ok(names.includes(name), `工具 ${name} 应存在`);
    }
    assert.equal(names.length, expected.length, '工具数量应精确匹配');
    assert.ok(!names.includes('list_examples'), '示例工具已移除');
    assert.ok(!names.includes('get_example_rule'), '示例工具已移除');

    // 3. 列出资源
    const res = await client.request('resources/list');
    const uris = res.result.resources.map((r) => r.uri);
    assert.ok(uris.includes('hiker://docs/hiker-help'), '官方帮助手册资源应存在');
    assert.ok(uris.includes('hiker://docs/qingdou-guide'), '青豆指南资源应存在');
    assert.ok(uris.includes('hiker://docs/source-blueprint'), '写源模板手册资源应存在');
    assert.ok(uris.includes('hiker://docs/video-template'), '视频源模板资源应存在');
    assert.ok(uris.includes('hiker://docs/hiker-dts'), 'hiker.d.ts 资源应存在');

    // 4. 格式化代码
    const fmt = await client.request('tools/call', {
      name: 'format_rule_code',
      arguments: { code: 'js:var d=[];d.push({title:"测试"});setResult(d);' },
    });
    assert.ok(fmt.result.content[0].text.includes('setResult(d)'), '格式化应输出规范代码');

    // 5. 读取官方帮助手册（hiker-help，通用标准）
    const docs = await client.request('tools/call', {
      name: 'get_rule_docs',
      arguments: { doc: 'hiker-help' },
    });
    assert.ok(docs.result.content[0].text.length > 1000, '官方帮助手册应较长');
    assert.ok(docs.result.content[0].text.includes('setResult'), '官方帮助手册应包含 setResult');

    // 5.5 读取写源模板手册（blueprint，AI 写源必读）
    const bp = await client.request('tools/call', {
      name: 'get_rule_docs',
      arguments: { doc: 'blueprint' },
    });
    assert.ok(bp.result.content[0].text.includes('setResult(d)'), '模板手册应包含 setResult 说明');
    assert.ok(bp.result.content[0].text.includes('find_rule'), '模板手册应包含 find_rule');

    // 5.6 读取视频源写源模板
    const vt = await client.request('tools/call', {
      name: 'get_rule_docs',
      arguments: { doc: 'video-template' },
    });
    assert.ok(vt.result.content[0].text.includes('setResult(d)'), '视频模板应包含 setResult 说明');
    assert.ok(vt.result.content[0].text.includes('$.exports'), '视频模板应包含 $.exports 导出说明');

    // 6. 校验规则（新链路：序列化干跑）
    const vr = await client.request('tools/call', {
      name: 'validate_rule',
      arguments: {
        rule: {
          title: '测试规则',
          type: 'video',
          find_rule: 'js:setResult([]);',
          pageList: [{ name: '主页', path: 'home', rule: '//js:setResult([]);' }],
        },
      },
    });
    assert.ok(vr.result.content[0].text.includes('校验通过'), '简单规则应校验通过');
    assert.ok(vr.result.content[0].text.includes('序列化干跑'), '应包含序列化干跑信息');

    // 7. 校验有问题的规则
    const vr2 = await client.request('tools/call', {
      name: 'validate_rule',
      arguments: { rule: { title: '坏规则', find_rule: 'js:var x = ;' } },
    });
    assert.ok(vr2.result.content[0].text.includes('校验未通过'), '坏规则应校验失败');

    console.log('所有测试通过！');
  } finally {
    client.kill();
  }
});