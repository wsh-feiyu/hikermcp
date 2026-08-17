import { z } from 'zod';
import { normalizeRule } from '../ruleNormalize.js';
import { shareRuleToPaste, uploadPaste, buildPasteLinks } from '../paste-share.js';

/**
 * 未连接 App 时的规则分享工具。
 *
 * 当前提供：
 *   export_rule_json —— 把规则导出为 JSON 文本（一行大 JSON / 美化版），
 *                       用户复制或保存为 .json 文件后导入海阔视界 App。
 *
 * 云剪贴板分享（share_rule_paste，pasteme.tyrantg.com）因网站不稳定已注释停用，
 * 核心函数保留在 src/paste-share.js（buildRulePasteText / uploadPaste 等），
 * 待服务稳定后可重新启用。
 */

export function registerPasteShareTools(server) {
  // ★★★ 云剪贴板分享（云6oooole/pasteme.tyrantg.com）——网站不稳定，暂时注释停用 ★★★
  /*
  server.tool(
    'share_rule_paste',
    '将写好的规则发送到云剪贴板（pasteme.tyrantg.com），返回可导入的分享链接。★适合未连接手机 App 时分享规则：规则自动打包成海阔口令并上传，返回 云6oooole/xxxxxx/{path} 链接，复制到海阔视界 App 即可导入。也可用 content 上传任意文本',
    {
      rule: z.record(z.any()).optional().describe('规则对象（与 save_rule 相同结构）。与 content 二选一'),
      content: z.string().optional().describe('直接上传的文本内容（与 rule 二选一；用于分享非规则文本）'),
      name: z.string().optional().describe('口令中的规则名（默认取 rule.title）'),
    },
    async ({ rule, content, name }) => {
      try {
        if (rule) {
          const r = await shareRuleToPaste(rule, { name });
          return {
            content: [
              {
                type: 'text',
                text:
                  `✅ 规则「${name || rule.title}」已上传云剪贴板\n\n` +
                  `📋 分享链接（复制到海阔视界 App 即可导入）：\n${r.links.pasteLink}\n\n` +
                  `🌐 网页格式：${r.links.url}\n` +
                  `🔍 内容核验：${r.links.checkUrl}\n\n` +
                  `（口令内容共 ${r.pasteText.length} 字符）`,
              },
            ],
          };
        }
        if (content !== undefined && content !== null && content !== '') {
          const path = await uploadPaste(content);
          const { pasteLink, url, checkUrl } = buildPasteLinks(path);
          return {
            content: [
              {
                type: 'text',
                text: `✅ 文本已上传云剪贴板\n\n📋 分享链接：${pasteLink}\n\n🌐 网页格式：${url}\n🔍 内容核验：${checkUrl}`,
              },
            ],
          };
        }
        return {
          content: [{ type: 'text', text: '请提供 rule（规则对象）或 content（文本内容）。' }],
          isError: true,
        };
      } catch (e) {
        return {
          content: [{ type: 'text', text: `分享到云剪贴板失败: ${e.message}` }],
          isError: true,
        };
      }
    }
  );
  */

  // 导出规则为 JSON（未连接 App 时的推荐分享方式）
  server.tool(
    'export_rule_json',
    '未连接手机 App 时，把写好的规则导出为 JSON 文本供导入：返回「一行大 JSON」（复制粘贴到 App 导入规则框即可）与美化版（可保存为 .json 文件再导入）。页面子页面字段统一为 pages，自动序列化',
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