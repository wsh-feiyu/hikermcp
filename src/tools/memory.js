import { z } from 'zod';
import { addLesson, findLessons, listLessons, removeLesson, memoryFilePath } from '../memory.js';

/**
 * 经验记忆 MCP 工具。
 *
 * 闭环：写源前 recall_lessons 查历史教训 → 写源 → 校验/实测发现问题后
 * remember_lesson 记录 → 下次写源前再次命中，避免重复犯错。
 */

export function registerMemoryTools(server) {
  // 记录教训
  server.tool(
    'remember_lesson',
    '记录一条写源经验教训到本地记忆库（memory/lessons.json）。★当写源/校验/实测发现问题时立即记录（问题/原因/正确做法/关键词），下次写源前用 recall_lessons 检索即可避免重犯。同问题自动去重更新',
    {
      problem: z.string().describe('问题描述（必填，如「图片源 type 写 picture 被校验器拒绝」）'),
      cause: z.string().optional().describe('根因（如「校验器 type 白名单不完整」）'),
      fix: z.string().optional().describe('正确做法/教训，建议含代码示例（如「type 白名单已修复，直接用 picture」）'),
      keywords: z.array(z.string()).optional().describe('场景关键词（站点类型/API名/技术点，如 ["picture","图片源","type"]）'),
      title: z.string().optional().describe('一句话标题（默认取 problem 前 40 字）'),
    },
    async ({ problem, cause, fix, keywords, title }) => {
      try {
        const r = addLesson({ problem, cause, fix, keywords, title });
        return {
          content: [
            {
              type: 'text',
              text:
                `✅ 教训已${r.added === 'updated' ? '更新' : '记录'}（id: ${r.lesson.id}）\n` +
                `📌 ${r.lesson.title}\n` +
                `${r.lesson.keywords?.length ? `🏷️ 关键词: ${r.lesson.keywords.join('、')}\n` : ''}` +
                (r.lesson.fix ? `💡 做法: ${r.lesson.fix}\n` : '') +
                `\n下次写源前调用 recall_lessons 即可再次命中此教训。`,
            },
          ],
        };
      } catch (e) {
        return { content: [{ type: 'text', text: `记录教训失败: ${e.message}` }], isError: true };
      }
    }
  );

  // 检索教训
  server.tool(
    'recall_lessons',
    '按关键词检索历史写源经验教训（本地记忆库）。★写源前必查：传入源类型/技术点/API 名等关键词，命中历史教训先对照，避免重犯。命中自动累计次数',
    {
      keyword: z.string().describe('检索关键词，如 "picture 图片源"、"setResult"、"pages"、"startProxyServer"；空格分隔多词，任一词命中即返回'),
      limit: z.number().int().min(1).max(20).optional().describe('返回条数上限，默认 5'),
    },
    async ({ keyword, limit }) => {
      try {
        const hits = findLessons(keyword, limit);
        if (!hits.length) {
          return { content: [{ type: 'text', text: `记忆库中没有匹配「${keyword}」的教训。若本次遇到新问题，完成后用 remember_lesson 记录，下次即可命中。` }] };
        }
        const lines = hits.map(
          (l, i) =>
            `${i + 1}. ${l.title}\n` +
            `   id: ${l.id} | 命中 ${l.hitCount} 次 | ${(l.updatedAt || l.createdAt || '').slice(0, 10)}\n` +
            `   问题: ${l.problem}\n` +
            (l.cause ? `   原因: ${l.cause}\n` : '') +
            (l.fix ? `   💡做法: ${l.fix}\n` : '') +
            (l.keywords?.length ? `   🏷️ ${l.keywords.join('、')}\n` : '')
        );
        return { content: [{ type: 'text', text: `匹配「${keyword}」的 ${hits.length} 条教训：\n\n${lines.join('\n')}` }] };
      } catch (e) {
        return { content: [{ type: 'text', text: `检索失败: ${e.message}` }], isError: true };
      }
    }
  );

  // 列出全部教训
  server.tool(
    'list_lessons',
    `列出经验记忆库中的全部教训（按命中次数/更新时间排序）。记忆库文件: ${memoryFilePath()}`,
    {
      limit: z.number().int().min(1).max(100).optional().describe('返回条数上限，默认 20'),
    },
    async ({ limit }) => {
      try {
        const all = listLessons();
        if (!all.length) {
          return { content: [{ type: 'text', text: '经验记忆库为空。遇到写源问题时用 remember_lesson 记录，下次即可复用。' }] };
        }
        const show = all.slice(0, limit ?? 20);
        const lines = show.map(
          (l, i) =>
            `${i + 1}. ${l.title}   [命中 ${l.hitCount} 次 | ${(l.updatedAt || l.createdAt || '').slice(0, 10)}]\n` +
            `   id: ${l.id}` +
            (l.keywords?.length ? ` | 🏷️ ${l.keywords.join('、')}` : '') +
            `\n   ${l.problem.slice(0, 80)}${l.problem.length > 80 ? '…' : ''}`
        );
        return { content: [{ type: 'text', text: `经验记忆共 ${all.length} 条${all.length > show.length ? `，显示前 ${show.length}` : ''}：\n\n${lines.join('\n')}` }] };
      } catch (e) {
        return { content: [{ type: 'text', text: `列出失败: ${e.message}` }], isError: true };
      }
    }
  );

  // 删除教训
  server.tool(
    'forget_lesson',
    '按 id 删除一条经验教训（id 从 recall_lessons / list_lessons 获取）。过时/错误教训可清理',
    {
      id: z.string().describe('要删除的教训 id'),
    },
    async ({ id }) => {
      try {
        const ok = removeLesson(id);
        return {
          content: [{ type: 'text', text: ok ? `已删除教训 ${id}` : `未找到教训 ${id}（可能已删除）` }],
          isError: !ok,
        };
      } catch (e) {
        return { content: [{ type: 'text', text: `删除失败: ${e.message}` }], isError: true };
      }
    }
  );
}