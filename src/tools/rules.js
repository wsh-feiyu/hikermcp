import { z } from 'zod';
import { getAllRuleTitles, getRuleContent } from '../hiker-api.js';
import { formatHikerCode } from './format.js';
import { saveRule as saveRuleToApp } from './saveRule.js';
import { validateRule as validateRuleInApp } from './validateRule.js';

/**
 * 规则相关 MCP 工具
 *
 * 保存链路（save_rule）：
 *   rules.js (MCP 工具) → tools/saveRule.js (校验 + 规范化) → appApi.js (JSON POST) → App
 *
 * 校验链路（validate_rule）：
 *   rules.js (MCP 工具) → tools/validateRule.js (结构 + 语法 + 序列化干跑)
 *
 * 两条链路共用同一序列化基线（normalizeRule + JSON.stringify），
 * 保证「校验通过 = 一定能保存」。
 */

export function registerRuleTools(server) {
  // 列出所有规则
  server.tool(
    'list_rules',
    '获取海阔视界 App 中所有规则的标题列表',
    {},
    async () => {
      try {
        const titles = await getAllRuleTitles();
        const list = Array.isArray(titles) ? titles : [titles];
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ count: list.length, rules: list }, null, 2),
            },
          ],
        };
      } catch (e) {
        return { content: [{ type: 'text', text: `获取规则列表失败: ${e.message}` }], isError: true };
      }
    }
  );

  // 获取规则内容
  server.tool(
    'get_rule',
    '获取指定标题的规则完整内容（JSON 格式，含 pages 子页面）',
    {
      title: z.string().describe('规则标题，如 "某某影视"'),
    },
    async ({ title }) => {
      try {
        const text = await getRuleContent(title);
        let rule;
        try {
          rule = JSON.parse(text);
        } catch {
          rule = text;
        }
        return {
          content: [
            {
              type: 'text',
              text: typeof rule === 'string' ? rule : JSON.stringify(rule, null, 2),
            },
          ],
        };
      } catch (e) {
        return { content: [{ type: 'text', text: `获取规则失败: ${e.message}` }], isError: true };
      }
    }
  );

  // 保存规则
  server.tool(
    'save_rule',
    '保存规则到海阔视界 App。入参 rule 传 pageList(子页面数组) 即可，服务端自动补齐 pages 字符串并正确序列化提交；保存失败会返回 App 的具体错误信息。注意：保存前会自动校验并拦截「纯搜索小程序」问题（子页面 rule 为空、缺 //js: 前缀、被引用模块缺 $.exports 导出等）',
    {
      rule: z.record(z.any()).describe(
        '完整规则对象。必填字段：title, url, col_type, detail_col_type, find_rule。搜索源需 search_url, searchFind。pageList(子页面数组，每项含 name/path/col_type/rule)。子页面 rule 必须非空且以 //js: 开头；被 $.require 引用的模块页必须有 $.exports 导出。主页源若缺 url 或 col_type 或 find_rule 会导致 App 显示「纯搜索小程序」'
      ),
      validate: z.boolean().optional().describe('保存前是否校验（默认 true），校验会拦截模块缺失、导出缺失、rule 为空等不可用规则'),
    },
    async ({ rule, validate = true }) => {
      try {
        const result = await saveRuleToApp({ rule, validate });
        if (!result.ok) {
          return {
            content: [{ type: 'text', text: result.message }],
            isError: true,
          };
        }
        return {
          content: [{ type: 'text', text: result.message }],
        };
      } catch (e) {
        return {
          content: [{ type: 'text', text: `保存规则失败: ${e.message}` }],
          isError: true,
        };
      }
    }
  );

  // 校验规则
  server.tool(
    'validate_rule',
    '校验规则的结构与代码语法，并通过序列化干跑确保与 save 同一基线（校验通过 = 一定能保存）。另含强校验：拦截「纯搜索小程序」（子页面 rule 为空、缺 //js: 前缀、被引用模块缺 $.exports 导出等）。软警告：检测 js: 格式是否误用 return list 提交（应为 setResult(d)）',
    {
      rule: z.record(z.any()).describe('规则对象。校验会检查：字段完整性、JS 语法、子页面 rule 非空且以 //js: 开头、$.require 引用完整性、模块页 $.exports 导出、序列化往返'),
    },
    async ({ rule }) => {
      try {
        const result = await validateRuleInApp({ rule });
        const warningsText = result.warnings?.length
          ? `\n\n⚠️ ${result.warnings.length} 条提示（不影响保存，但建议修正）:\n${result.warnings.map((w) => `- ${w}`).join('\n')}`
          : '';
        return {
          content: [
            {
              type: 'text',
              text: result.ok
                ? `校验通过，规则结构与代码语法均正常（序列化干跑 ${result.bodyLength} 字节）${warningsText}`
                : `校验未通过，发现 ${result.errors.length} 个问题:\n${result.errors.join('\n')}`,
            },
          ],
        };
      } catch (e) {
        return {
          content: [{ type: 'text', text: `校验失败: ${e.message}` }],
          isError: true,
        };
      }
    }
  );

  // 格式化规则代码
  server.tool(
    'format_rule_code',
    '使用 Prettier 格式化海阔视界规则代码（支持 js: 前缀）',
    {
      code: z.string().describe('待格式化的规则代码，可带 js: 前缀'),
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
