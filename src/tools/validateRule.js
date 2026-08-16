/**
 * 规则校验工具：与 save 共用同一序列化基线。
 *
 * 保证「校验通过 = 一定能保存」—— 校验时用 normalizeRule + JSON.stringify
 * 做一次干跑，确保产出的请求体是合法 JSON 且能往返。
 *
 * v2 新增：assertUsableRule 强校验，拦截「纯搜索小程序」、模块缺失、导出缺失等不可用规则。
 */

import { normalizeRule, assertUsableRule } from '../ruleNormalize.js';
import { validateRuleJson, validateRuleCode } from './format.js';

/**
 * 检查「返回结果提交方式」的软警告。
 *
 * 背景：海阔原生 js: 格式的 find_rule/searchFind 是整段 eval 执行的代码，
 * 结尾必须 setResult(d) 提交列表；而 var Rule 框架风格才用 return d。
 * AI 写源常混用（js: 格式里写 return list），导致列表不出数据——规则本身能保存，但不可用。
 *
 * 这里只产出 warning（不阻塞保存），命中即提示，避免误报阻断合法规则。
 */
function checkSubmissionWarnings(rule) {
  const warnings = [];

  // 剥离 js: 前缀后的代码主体（保留内部 return 语义，仅做启发式检查）
  const bodyOf = (code) => (code || '').replace(/^js:\s*/, '');

  const check = (name, code) => {
    if (!code || !code.startsWith('js:')) return;
    const body = bodyOf(code);

    // 场景 A：有 push() 构建列表（d.push/list.push/arr.push/data.push/items.push 等），
    //         但全代码没有任何 setResult 调用 → 结果根本不会提交
    const hasSetResult = /setResult\s*\(/.test(body);
    const buildsList = /(?:d|list|arr|data|items|res)\.push\s*\(/.test(body);
    if (buildsList && !hasSetResult) {
      warnings.push(
        `[${name}] 检测到 push( 构建列表，但全代码未调用 setResult(d)：` +
        `原生 js: 格式的 find_rule 结尾必须 setResult(d) 提交结果，写 return 无效` +
        `（若这是 var Rule 框架中的函数体，请改用 return，勿混用）`
      );
    }

    // 场景 B：代码以顶层 return d/list/result 结尾且无 setResult → eval 中 return 无效
    const tail = body.trimEnd().slice(-160);
    const returnsAtTail = /(?:^|[;}\s])return\s+(?:d|list|result|data|arr|items)\s*;?\s*$/.test(tail);
    if (returnsAtTail && !hasSetResult) {
      warnings.push(
        `[${name}] 代码以 return 结尾：海阔原生 js: 格式是整段 eval 执行，` +
        `return 不会把列表交给 App，必须改为 setResult(d) 提交`
      );
    }
  };

  check('find_rule', rule.find_rule);
  check('searchFind', rule.searchFind);
  return warnings;
}

/**
 * 校验规则对象。
 * 同时做四件事 + 一项软检查：
 * 1. 结构校验（字段完整性、type 合法性）
 * 2. 代码语法校验（find_rule / searchFind / pages 内 JS 代码）
 * 2.5 软警告：返回结果提交方式（js: 格式是否 setResult(d) 结尾 / 是否误用 return list）
 * 3. 强校验：拦截「纯搜索小程序」、模块缺失、导出缺失等不可用规则
 * 4. 序列化干跑（与 save 完全一致的 JSON.stringify，确保无双重转义风险）
 *
 * @param {object} params - { rule }
 * @returns {Promise<{ ok: boolean, errors: string[], warnings: string[], bodyLength?: number }>}
 */
export async function validateRule({ rule }) {
  const errors = [];

  // 1) 结构校验
  const jr = validateRuleJson(rule);
  if (!jr.ok) {
    errors.push(...jr.errors);
  } else {
    // 2) 代码语法校验（仅结构通过后才做，避免无意义报错）
    const cr = validateRuleCode(rule);
    if (!cr.ok) {
      errors.push(...cr.errors);
    }
  }

  // 先规范化，后面的强校验和序列化干跑都在规范化后的对象上操作
  const normalized = normalizeRule(rule);

  // 2.5) 软警告：返回结果提交方式检查（不阻塞，仅提示）
  const warnings = checkSubmissionWarnings(normalized);

  // 3) 强校验：拦截「纯搜索小程序」、模块缺失、导出缺失等不可用规则
  //    即使结构校验有错误，也做强校验以提供更完整的错误信息
  try {
    assertUsableRule(normalized);
  } catch (e) {
    errors.push(e.message);
  }

  // 4) 序列化干跑：用与 save 完全一致的方式，确保能产出合法请求体
  try {
    const body = JSON.stringify(normalized);
    // 确认能往返（无双重转义风险）
    const roundtrip = JSON.parse(body);
    // 验证关键字段不丢失
    if (normalized.title && !roundtrip.title) {
      errors.push('序列化后 title 字段丢失');
    }

    return {
      ok: errors.length === 0,
      errors,
      warnings,
      bodyLength: body.length,
    };
  } catch (e) {
    errors.push(`序列化失败: ${e.message}`);
    return { ok: false, errors, warnings };
  }
}