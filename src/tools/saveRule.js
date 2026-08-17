/**
 * 保存规则工具：保存前规范化、复用校验、经统一通道提交。
 *
 * v2 改进：校验时传入 normalizeRule 后的对象，确保 save 和 validate 的输入经过同一规范化处理。
 *
 * 与旧的 hiker-api.js saveRule 不同：
 * - 使用 postToApp（JSON content-type）而非 form-urlencoded
 * - 使用 normalizeRule 统一为 pages（字符串）形态提交，兼容旧 pageList 输入
 * - 可选前置校验（validate=true），与 save 共用同一序列化基线
 */

import { postToApp } from '../appApi.js';
import { normalizeRule } from '../ruleNormalize.js';
import { validateRule } from './validateRule.js';

/**
 * 保存规则到海阔视界 App。
 *
 * @param {object} params
 * @param {object} params.rule - 完整规则对象
 * @param {boolean} [params.validate=true] - 保存前是否校验
 * @returns {Promise<{ ok: boolean, message: string, detail?: object }>}
 */
export async function saveRule({ rule, validate = true }) {
  // 先规范化，确保校验和保存使用同一基线
  const normalized = normalizeRule(rule);

  // 保存前校验，与 save 共用同一序列化基线
  if (validate) {
    const vr = await validateRule({ rule: normalized });
    if (!vr.ok) {
      return {
        ok: false,
        message: `规则校验未通过:\n${vr.errors.join('\n')}`,
        errors: vr.errors,
      };
    }
  }

  // 提交规范化后的对象
  const result = await postToApp('/saveRule', normalized);

  return {
    ok: true,
    message: `保存成功: ${rule.title}`,
    detail: result,
  };
}