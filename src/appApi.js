/**
 * 全项目唯一的 App 写入通道。
 *
 * 统一 JSON 序列化与错误处理，避免多处重复实现导致序列化不一致。
 * 所有写入型 MCP 工具（saveRule）必须经此通道提交。
 *
 * 关键设计：
 * - JSON.stringify(payload) 是唯一序列化点，绝不对已序列化字符串二次转义/拼接
 * - 失败时抛出 AppApiError（含 status + detail），供 MCP 层透传真实错误
 */

import { discoverHost, getCurrentHost } from './hiker-api.js';
import { apiBase, loadConfig } from './config.js';

export class AppApiError extends Error {
  constructor(path, status, detail) {
    super(`[${path}] HTTP ${status} - ${detail}`);
    this.name = 'AppApiError';
    this.status = status;
    this.detail = detail;
  }
}

/**
 * 向 App 发送 POST 请求（JSON body）。
 * @param {string} path - API 路径，如 '/saveRule'
 * @param {object} payload - 将 JSON.stringify 后发送
 * @returns {Promise<object>} App 返回的 JSON 对象
 */
export async function postToApp(path, payload) {
  const host = getCurrentHost() || await discoverHost();
  const cfg = loadConfig();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), cfg.timeout);

  try {
    const resp = await fetch(apiBase(host) + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // ★ 关键：只做一次 JSON.stringify，绝不对已序列化字符串二次转义/拼接
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });

    const text = await resp.text();
    if (!resp.ok) {
      // ★ 关键：透传 App 真实错误详情，不再只回 "HTTP 500"
      throw new AppApiError(path, resp.status, text.slice(0, 500));
    }

    try {
      return JSON.parse(text);
    } catch {
      return { isSuccess: true, raw: text };
    }
  } catch (e) {
    if (e instanceof AppApiError) throw e;
    throw new AppApiError(path, 0, `无法连接 App: ${e.message}`);
  } finally {
    clearTimeout(timer);
  }
}