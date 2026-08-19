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
      'get_connection_status', 'export_rule_json', 'share_rule_paste',
      'remember_lesson', 'recall_lessons', 'list_lessons', 'forget_lesson',
    ];
    for (const name of expected) {
      assert.ok(names.includes(name), `工具 ${name} 应存在`);
    }
    assert.equal(names.length, expected.length, '工具数量应精确匹配');
    assert.ok(!names.includes('list_examples'), '示例工具已移除');
    assert.ok(!names.includes('get_example_rule'), '示例工具已移除');
    assert.ok(!names.includes('get_rule_docs'), '文档工具已移除');
    assert.ok(!names.includes('list_js_plugins'), 'JS 插件工具已移除');

    // 3. 资源与提示词（写源文档资源已全部移除，不再声明）
    assert.equal(init.result.capabilities.resources, undefined, '不应声明 resources 能力');
    assert.equal(init.result.capabilities.prompts, undefined, '不应声明 prompts 能力');

    // 4. 格式化代码
    const fmt = await client.request('tools/call', {
      name: 'format_rule_code',
      arguments: { code: 'js:var d=[];d.push({title:"测试"});setResult(d);' },
    });
    assert.ok(fmt.result.content[0].text.includes('setResult(d)'), '格式化应输出规范代码');

    // 5. 校验规则（新链路：序列化干跑）
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

    // 6. 校验有问题的规则
    const vr2 = await client.request('tools/call', {
      name: 'validate_rule',
      arguments: { rule: { title: '坏规则', find_rule: 'js:var x = ;' } },
    });
    assert.ok(vr2.result.content[0].text.includes('校验未通过'), '坏规则应校验失败');

    // 7. 导出规则为 JSON（未连接 App 时用）
    const exJson = await client.request('tools/call', {
      name: 'export_rule_json',
      arguments: {
        rule: {
          title: '导出测试',
          type: 'video',
          find_rule: 'js:setResult([]);',
          pages: [{ name: '主页', path: 'home', rule: '//js:setResult([]);' }],
        },
      },
    });
    const exText = exJson.result.content[0].text;
    assert.ok(exText.includes('已导出为 JSON'), '应提示导出成功');
    assert.ok(exText.includes('方式一：复制粘贴导入'), '应含粘贴导入方式');
    assert.ok(exText.includes('方式二：保存为 .json 文件'), '应含保存文件方式');
    assert.ok(exText.includes('"pages"'), '应包含 pages 字段');
    assert.ok(!exText.includes('"pageList"'), '导出不应包含 pageList');

    console.log('所有测试通过！');
  } finally {
    client.kill();
  }
});