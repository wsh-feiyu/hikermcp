import { z } from 'zod';
import { normalizeRule } from '../ruleNormalize.js';
import { shareRuleToCloud, shareToCloud } from '../paste-share.js';

/**
 * 未连接 App 时的规则分享工具。
 *
 * 云分享（share_rule_paste）：仅当用户明确要求「上传云分享 / 云剪贴板」时调用。
 *   云5（cmd.im）优先 → 不在线自动兜底云6（pasteme.tyrantg.com）→ 都不在线提示不可用。
 * JSON 导出（export_rule_json）：云分享不可用或不要求云分享时，导出 JSON 文件给用户。
 */

export function registerPasteShareTools(server) {
  // 云分享（云5 优先、云6 兜底）
  server.tool(
    'share_rule_paste',
    '云分享：把规则/文本上传到云剪贴板，返回可导入链接（云5oooole/{path} 或 云6oooole/xxxxxx/{path}）。★仅在用户明确要求「上传云分享/云剪切板」时调用；优先云5(cmd.im)，云5不可用自动兜底云6(pasteme)，都不在线则返回不可用并建议 export_rule_json 导出文件',
    {
      rule: z.record(z.any()).optional().describe('规则对象（与 save_rule 相同结构）。与 content 二选一'),
      content: z.string().optional().describe('直接上传的文本内容（与 rule 二选一；用于分享非规则文本/口令）'),
      name: z.string().optional().describe('口令中的规则名（默认取 rule.title）'),
    },
    async ({ rule, content, name }) => {
      try {
        if (rule) {
          const r = await shareRuleToCloud(rule, { name });
          return { content: [{ type: 'text', text: cloudResultText(r, name || rule.title) }] };
        }
        if (content !== undefined && content !== null && content !== '') {
          const r = await shareToCloud(content);
          return { content: [{ type: 'text', text: cloudResultText(r) }] };
        }
        return {
          content: [{ type: 'text', text: '请提供 rule（规则对象）或 content（文本内容）。' }],
          isError: true,
        };
      } catch (e) {
        return {
          content: [
            {
              type: 'text',
              text: `云分享失败: ${e.message}\n` +
                `建议改用 export_rule_json 导出 JSON 文件（一行大 JSON 复制粘贴 / 美化版存 .json）给用户导入。`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // 导出规则为 JSON（云分享不可用/不需要时的推荐方式）
  server.tool(
    'export_rule_json',
    '未连接手机 App 时，把写好的规则导出为 JSON 文本供导入：返回「一行大 JSON」（复制粘贴到 App 导入规则框即可）与美化版（可保存为 .json 文件再导入）。页面子页面字段统一为 pages，自动序列化。云分享不可用时推荐此方式',
    {
      rule: z.record(z.any()).describe('规则对象（与 save_rule 相同结构；pages 子页面可为数组或字符串，自动序列化）'),
      pretty: z.boolean().optional().describe('是否同时输出美化版 JSON（默认 true，便于查看/保存为文件）'),
    },
    async ({ rule, pretty = true }) => {
      try {
        const normalized = normalizeRule(rule);
        const oneLine = JSON.stringify(normalized);
        const parts = [`✅ 规则「${normalized.title}」已导出为 JSON，可直接导入海阔视界 App\n`];
        parts.push(
          `【方式一：复制粘贴导入】将下面这一整行复制到 App「导入规则」粘贴框：\n` +
          '```\n' + oneLine + '\n```'
        );
        if (pretty) {
          parts.push(
            `【方式二：保存为 .json 文件】将下面内容保存为「${normalized.title}.json」，再通过 App 的 URL/文件导入：\n` +
            '```json\n' + JSON.stringify(normalized, null, 2) + '\n```'
          );
        }
        parts.push(`（JSON 共 ${oneLine.length} 字符${normalized.pages ? `，含 ${JSON.parse(normalized.pages).length} 个子页面` : ''}）`);
        return { content: [{ type: 'text', text: parts.join('\n\n') }] };
      } catch (e) {
        return { content: [{ type: 'text', text: `导出失败: ${e.message}` }], isError: true };
      }
    }
  );
}

function cloudResultText(r, title) {
  const head = r.provider === 'cmd' ? '云5(cmd.im)' : '云6(pasteme)';
  const tag = title ? `规则「${title}」` : '文本';
  return (
    `✅ ${tag}已通过${head}上传云剪贴板\n\n` +
    `📋 分享链接（复制到海阔视界 App 即可导入）：\n${r.links.pasteLink}\n\n` +
    `🌐 网页格式：${r.links.url}\n` +
    `🔍 内容核验：${r.links.checkUrl}`
  );
}