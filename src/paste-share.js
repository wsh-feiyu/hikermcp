/**
 * 云分享能力（云5 cmd.im + 云6 pasteme）。
 *
 * 场景：用户要求「上传云分享/云剪贴板」时，把写好的规则打包成海阔口令上传，
 * 返回可导入链接（云5oooole/{path} 或 云6oooole/xxxxxx/{path}）。
 *
 * 双通道容灾（优先云5，兜底云6）：
 *  - 云5（cmd.im）: POST https://cmd.im/ 表单 txt=内容，关闭重定向取 Location 头 → 云5oooole/{path}
 *  - 云6（pasteme）: POST https://pasteme.tyrantg.com/api/create JSON → data.path → 云6oooole/xxxxxx/{path}
 *
 * 口令格式（海阔视界可识别）：
 *   海阔视界规则分享，当前分享的是：小程序￥home_rule_v2￥base64://@规则名称@base64编码
 */

import { normalizeRule } from './ruleNormalize.js';

const PASTE_API = 'https://pasteme.tyrantg.com';
const CMD_API = 'https://cmd.im';

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

// ============ 云5（cmd.im） ============

/**
 * 上传文本到云5（cmd.im）。
 * @param {string} content 要上传的文本
 * @param {object} [opts]
 * @param {Function} [opts.fetchImpl=fetch] 注入请求实现（测试用）
 * @param {number} [opts.timeoutMs=15000] 超时毫秒
 * @returns {Promise<string>} 服务端 Location 返回的路径（不含开头斜杠）
 */
export async function uploadCmdIm(content, opts = {}) {
  const { fetchImpl = fetch, timeoutMs = 15000 } = opts;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const resp = await fetchImpl(`${CMD_API}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Origin: CMD_API,
        Referer: `${CMD_API}/`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: new URLSearchParams({ txt: content }).toString(),
      redirect: 'manual', // ★ 关键：关闭自动重定向，服务端用 302 Location 返回路径
      signal: ctrl.signal,
    });
    const status = resp.status;
    const location = resp.headers.get('location');
    if ((status === 301 || status === 302) && location) {
      return location.startsWith('/') ? location.slice(1) : location;
    }
    const body = await resp.text().catch(() => '');
    throw new Error(`云5上传失败 HTTP ${status}，响应无 Location 头: ${body.slice(0, 200)}`);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 从云5返回的 HTML 页面中提取 .test_box 的纯文本。
 * @param {string} html
 * @returns {string}
 */
export function parseCmdImHtml(html) {
  const m = html.match(/<div[^>]*class=["'][^"']*test_box[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  if (!m) throw new Error('云5页面中未找到 .test_box 内容');
  return m[1]
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/**
 * 读取云5内容（GET /{path} → HTML → 提取 .test_box 纯文本）。
 * @param {string} path 上传时返回的路径
 * @param {object} [opts]
 * @returns {Promise<string>}
 */
export async function getCmdImContent(path, opts = {}) {
  const { fetchImpl = fetch, timeoutMs = 15000 } = opts;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const resp = await fetchImpl(`${CMD_API}/${path}`, { signal: ctrl.signal });
    if (!resp.ok) throw new Error(`云5读取失败 HTTP ${resp.status}`);
    return parseCmdImHtml(await resp.text());
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 云5 链接拼装。
 * @param {string} path
 * @returns {{ pasteLink: string, url: string, checkUrl: string }}
 */
export function buildCmdLinks(path) {
  return {
    pasteLink: `云5oooole/${path}`,       // App 内识别格式
    url: `${CMD_API}/${path}`,            // 网页格式
    checkUrl: `${CMD_API}/${path}`,       // 读取接口（返回 HTML，含 .test_box）
  };
}

// ============ 统一云分享入口（云5 优先，云6 兜底） ============

/**
 * 一键云分享：文本 → 优先云5(cmd.im) → 失败兜底云6(pasteme) → 全失败报不可用。
 * @param {string} text 要分享的文本（口令/任意文本）
 * @param {object} [opts]
 * @returns {Promise<{ provider: 'cmd'|'paste', path: string, links: object }>}
 * @throws 两个通道都不可用时抛出带原因的错误
 */
export async function shareToCloud(text, opts = {}) {
  if (!text) throw new Error('分享内容不能为空');
  // 云5 优先
  try {
    const path = await uploadCmdIm(text, opts);
    return { provider: 'cmd', path, links: buildCmdLinks(path) };
  } catch (cmdErr) {
    // 云6 兜底
    try {
      const path = await uploadPaste(text, opts);
      return { provider: 'paste', path, links: buildPasteLinks(path) };
    } catch (pasteErr) {
      throw new Error(
        `云分享服务当前不可用（云5 cmd.im 与云6 pasteme 均不可用）。\n` +
        `云5: ${cmdErr.message}\n云6: ${pasteErr.message}\n` +
        `可改用 export_rule_json 导出 JSON 文件给用户。`
      );
    }
  }
}

/**
 * 一键：规则 → 口令 → 云分享（云5 优先，云6 兜底）。
 * @param {object} rule 规则对象
 * @param {object} [opts]
 * @param {string} [opts.name] 口令中的规则名（默认 rule.title）
 * @returns {Promise<{ pasteText: string, provider: string, path: string, links: object }>}
 */
export async function shareRuleToCloud(rule, opts = {}) {
  const name = opts.name || rule?.title;
  const pasteText = buildRulePasteText(rule, name);
  const r = await shareToCloud(pasteText, opts);
  return { pasteText, ...r };
}