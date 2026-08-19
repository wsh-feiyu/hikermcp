import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.join(__dirname, '..', 'docs');

/**
 * MCP Resources：让 AI 按需读取规则编写文档。
 *
 * URI 约定：
 *   hiker://docs/hiker-help          官方帮助手册（App 内置开发者手册整合：JS API/链接协议/选择器/col_type/标识/网页桥接）
 *   hiker://docs/source-blueprint    写源模板手册（AI 写源必读，通用标准）
 *   hiker://docs/video-template      视频源写源模板（模块化框架，复杂视频源专用）
 *   hiker://docs/qingdou-guide       青豆框架规则编写指南（仅写青豆规则时参考）
 *   hiker://docs/qingdou-skill       青豆 SKILL 文档（仅写青豆规则时参考）
 *   hiker://docs/suggestions         代码片段建议
 *   hiker://docs/hiker-dts           海阔视界 API 类型声明
 */

function readFileSafe(p) {
  try {
    return fs.readFileSync(p, 'utf-8');
  } catch {
    return null;
  }
}

export function registerResources(server) {
  const docs = [
    {
      uri: 'hiker://docs/hiker-help',
      name: '海阔视界官方帮助手册（App 内置开发者手册整合）',
      description: '官方权威速查：JS API 大全、setResult 系列、链接协议大全、URL 链接增强语法、选择器完整语法、首页链接占位符、# 链接标识、col_type 官方字典、二级列表嵌套、fy_bridge_app 网页桥接、自动导入口令。通用写源参考此文档',
      file: 'hiker-help.md',
      mime: 'text/markdown',
    },
    {
      uri: 'hiker://docs/qingdou-guide',
      name: '青豆框架规则编写指南',
      description: '★青豆框架专用（var Rule = {…} 风格）：标准规则格式、分类、主页/搜索/二级/解析方法、返回结构。仅当用户明确要求写青豆框架规则时才参考，通用写源请参考 hiker-help 与 source-blueprint',
      file: 'qingdou-guide.md',
      mime: 'text/markdown',
    },
    {
      uri: 'hiker://docs/qingdou-skill',
      name: '青豆 SKILL 文档',
      description: '★青豆框架专用：青豆剧场的 SKILL 文档，包含青豆规则编写技巧与规范。仅当用户明确要求写青豆框架规则时才参考',
      file: 'qingdou-skill.md',
      mime: 'text/markdown',
    },
    {
      uri: 'hiker://docs/suggestions',
      name: '代码片段建议',
      description: '海阔视界编辑器内置的代码片段与自动补全建议',
      file: 'suggestions.js',
      mime: 'application/javascript',
    },
    {
      uri: 'hiker://docs/hiker-dts',
      name: '海阔视界 API 类型声明',
      description: 'hiker.d.ts：海阔视界 JS 引擎全部 API 的类型声明。★大文件（80KB），先用 hiker-api-index 索引定位 API 名，再用 get_rule_docs({doc:"hiker-dts", keyword:"函数名"}) 精准提取',
      file: 'hiker.d.ts',
      mime: 'text/typescript',
    },
    {
      uri: 'hiker://docs/hiker-api-index',
      name: '海阔视界 API 速查索引',
      description: 'hiker.d.ts 全部 180 个 API 的名称速查表（函数/常量/命名空间 + 一句话用途，9KB）。★查 API 先看此索引定位函数名，再按名精准提取 d.ts 声明',
      file: 'hiker-api-index.md',
      mime: 'text/markdown',
    },
    {
      uri: 'hiker://docs/save-format',
      name: '规则「一行大 JSON」导入与转化详解',
      description: 'pages 子页面规范（//js: 前缀 + $.exports 导出）、一行大 JSON 导入与转化、主页源必填字段、两种保存通道（MCP save_rule vs curl 直连 App）的入参差异、常见问题排查',
      file: 'save-format.md',
      mime: 'text/markdown',
    },
    {
      uri: 'hiker://docs/source-blueprint',
      name: '海阔视界写源模板手册（AI 写源必读）',
      description: '基于 361 条真实规则实证提炼的权威写源模板：主页/分类/搜索/二级/详情/播放解析怎么写、数据怎么返回（setResult）、全部字段字典、各类型模板、AI 反例清单。AI 写源前必须先读此文档',
      file: 'source-blueprint.md',
      mime: 'text/markdown',
    },
    {
      uri: 'hiker://docs/video-template',
      name: '视频源写源模板（渲染通用型）',
      description: '渲染通用型 v3：静态分类(class_name/class_url) + URL 分段传参(##fyclass##fypage / ##**##)，渲染层固定，AI 只在 ★采集点 分析源数据（API/HTML 均可）。★写视频源/视频小程序优先使用此框架',
      file: 'hiker-video-write-template.md',
      mime: 'text/markdown',
    },
  ];

  for (const d of docs) {
    server.resource(d.name, d.uri, async () => {
      const content = readFileSafe(path.join(DOCS_DIR, d.file)) || '';
      return {
        contents: [{ uri: d.uri, text: content, mimeType: d.mime }],
      };
    });
  }
}
