/**
 * 云剪贴板（Bailan Paste）分享能力。
 *
 * 场景：未连接手机 App 时，把写好的规则打包成海阔口令上传到云剪贴板，
 * 返回分享链接给用户，用户复制到手机即可导入。
 *
 * 链路：
 *   规则对象 → 一行大 JSON → base64 → 海阔口令文本
 *   → POST https://pasteme.tyrantg.com/api/create → data.path
 *   → 分享链接 `云6oooole/xxxxxx/{path}`（App 内可识别）
 *
 * 口令格式（海阔视界可识别）：
 *   海阔视界规则分享，当前分享的是：小程序￥home_rule_v2￥base64://@规则名称@base64编码
 */

import { normalizeRule } from './ruleNormalize.js';

const PASTE_API = 'https://pasteme.tyrantg.com';

/**
 * 将规则对象打包成海阔口令文本（纯函数，可单测）。
 * @param {object} rule 完整规则对象（同 save_rule 入参）
 * @param {string} [name] 规则名（口令中 @名称@ 位置，默认取 rule.title）
 * @returns {string} 形如：海阔视界规则分享，当前分享的是：小程序￥home_rule_v2￥base64://@XXX@BASE64
 */
export function buildRulePasteText(rule, name) {
  const normalized = normalizeRule(rule);
  const displayName = name || normalized.title || '未命名规则';
  const oneLine = JSON.stringify(normalized);
  const b64 = Buffer.from(oneLine, 'utf-8').toString('base64');
  return `海阔视界规则分享，当前分享的是：小程序￥home_rule_v2￥base64://@${displayName}@${b64}`;
}

/**
 * 上传文本到云剪贴板。
 * @param {string} content 要存储的文本（口令）
 * @param {object} [opts]
 * @param {Function} [opts.fetchImpl=fetch] 可注入的请求实现（测试用）
 * @param {string} [opts.password] 访问密码（建议不用）
 * @param {number} [opts.timeoutMs=15000] 超时毫秒
 * @returns {Promise<string>} 服务端返回的唯一 path
 */
export async function uploadPaste(content, opts = {}) {
  const { fetchImpl = fetch, password, timeoutMs = 15000 } = opts;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const body = { lang: 'plain', content };
    if (password) body.password = password;
    const resp = await fetchImpl(`${PASTE_API}/api/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Referer: `${PASTE_API}/`,
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const text = await resp.text();
    if (!resp.ok) {
      throw new Error(`上传失败 HTTP ${resp.status}: ${text.slice(0, 200)}`);
    }
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`上传响应不是合法 JSON: ${text.slice(0, 200)}`);
    }
    const path = data?.data?.path;
    if (!path) {
      throw new Error(`上传响应缺少 data.path: ${text.slice(0, 200)}`);
    }
    return path;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 根据 path 生成分享链接。
 * @param {string} path 服务端返回的 path
 * @returns {{ pasteLink: string, url: string, checkUrl: string }}
 */
export function buildPasteLinks(path) {
  return {
    pasteLink: `云6oooole/xxxxxx/${path}`,                       // App 内识别格式（海阔：云剪贴板）
    url: `${PASTE_API}/xxxxxx/${path}`,                          // 网页标准格式
    checkUrl: `${PASTE_API}/api/getContent/${path}`,             // 直接读内容
  };
}

/**
 * 一键：规则 → 口令 → 上传 → 链接。
 * @param {object} rule 规则对象
 * @param {object} [opts]
 * @param {string} [opts.name] 口令中的规则名（默认 rule.title）
 * @param {Function} [opts.fetchImpl] 注入请求实现（测试用）
 * @returns {Promise<{ pasteText: string, path: string, links: object }>}
 */
export async function shareRuleToPaste(rule, opts = {}) {
  const name = opts.name || rule?.title;
  const pasteText = buildRulePasteText(rule, name);
  const path = await uploadPaste(pasteText, opts);
  return { pasteText, path, links: buildPasteLinks(path) };
}