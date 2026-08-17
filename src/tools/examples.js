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
 *   source-formats  原生源格式参考
 *   save-format     一行大 JSON 导入与 pageList↔pages 转化
 *   suggestions     代码片段建议
 */

export function registerExampleTools(server) {
  // 读取规则编写文档
  server.tool(
    'get_rule_docs',
    '获取海阔视界规则编写文档，帮助编写合规规则',
    {
      doc: z.string().optional().describe('文档名：hiker-help(官方帮助手册：JS API/链接协议/选择器/col_type/标识/网页桥接，通用标准) / blueprint(写源模板手册，AI写源必读) / video-template(视频源写源模板：模块化框架，★写视频源/视频小程序优先使用) / qingdou-guide(青豆框架编写指南，仅写青豆规则时参考) / qingdou-skill(青豆SKILL，仅写青豆规则时参考) / hiker-dts(API类型声明) / source-formats(原生源格式参考) / save-format(一行大JSON导入转化详解) / suggestions(代码片段建议)'),
    },
    async ({ doc = 'hiker-help' }) => {
      const map = {
        'hiker-help': 'hiker-help.md',
        blueprint: 'source-blueprint.md',
        'video-template': 'hiker-video-write-template.md',
        'qingdou-guide': 'qingdou-guide.md',
        'qingdou-skill': 'qingdou-skill.md',
        suggestions: 'suggestions.js',
        'hiker-dts': 'hiker.d.ts',
        'source-formats': 'source-formats.html',
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
        return { content: [{ type: 'text', text: content }] };
      } catch (e) {
        return { content: [{ type: 'text', text: `读取文档失败: ${e.message}` }], isError: true };
      }
    }
  );
}