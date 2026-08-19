import { spawn } from 'node:child_process';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

/**
 * Streamable HTTP 模式测试：验证完整会话流程（initialize → initialized → 工具调用 → DELETE）。
 * 覆盖：会话 ID 生成、多请求复用、无会话请求返回 400、会话关闭。
 */

const PROJECT_DIR = resolve(fileURLToPath(import.meta.url), '..', '..');
const PORT = 3199;
const BASE = `http://127.0.0.1:${PORT}/mcp`;

test('HTTP+LAN 模式：启动横幅打印内网地址', { timeout: 10000 }, async () => {
  const child = spawn(process.execPath, ['src/index.js', '--http', '--lan'], {
    cwd: PROJECT_DIR,
    env: { ...process.env, HIKER_MCP_PORT: '3198' },
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  let stderr = '';
  child.stderr.on('data', (d) => { stderr += d.toString(); });
  try {
    await waitReady(child, 5000, 3198);
    await new Promise((r) => setTimeout(r, 300));
    assert.ok(stderr.includes('内网访问'), '横幅应打印内网访问地址');
    assert.ok(stderr.includes('http://127.0.0.1:3198/mcp'), '应包含本机地址');
    assert.ok(stderr.includes('健康检查'), '应包含健康检查地址');
  } finally {
    child.kill('SIGKILL');
    setTimeout(() => { try { child.kill(); } catch {} }, 100);
  }
});

function startServer() {
  const child = spawn(process.execPath, ['src/index.js', '--http'], {
    cwd: PROJECT_DIR,
    env: { ...process.env, HIKER_MCP_PORT: String(PORT) },
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  child.on('error', (err) => {
    console.error('子进程启动失败:', err);
  });
  return child;
}

async function waitReady(child, timeoutMs = 5000, port = PORT) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/health`);
      if (res.ok) return;
    } catch {
      // 未就绪，继续等待
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('HTTP 服务启动超时');
}

async function post(body, sessionId) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
  };
  if (sessionId) headers['Mcp-Session-Id'] = sessionId;
  const res = await fetch(BASE, { method: 'POST', headers, body: JSON.stringify(body) });
  const text = await res.text();
  return { status: res.status, text, sessionId: res.headers.get('mcp-session-id') };
}

function parseData(text) {
  // 解析 SSE 响应中的 data 行
  for (const line of text.split('\n')) {
    if (line.startsWith('data:')) {
      return JSON.parse(line.slice(5).trim());
    }
  }
  return null;
}

test('Streamable HTTP 模式完整会话测试', { timeout: 15000 }, async () => {
  const child = startServer();
  try {
    await waitReady(child);

    // 1. 初始化，获取会话 ID
    const init = await post({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'http-test', version: '1.0.0' },
      },
    });
    assert.equal(init.status, 200, 'initialize 应返回 200');
    assert.ok(init.sessionId, '应返回 mcp-session-id');
    const initMsg = parseData(init.text);
    assert.equal(initMsg.result.serverInfo.name, 'hiker-mcp');

    // 2. initialized 通知（通知类请求按规范返回 202 Accepted）
    const notif = await post(
      { jsonrpc: '2.0', method: 'notifications/initialized' },
      init.sessionId
    );
    assert.ok([200, 202].includes(notif.status), `initialized 通知应返回 200/202，实际 ${notif.status}`);

    // 3. tools/list
    const tools = await post(
      { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} },
      init.sessionId
    );
    const toolsMsg = parseData(tools.text);
    assert.ok(toolsMsg.result.tools.length >= 12, '应列出全部工具');
    assert.ok(!toolsMsg.result.tools.some((t) => t.name === 'list_examples'), '示例工具已移除');
    assert.ok(!toolsMsg.result.tools.some((t) => t.name === 'get_rule_docs'), '文档工具已移除');
    assert.ok(!toolsMsg.result.tools.some((t) => t.name === 'list_js_plugins'), 'JS 插件工具已移除');
    assert.ok(toolsMsg.result.tools.some((t) => t.name === 'export_rule_json'), 'JSON 导出工具应存在');
    assert.ok(toolsMsg.result.tools.some((t) => t.name === 'share_rule_paste'), '云分享工具应存在');
    assert.ok(toolsMsg.result.tools.some((t) => t.name === 'remember_lesson'), '记忆工具应存在');

    // 4. 无会话 ID 的非 initialize 请求 → 400
    const bad = await post({ jsonrpc: '2.0', id: 4, method: 'tools/list', params: {} });
    assert.equal(bad.status, 400, '无会话的非 initialize 请求应返回 400');

    // 5. DELETE 关闭会话
    const del = await fetch(BASE, {
      method: 'DELETE',
      headers: { 'Mcp-Session-Id': init.sessionId },
    });
    assert.equal(del.status, 200, 'DELETE 应返回 200');

    // 6. 关闭后复用会话应失败（400/404）
    const after = await post(
      { jsonrpc: '2.0', id: 5, method: 'tools/list', params: {} },
      init.sessionId
    );
    assert.ok(after.status === 400 || after.status === 404, '关闭后会话应不可用');

    console.log('HTTP 模式所有测试通过！');
  } finally {
    child.kill('SIGKILL');
    // Windows 没有 SIGKILL，用 SIGTERM 兜底
    setTimeout(() => {
      try { child.kill(); } catch {}
    }, 100);
  }
});