import { z } from 'zod';
import { shareRuleToPaste, uploadPaste, buildPasteLinks } from '../paste-share.js';

/**
 * 云剪贴板分享工具。
 *
 * 未连接手机 App 时，把写好的规则发送到云剪贴板（pasteme.tyrantg.com），
 * 返回分享链接，用户复制到手机即可导入。
 */

export function registerPasteShareTools(server) {
  // 分享规则到云剪贴板
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
}