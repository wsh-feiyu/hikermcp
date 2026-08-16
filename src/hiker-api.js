import { loadConfig, expandHosts, apiBase } from './config.js';

/**
 * 海阔视界 App HTTP API 封装
 *
 * 与浏览器插件 background.js 的代理逻辑对齐：
 * - 插件通过 chrome.runtime.sendMessage -> Service Worker fetch 解决 CORS
 * - Node 端无 CORS 限制，直接 fetch 即可
 *
 * 已知 API（端口 52020）：
 *   GET  /getAllRuleTitles          规则标题列表
 *   GET  /getRuleContent?title=xxx  规则内容
 *   POST /saveRule                  保存规则（form-urlencoded）
 *   GET  /getAllJsTitles            JS 插件列表
 *   GET  /getJsContent?name=xxx     JS 插件内容
 *   POST /saveJs                    保存 JS 插件
 */

let currentHost = null;

export function getCurrentHost() {
  return currentHost;
}

/**
 * 探测可用的海阔视界 App 地址。
 * 对每个候选 host 并发请求 /getAllRuleTitles，第一个成功的即为可用地址。
 */
export async function discoverHost() {
  if (currentHost) return currentHost;
  const cfg = loadConfig();
  const candidates = expandHosts(cfg.hosts);
  const timeout = cfg.timeout;

  // 并发探测，控制并发数
  const queue = [...candidates];
  const workers = Array.from({ length: Math.min(cfg.scanConcurrency, queue.length) }, async () => {
    while (queue.length) {
      const host = queue.shift();
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), timeout);
        const res = await fetch(`${apiBase(host)}/getAllRuleTitles`, {
          signal: ctrl.signal,
        });
        clearTimeout(timer);
        if (res.ok) {
          await res.text();
          currentHost = host;
          return host;
        }
      } catch {
        // 继续探测下一个
      }
    }
    return null;
  });

  const results = await Promise.all(workers);
  const found = results.find((h) => h);
  if (!found) {
    throw new Error(
      `未找到可用的海阔视界 App（已探测 ${candidates.length} 个地址）。请检查手机与电脑是否在同一局域网，并在 config/mcp.json 中配置正确的 hosts。`
    );
  }
  currentHost = found;
  return found;
}

/**
 * 通用 GET 请求
 */
async function get(path, params = {}) {
  const host = await discoverHost();
  const url = new URL(apiBase(host) + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  }
  const cfg = loadConfig();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), cfg.timeout);
  try {
    const res = await fetch(url.toString(), { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 通用 POST 请求（form-urlencoded，与插件一致）
 */
async function post(path, body = {}) {
  const host = await discoverHost();
  const cfg = loadConfig();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), cfg.timeout);
  try {
    const res = await fetch(apiBase(host) + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body).toString(),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

// ============ 规则 API ============

export async function getAllRuleTitles() {
  const text = await get('/getAllRuleTitles');
  return JSON.parse(text);
}

export async function getRuleContent(title) {
  return await get('/getRuleContent', { title });
}

/**
 * 保存规则到 App（form-urlencoded 兼容方式）。
 *
 * 注意：MCP 工具 save_rule 已改用 JSON 通道（tools/saveRule.js → appApi.js），
 * 此处保留 form-urlencoded 方式仅用于兼容直接调用 hiker-api.js 的场景。
 * 新代码请优先使用 tools/saveRule.js。
 */
export async function saveRule(rule) {
  const body = { ...rule };
  if (Array.isArray(body.pageList)) {
    body.pages = JSON.stringify(body.pageList);
    delete body.pageList;
  }
  return await post('/saveRule', body);
}

// ============ JS 插件 API ============

export async function getAllJsTitles() {
  const text = await get('/getAllJsTitles');
  return JSON.parse(text);
}

export async function getJsContent(name) {
  return await get('/getJsContent', { name });
}

export async function saveJs(name, content) {
  return await post('/saveJs', { name, content });
}
