/**
 * 规则对象规范化：子页面字段统一以 `pages` 为准（JSON 字符串，与 App 落库一致）。
 *
 * 说明（2026-08 修订）：
 * - 海阔视界 App 落库字段就是 `pages`（字符串，articlelistrule.pages），规则对象里
 *   不需要 `pageList` 字段
 * - MCP 输入兼容旧写法：规则里写 `pageList`（数组）会被自动转成 `pages` 字符串后输出
 * - 输出对象**不再包含 pageList**，统一为 pages 字符串（避免 App 端字段歧义）
 */

/**
 * 解析子页面字段为数组（兼容字符串与数组输入）。
 * @param {string|Array} pages pages 字段（JSON 字符串或数组）
 * @returns {Array<object>}
 */
export function parsePages(pages) {
  if (!pages) return [];
  if (Array.isArray(pages)) return pages;
  try {
    const v = JSON.parse(pages);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

/**
 * 规则对象规范化：输出统一含 pages（JSON 字符串），不含 pageList。
 *
 * 输入兼容：
 *   - rule.pages 为字符串 → 原样保留（已是落库形态）
 *   - rule.pages 为数组   → 序列化为字符串
 *   - rule.pageList 为数组（旧写法）→ 序列化为 pages 字符串
 *   - 两者皆无 → pages = '[]'
 *
 * @param {object} rule 规则对象
 * @returns {object} 规范化后的规则（含 pages 字符串，不含 pageList）
 */
export function normalizeRule(rule) {
  const r = { ...rule };

  // 优先使用 pages：字符串原样保留，数组转字符串
  if (typeof r.pages === 'string') {
    if (!r.pages) r.pages = '[]';
  } else if (Array.isArray(r.pages)) {
    r.pages = r.pages.length ? JSON.stringify(r.pages) : '[]';
  } else if (Array.isArray(r.pageList)) {
    // 旧写法兼容：pageList 数组 → pages 字符串
    r.pages = r.pageList.length ? JSON.stringify(r.pageList) : '[]';
  } else {
    r.pages = '[]';
  }

  // ★ 统一以 pages 为准，输出不含 pageList（App 落库不识别该字段）
  delete r.pageList;

  return r;
}

/**
 * 收集 JS 代码中所有 $.require('X') 引用的模块名。
 */
function collectRequireRefs(code, set) {
  if (!code) return;
  const refs = code.match(/\$\.require\(['"]([^'"]+)['"]\)/g) || [];
  for (const ref of refs) {
    const m = ref.match(/\$\.require\(['"]([^'"]+)['"]\)/);
    if (m) set.add(m[1]);
  }
}

/**
 * [修复7] 落库前强校验：防止「保存成功但规则不可用」。
 *
 * 检查项：
 * 1. 所有被 $.require('X') 引用的模块必须存在于 pages
 * 2. 每个子页面 rule 非空且以 //js: 开头
 * 3. 被 $.require 引用的模块页必须有 $.exports 导出
 * 4. 壳页面（无 $.exports）不强制导出，避免误报
 *
 * @param {object} normalized - 经 normalizeRule 处理后的规则对象（含 pages 字符串）
 * @throws {Error} 当校验不通过时抛出详细错误信息
 */
export function assertUsableRule(normalized) {
  const pages = parsePages(normalized.pages);
  const pathMap = {};
  for (const p of pages) pathMap[p.path] = p;

  // 1) 收集所有被 $.require('X') 引用的模块名
  const required = new Set();
  const scripts = [
    normalized.find_rule,
    normalized.searchFind,
    normalized.detail_find_rule,
    normalized.sdetail_find_rule,
  ].filter(Boolean);
  for (const s of scripts) collectRequireRefs(s, required);
  for (const p of pages) collectRequireRefs(p.rule, required);

  // 2) 每个被引用模块必须存在于 pages
  for (const name of required) {
    if (!pathMap[name]) {
      throw new Error(`引用了未定义模块「${name}」，请将其加入 pages 或修正 $.require 引用`);
    }
  }

  // 3) 每个子页面 rule 非空 + //js: 前缀
  for (const p of pages) {
    if (!p.rule || !p.rule.trim()) {
      throw new Error(`子页面「${p.name || p.path}」的 rule 为空，会导致「纯搜索小程序」无法打开`);
    }
    if (!/^\/\/js:/.test(p.rule.trim())) {
      throw new Error(`子页面「${p.name || p.path}」的 rule 必须以 //js: 开头，当前开头为: ${p.rule.trim().slice(0, 20)}`);
    }
  }

  // 4) 被引用的模块页必须有 $.exports 导出
  //    仅对被 $.require 引用的模块强制检查，壳页面（如 hiker://page 跳转目标）不强制
  for (const name of required) {
    const p = pathMap[name];
    if (!/\$\.exports\s*=/.test(p.rule)) {
      throw new Error(`模块页「${p.name || p.path}」被 $.require 引用但缺少 $.exports 导出语句`);
    }
  }
}