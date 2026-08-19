import prettier from 'prettier';
import { parse as acornParse } from 'acorn';

/**
 * 规则 / JS 插件代码的格式化与校验
 *
 * 与浏览器插件一致：使用 Prettier（standalone + babel parser）格式化。
 * 海阔视界规则代码是 JS 方言，通常以 "js:" 前缀开头，格式化前需剥离。
 */

const JS_PREFIX = /^js:\s*/;

/**
 * 剥离 "js:" 前缀（若有）
 */
export function stripJsPrefix(code) {
  return code.replace(JS_PREFIX, '');
}

/**
 * 格式化海阔视界规则代码
 * @param {string} code 原始代码（可能带 js: 前缀）
 * @param {object} [opts] prettier 选项
 */
export async function formatHikerCode(code, opts = {}) {
  const clean = stripJsPrefix(code);
  const formatted = await prettier.format(clean, {
    parser: 'babel',
    singleQuote: true,
    trailingComma: 'es5',
    semi: true,
    printWidth: 160,
    ...opts,
  });
  // 保留 js: 前缀（若原代码有）
  return code.startsWith('js:') ? 'js:' + formatted : formatted;
}

/**
 * 校验 JS 语法（acorn 解析）
 * @returns {{ok: boolean, errors: Array<{line,column,message}>}}
 */
export function validateJsSyntax(code) {
  const clean = stripJsPrefix(code);
  const errors = [];
  try {
    acornParse(clean, {
      ecmaVersion: 'latest',
      sourceType: 'script',
      allowReturnOutsideFunction: true,
      allowHashBang: true,
    });
  } catch (e) {
    const loc = e.loc || {};
    errors.push({
      line: loc.line || 0,
      column: loc.column || 0,
      message: e.message,
    });
  }
  return { ok: errors.length === 0, errors };
}

/**
 * 官方 type 枚举（与 App 内置开发者手册一致）。
 * 来源：官方 help 文档 —— type TYPE<['all','video','music','live','cartoon','read','picture','news','tool','other']>
 */
export const RULE_TYPES = ['all', 'video', 'music', 'live', 'cartoon', 'read', 'picture', 'news', 'tool', 'other'];

/**
 * 校验规则 JSON 结构（顶层字段 + pages 字段）
 * @returns {{ok: boolean, errors: string[]}}
 */
export function validateRuleJson(rule) {
  const errors = [];
  if (!rule || typeof rule !== 'object') {
    return { ok: false, errors: ['规则不是有效对象'] };
  }
  if (!rule.title) errors.push('缺少必填字段 title');
  if (rule.type && !RULE_TYPES.includes(rule.type)) {
    errors.push(`type 字段值异常: ${rule.type}（合法值: ${RULE_TYPES.join('/')}）`);
  }
  if (rule.pages !== undefined) {
    if (typeof rule.pages === 'string') {
      try {
        const pages = JSON.parse(rule.pages);
        if (!Array.isArray(pages)) errors.push('pages 字段应为数组');
      } catch {
        errors.push('pages 字段不是合法 JSON 字符串');
      }
    } else if (!Array.isArray(rule.pages)) {
      errors.push('pages 字段应为数组或 JSON 字符串');
    }
  }
  return { ok: errors.length === 0, errors };
}

/**
 * 校验规则代码（find_rule / searchFind / preRule / pages 内 rule）
 * @returns {{ok: boolean, errors: Array}}
 */
export function validateRuleCode(rule) {
  const errors = [];
  const check = (name, code) => {
    if (code && code.startsWith('js:')) {
      const r = validateJsSyntax(code);
      if (!r.ok) {
        r.errors.forEach((e) => errors.push(`[${name}] 第${e.line}行: ${e.message}`));
      }
    }
  };
  check('find_rule', rule.find_rule);
  check('searchFind', rule.searchFind);
  check('preRule', rule.preRule);
  if (rule.pages) {
    let pages = rule.pages;
    if (typeof pages === 'string') {
      try {
        pages = JSON.parse(pages);
      } catch {
        return { ok: false, errors: [...errors, 'pages 字段不是合法 JSON'] };
      }
    }
    if (Array.isArray(pages)) {
      pages.forEach((p, i) => {
        if (p && p.rule) check(`pages[${i}].${p.name || p.path}`, p.rule);
      });
    }
  }
  return { ok: errors.length === 0, errors };
}
