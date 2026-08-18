/**
 * MCP Prompts：引导 AI 正确编写海阔视界规则。
 */

export function registerPrompts(server) {
  // 编写新规则
  server.prompt(
    'create_rule',
    '引导 AI 编写一个完整的海阔视界规则',
    {},
    () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `你是一个海阔视界规则编写专家。

海阔视界规则是 JSON 格式，包含以下关键字段：

## 顶层字段
| 字段 | 类型 | 说明 |
|------|------|------|
| title | string | 规则标题，必填 |
| type | string | 规则类型：all/video/music/live/cartoon/read/picture/news/tool/other |
| author | string | 作者 |
| version | number | 版本号 |
| group | string | 分组标签 |
| col_type | string | 首页展示样式（movie_3/movie_1_vertical_pic 等） |
| find_rule | string | 首页规则，以 "js:" 开头 |
| search_url | string | 搜索 URL，用 ** 代替关键词 |
| searchFind | string | 搜索规则，以 "js:" 开头 |
| preRule | string | 预执行代码 |
| ua | string | User-Agent: mobile/pc |
| pages | array | 子页面数组 |

## 首页规则 (find_rule)
使用海阔视界 API 的 JS 代码，以 "js:" 开头。
常用 API：
- \`fetch(url, config)\` — 请求页面
- \`\$.require("pageName")\` — 调用子页面导出函数
- \`setResult(d)\` — 设置返回值
- \`getMyVar(key, default)\` / \`putMyVar(key, value)\` — 会话变量
- \`getItem(key, default)\` / \`setItem(key, value)\` — 持久化变量
- \`parseDom(html, rule)\` — DOM 解析
- \`MY_PAGE\` — 当前页码
- \`MY_URL\` — 当前 URL
- \`input\` — 输入框 / 搜索输入

## ★ 返回结果的两种写法（只能二选一，勿混用）
1. **var Rule 框架风格（推荐）**：\`主页/搜索/二级\` 函数体内**直接 return 数组**，框架自动提交：
   \`\`\`js
   var Rule = { 主页: function(page, categoryId) { var d = []; d.push({title, url, img, desc}); return d; } };
   \`\`\`
   —— 框架风格**不要调用 setResult(d)**。
2. **原生 js: 格式**：find_rule / searchFind 是 \`js:\` 开头的代码，结尾**必须 setResult(d) 提交**，写 return 无效：
   \`\`\`js
   js: var d = []; d.push({title, url, img, desc, col_type}); setResult(d);
   \`\`\`
列表项必带字段：title / url / img(pic_url) / desc；带分页时 URL 用 fypage 且可用 setResult({data: d})。

## 搜索规则 (searchFind)
接收 \`getParam('kw')\` 作为关键词，返回搜索结果列表。

## ★★★ 写源前的强制步骤（按顺序执行，不可跳过）
-1. **经验记忆检查（必做，避免重犯历史错误）**：调用 \`recall_lessons\` 检索历史写源教训，
   关键词用本次目标的「源类型 + 技术点」（如 "picture 图片源" / "video 多线路" /
   "setResult" / "pages"）。命中教训**先对照并严格遵守**，不得再犯。
   若本次发现新问题（校验失败、用户反馈等），用 \`remember_lesson\` 记录
   （问题/原因/正确做法/关键词），下次自动命中。
0. **通用标准文档（必须）**：调用 \`get_rule_docs({ doc: 'hiker-help' })\` 读取「官方帮助手册」——
   App 内置开发者手册整合：setResult 系列、JS API、链接协议、选择器、链接标识、col_type 官方字典。
   这是**唯一通用标准**。官方标准文档包括：hiker-help（官方帮助手册）、blueprint（写源模板手册）、hiker-dts（API 声明）。
1. **模板手册（必须）**：调用 \`get_rule_docs({ doc: 'blueprint' })\` 完整读取「海阔视界写源模板手册」。
   这是基于 361 条真实规则实证提炼的权威模板：主页/分类/搜索/二级/详情/播放解析怎么写、
   数据怎么返回（setResult(d) vs return）、全部字段字典、各类型模板、反例清单。
   **禁止跳过本步**——照抄模板即可，不需要也禁止去外部搜索规则写法。
2. 按下面「★ 最小规则模板骨架」直接复制，把选择器与 URL 替换为目标站点即可；
   需要更完整写法时再查手册「8. 完整模板集」。
2.5 ★★★ 视频源/视频小程序一律**优先使用 video-template 模块化框架**：
   调用 \`get_rule_docs({ doc: 'video-template' })\` 完整读取「视频源写源模板」
   （第一次写视频源必须读），并**严格按其框架组织规则**——
   顶层 JSON 入口 + \`\$.require("规则名")\` 引用 + 子页面模块（规则名）五区块
   （d/d_ 数据区、配置区、工具函数区、数据解析区、home/search/detail/play 页面函数区）、
   多线路用 tabs/lists、选集用 \`$\` 编码 + lazyRule 调 play()。
   ★ 子页面模块名 **取规则名本身**（规则名「某某影视」→ 模块名「某某影视」），
   不要使用模板示例名（hmhome/hmys）；\`find_rule\`/\`searchFind\`/pages 中的 path/
   模块内 \`\$.require\` 引用必须全部一致。
   写完对照模板第 9 节「20 项检查清单」自查。不要用极简骨架糊视频源。
3. 写完后必须调用 \`validate_rule\` 校验（会检查 setResult/return 混用等软警告）。
4. 遇到模板覆盖不了的写法（加密、签名、特殊 API），结合手册第 9 节反例清单与官方帮助手册推理，
   若仍不确定，直接向用户说明需要的信息，不要凭空编造。
5. ★ 青豆框架文档（\`get_rule_docs({doc:'qingdou-guide'})\` / \`qingdou-skill\`）**仅当用户明确要求
   写青豆框架规则（var Rule = {…} 风格）时才参考**；本 MCP 通用写源默认使用原生 js: 格式（官方标准）。

## ★ 最小规则模板骨架（直接复制，替换「目标站」和「选择器」即可）
\`\`\`json
{
  "title": "示例影视",
  "type": "video",
  "author": "AI",
  "version": 1,
  "url": "hiker://empty##https://目标站.com/list/fypage.html",
  "col_type": "movie_3",
  "detail_col_type": "movie_1",
  "sdetail_col_type": "movie_1",
  "search_url": "https://目标站.com/search?q=**",
  "ua": "mobile",
  "find_rule": "js:var d=[];MY_URL=MY_URL.replace('hiker://empty##','');var html=request(MY_URL);var list=pdfa(html,'列表容器&&条目选择器');for(var i=0;i<list.length;i++){var it=list[i];d.push({title:pdfh(it,'a&&title'),desc:pdfh(it,'备注选择器&&Text'),img:pd(it,'img&&data-original'),url:'hiker://empty##'+pd(it,'a&&href')});}setResult(d);",
  "detail_find_rule": "js:var d=[];MY_URL=MY_URL.replace('hiker://empty##','');var html=request(MY_URL);d.push({title:pdfh(html,'标题选择器&&Text'),desc:pdfh(html,'简介选择器&&Text'),img:pd(html,'海报&&img&&src'),url:MY_URL,col_type:'movie_1_vertical_pic'});d.push({col_type:'line'});var eps=pdfa(html,'选集容器&&a');for(var j=0;j<eps.length;j++){d.push({title:pdfh(eps[j],'a&&title'),url:pd(eps[j],'a&&href'),col_type:'text_4'});}setResult(d);",
  "searchfind": "js:var d=[];var html=getResCode();var list=pdfa(html,'搜索列表容器&&li');for(var i=0;i<list.length;i++){var it=list[i];d.push({title:pdfh(it,'a&&title'),img:pd(it,'img&&src'),url:'hiker://empty##'+pd(it,'a&&href'),desc:pdfh(it,'备注选择器&&Text')});}setResult(d);",
  "pages": "[]"
}
\`\`\`
模板要点：主页/详情/搜索全部以 \`setResult(d)\` 结尾；列表项用 title/url/img/desc；
详情页用「信息卡块 + line 分隔 + 选集按钮块」组织；搜索用 \`getResCode()\` 取已请求的 HTML。

## 子页面 (pages 数组) 补充
- 被 \`$.require('path')\` 引用的模块页 rule 必须以 \`$.exports = ...\` 结尾
- 常见子页面：主页模块 / 详情模块 / 解析模块 / 工具函数模块

## 返回结果的两种写法提醒（已写入 blueprint 第 0 节，此处再强调）
- \`js:\` 格式 find_rule/searchFind 结尾**必须 setResult(d)**，写 return 无效
- \`var Rule = {…}\` 框架函数内**必须 return d**，不要调 setResult
- 列表项字段用 title/url/img(pic_url)/desc，**不要用 vod_ 前缀**

现在请告诉我你想写什么样的规则，包括：
1. 规则名称和用途
2. 目标网站或 API
3. 需要哪些功能（首页/分类/搜索/详情/播放）`,
          },
        },
      ],
    })
  );

  // 修复规则
  server.prompt(
    'fix_rule',
    '引导 AI 分析并修复有问题的规则',
    {},
    () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `你是一个海阔视界规则调试专家。

请先使用 \`get_rule\` 工具获取要修复的规则内容，然后分析问题。
修复前先调用 \`recall_lessons\` 检索历史教训（关键词用问题特征，如 "setResult"/"pages"/"type"），
若命中同类问题先按教训处理。修复完成且确认问题根源后，用 \`remember_lesson\` 记录本次教训，
下次不再重犯。

如需了解正确的返回结构（setResult vs return、字段字典、详情页组织方式），
请先调用 \`get_rule_docs({ doc: 'blueprint' })\` 读取「写源模板手册」，再对照排查。

常见问题及排查方法：
1. **首页不显示内容** – 检查 \`find_rule\` 中的 \`fetch\` 请求是否返回正确数据，\`setResult\` 是否被调用
2. **搜索无结果** – 检查 \`search_url\` 的 URL 模板中 \`**\` 是否被正确替换，\`searchFind\` 中的 \`getParam('kw')\` 是否拿到关键词
3. **播放失败** – 检查 \`detail\` 或 \`play\` 方法中的 URL 拼接是否正确，是否需要签名/鉴权
4. **语法错误** – 使用 \`validate_rule\` 工具检查 JS 语法
5. **子页面加载失败** – 检查 \`\$.require("path")\` 中的 path 是否与 pages 中的 path 匹配

请告诉我你遇到的具体问题，或者使用 \`get_rule\` 获取规则后我来分析。`,
          },
        },
      ],
    })
  );
}