import { z } from 'zod';
import {
  getAllJsTitles,
  getJsContent,
  saveJs,
} from '../hiker-api.js';
import { validateJsSyntax, formatHikerCode } from './format.js';

/**
 * JS 插件相关 MCP 工具
 */

export function registerJsPluginTools(server) {
  // 列出所有 JS 插件
  server.tool(
    'list_js_plugins',
    '获取海阔视界 App 中所有 JS 插件的名称列表',
    {},
    async () => {
      try {
        const titles = await getAllJsTitles();
        const list = Array.isArray(titles) ? titles : [titles];
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ count: list.length, plugins: list }, null, 2),
            },
          ],
        };
      } catch (e) {
        return { content: [{ type: 'text', text: `获取 JS 插件列表失败: ${e.message}` }], isError: true };
      }
    }
  );

  // 获取 JS 插件内容
  server.tool(
    'get_js_plugin',
    '获取指定名称的 JS 插件完整代码',
    {
      name: z.string().describe('JS 插件名称'),
    },
    async ({ name }) => {
      try {
        const content = await getJsContent(name);
        return { content: [{ type: 'text', text: content }] };
      } catch (e) {
        return { content: [{ type: 'text', text: `获取 JS 插件失败: ${e.message}` }], isError: true };
      }
    }
  );

  // 保存 JS 插件
  server.tool(
    'save_js_plugin',
    '保存 JS 插件代码到海阔视界 App',
    {
      name: z.string().describe('JS 插件名称'),
      content: z.string().describe('JS 插件完整代码'),
    },
    async ({ name, content }) => {
      try {
        const r = validateJsSyntax(content);
        if (!r.ok) {
          return {
            content: [
              {
                type: 'text',
                text: `代码语法校验失败:\n${r.errors.map((e) => `第${e.line}行: ${e.message}`).join('\n')}`,
              },
            ],
            isError: true,
          };
        }
        const res = await saveJs(name, content);
        return { content: [{ type: 'text', text: `保存成功: ${name}\n${res}` }] };
      } catch (e) {
        return { content: [{ type: 'text', text: `保存 JS 插件失败: ${e.message}` }], isError: true };
      }
    }
  );

  // 格式化 JS 插件代码
  server.tool(
    'format_js_code',
    '使用 Prettier 格式化 JS 插件代码',
    {
      code: z.string().describe('待格式化的 JS 代码'),
    },
    async ({ code }) => {
      try {
        const formatted = await formatHikerCode(code);
        return { content: [{ type: 'text', text: formatted }] };
      } catch (e) {
        return { content: [{ type: 'text', text: `格式化失败: ${e.message}` }], isError: true };
      }
    }
  );
}
