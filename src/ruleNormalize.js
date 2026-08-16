/**
 * 规则对象规范化：保证 pageList（数组）与 pages（JSON 字符串）双向映射同时存在。
 *
 * 海阔视界 App 要求：
 * - 保存时需同时接收 pageList（数组）和 pages（字符串），否则子页面丢失
 * - 读取时 pageList 可能为空，需要从 pages 字符串反解
 */
export function normalizeRule(rule) {
  const r = { ...rule };

  if (Array.isArray(r.pageList) && r.pageList.length) {
    // 数组 → 补 pages 字符串
    r.pages = JSON.stringify(r.pageList);
  } else if (typeof r.pages === 'string' && r.pages) {
    // 字符串 → 反向补 pageList
    try {
      r.pageList = JSON.parse(r.pages);
    } catch {
      r.pageList = [];
    }
  } else {
    r.pageList = r.pageList || [];
    r.pages = r.pages || '[]';
  }

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
 * 1. 所有被 $.require('X') 引用的模块必须存在于 pageList
 * 2. 每个子页面 rule 非空且以 //js: 开头
 * 3. 被 $.require 引用的模块页必须有 $.exports 导出
 * 4. 壳页面（无 $.exports）不强制导出，避免误报
 *
 * @param {object} normalized - 经 normalizeRule 处理后的规则对象
 * @throws {Error} 当校验不通过时抛出详细错误信息
 */
export function assertUsableRule(normalized) {
  const pages = normalized.pageList || [];
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

  // 2) 每个被引用模块必须存在于 pageList
  for (const name of required) {
    if (!pathMap[name]) {
      throw new Error(`引用了未定义模块「${name}」，请将其加入 pageList 或修正 $.require 引用`);
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