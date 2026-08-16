import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXAMPLES_DIR = path.join(__dirname, '..', '..', 'examples');
const DOCS_DIR = path.join(__dirname, '..', '..', 'docs');

/**
 * 内置示例规则与文档工具。
 *
 * 这些示例来自真实的海阔视界规则，供 AI 学习规则结构：
 * - 河马影视：精品单规则，演示 startProxyServer 实现 m3u8 实时签名代理
 * - 云帧享：精品单规则，演示 Java 包调用（AES-GCM 解密）与远程 lib
 * - 聚阅：大型聚合规则，演示远程代码库加载（config + require）
 * - 青豆剧场：巨型聚合规则（精简版），演示 44 页面结构与内置代码库
 */

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

/**
 * 列出内置示例文件（examples 目录可选，可缺失；缺失时返回空数组）。
 */
function listExampleFiles() {
  if (!fs.existsSync(EXAMPLES_DIR)) return [];
  return fs
    .readdirSync(EXAMPLES_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''));
}

export function registerExampleTools(server) {
  // 列出内置示例规则
  server.tool(
    'list_examples',
    '列出内置的海阔视界示例规则（河马影视/云帧享/聚阅/青豆剧场），供 AI 学习规则结构；未放置示例时返回空',
    {},
    async () => {
      const files = listExampleFiles();
      if (!files.length) {
        return {
          content: [{ type: 'text', text: '内置示例规则目录（examples/）不存在或为空。写源请参考官方帮助手册（hiker-help）与写源模板（blueprint）。' }],
        };
      }
      const meta = files.map((name) => {
        try {
          const rule = readJson(path.join(EXAMPLES_DIR, `${name}.json`));
          return {
            name,
            title: rule.title,
            author: rule.author,
            type: rule.type,
            version: rule.version,
            group: rule.group,
            pageCount: rule.pages ? (typeof rule.pages === 'string' ? JSON.parse(rule.pages).length : rule.pages.length) : 0,
          };
        } catch {
          return { name };
        }
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(meta, null, 2) }],
      };
    }
  );

  // 读取示例规则
  server.tool(
    'get_example_rule',
    '读取内置示例规则的完整内容。可指定只读取某个子页面（pages 中的 path）以节省上下文',
    {
      name: z.string().describe('示例规则名：河马影视 / 云帧享 / 聚阅 / 青豆剧场_精简'),
      page: z.string().optional().describe('可选。只返回 pages 中指定 path 的页面代码，如 "hmhome"、"tools"、"erji"、"function"'),
      includePages: z.boolean().optional().describe('可选。是否包含全部 pages（默认 true；巨型规则建议设为 false 只看顶层结构）'),
    },
    async ({ name, page, includePages = true }) => {
      try {
        const file = path.join(EXAMPLES_DIR, `${name}.json`);
        if (!fs.existsSync(file)) {
          return {
            content: [{ type: 'text', text: `示例规则不存在: ${name}。可用: ${listExampleFiles().join(', ')}` }],
            isError: true,
          };
        }
        const rule = readJson(file);

        // 只读取指定页面
        if (page) {
          let pages = rule.pages;
          if (typeof pages === 'string') pages = JSON.parse(pages);
          const target = pages.find((p) => p.path === page || p.name === page);
          if (!target) {
            return {
              content: [
                {
                  type: 'text',
                  text: `页面不存在: ${page}。可用页面: ${pages.map((p) => p.path).join(', ')}`,
                },
              ],
              isError: true,
            };
          }
          return {
            content: [
              {
                type: 'text',
                text: `# ${rule.title} / ${target.name} (${target.path})\n\n${target.rule}`,
              },
            ],
          };
        }

        // 不包含 pages 时只返回顶层结构
        if (!includePages) {
          const { pages, ...rest } = rule;
          let pageMeta = [];
          if (pages) {
            const arr = typeof pages === 'string' ? JSON.parse(pages) : pages;
            pageMeta = arr.map((p) => ({
              name: p.name,
              path: p.path,
              col_type: p.col_type,
              ruleLength: p.rule ? p.rule.length : 0,
            }));
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ ...rest, pages: pageMeta }, null, 2),
              },
            ],
          };
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(rule, null, 2) }],
        };
      } catch (e) {
        return { content: [{ type: 'text', text: `读取示例失败: ${e.message}` }], isError: true };
      }
    }
  );

  // 读取规则编写文档
  server.tool(
    'get_rule_docs',
    '获取海阔视界规则编写文档，帮助编写合规规则',
    {
      doc: z.string().optional().describe('文档名：hiker-help(官方帮助手册：JS API/链接协议/选择器/col_type/标识/网页桥接，通用标准) / blueprint(写源模板手册，AI写源必读) / qingdou-guide(青豆框架编写指南，仅写青豆规则时参考) / qingdou-skill(青豆SKILL，仅写青豆规则时参考) / suggestions(代码片段) / hiker-dts(API类型声明) / source-formats(原生源格式参考) / save-format(一行大JSON导入转化详解)'),
    },
    async ({ doc = 'hiker-help' }) => {
      const map = {
        'hiker-help': 'hiker-help.md',
        blueprint: 'source-blueprint.md',
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
