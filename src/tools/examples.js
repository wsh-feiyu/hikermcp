import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.join(__dirname, '..', '..', 'docs');

/**
 * 规则编写文档工具（get_rule_docs）。
 *
 * 文档体系（写源参考顺序）：
 *   hiker-help      官方帮助手册（App 内置开发者手册整合：JS API/链接协议/选择器/col_type/标识/网页桥接）——通用标准
 *   blueprint       写源模板手册（基于 361 条真实规则实证：主页/分类/二级/详情/解析 + 各类型模板 + 反例清单）——AI 写源必读
 *   video-template  视频源写源模板（模块化框架：顶层 JSON + 子页面模块 + 多线路选集，复杂视频源专用）
 *   qingdou-guide   青豆框架规则编写指南（仅写青豆规则时参考）
 *   qingdou-skill   青豆 SKILL（仅写青豆规则时参考）
 *   hiker-dts       API 类型声明
 *   hiker-api-index API 速查索引
 *   save-format     一行大 JSON 导入与 pages 转化
 *   suggestions     代码片段建议
 */

export function registerExampleTools(server) {
  // 读取规则编写文档
  server.tool(
    'get_rule_docs',
    '获取海阔视界规则编写文档。★大文档（如 hiker-dts 80KB）务必带 keyword 精准提取，不要一次读全文：先看 hiker-api-index 索引定位 API 名，再 get_rule_docs({doc:"hiker-dts", keyword:"函数名"})',
    {
      doc: z.string().optional().describe('文档名：hiker-help(官方帮助手册) / blueprint(写源模板手册，AI写源必读) / video-template(视频源写源模板) / qingdou-guide / qingdou-skill(青豆专用) / hiker-dts(API类型声明，80KB 大文件，必须配 keyword 使用) / hiker-api-index(API速查索引，9KB 先看这个定位函数名) / save-format / suggestions'),
      keyword: z.string().optional().describe('可选。只返回文档中包含该关键词的行及其上下文（前后各 contextLines 行），避免一次读大文档。空格分隔多词表示「同时包含」'),
      contextLines: z.number().int().min(0).max(20).optional().describe('关键词命中行前后各返回的行数，默认 3'),
    },
    async ({ doc = 'hiker-help', keyword, contextLines }) => {
      const map = {
        'hiker-help': 'hiker-help.md',
        blueprint: 'source-blueprint.md',
        'video-template': 'hiker-video-write-template.md',
        'qingdou-guide': 'qingdou-guide.md',
        'qingdou-skill': 'qingdou-skill.md',
        suggestions: 'suggestions.js',
        'hiker-dts': 'hiker.d.ts',
        'hiker-api-index': 'hiker-api-index.md',
        'save-format': 'save-format.md',
      };
      const file = map[doc];
      if (!file) {
        return {
          content: [{ type: 'text', text: `文档不存在: ${doc}。可用: ${Object.keys(map).join(', ')}` }],
          isError: true,
        };
      }
      try {
        const content = fs.readFileSync(path.join(DOCS_DIR, file), 'utf-8');

        // ★ 精准提取：只返回关键词命中行 ± 上下文，避免大文档（hiker-dts 80KB）整篇读取
        if (keyword) {
          const lines = content.split('\n');
          const terms = String(keyword).split(/\s+/).filter(Boolean).map((t) => t.toLowerCase());
          const hitIdx = [];
          for (let i = 0; i < lines.length; i++) {
            const low = lines[i].toLowerCase();
            if (terms.every((t) => low.includes(t))) hitIdx.push(i);
          }
          if (!hitIdx.length) {
            return {
              content: [
                {
                  type: 'text',
                  text: `文档「${doc}」(${lines.length} 行)中没有匹配「${keyword}」的内容。\n` +
                    `建议：1) 换更短的关键词 2) 先看 hiker-api-index 索引定位正确 API 名 3) 不传 keyword 读全文`,
                },
              ],
              isError: true,
            };
          }
          const ctx = contextLines ?? 3;
          const blocks = [];
          let start = -1, end = -1;
          for (const h of hitIdx) {
            const s = Math.max(0, h - ctx);
            const e = Math.min(lines.length, h + ctx + 1);
            if (s <= end) end = e;
            else {
              if (end > start) blocks.push(lines.slice(start, end).join('\n'));
              start = s; end = e;
            }
          }
          if (end > start) blocks.push(lines.slice(start, end).join('\n'));
          return {
            content: [
              {
                type: 'text',
                text:
                  `文档「${doc}」匹配「${keyword}」的 ${hitIdx.length} 处（第 ${hitIdx.map((i) => i + 1).join(', ')} 行，共 ${lines.length} 行，已只返回命中上下文）：\n\n` +
                  blocks.join('\n\n---\n\n') +
                  `\n\n提示：上下文不够可调大 contextLines；换关键词继续提取；看全局用 hiker-api-index 索引（doc 不配 keyword）。`,
              },
            ],
          };
        }

        return { content: [{ type: 'text', text: content }] };
      } catch (e) {
        return { content: [{ type: 'text', text: `读取文档失败: ${e.message}` }], isError: true };
      }
    }
  );
}