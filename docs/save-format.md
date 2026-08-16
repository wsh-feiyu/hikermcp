# 海阔视界规则「一行大 JSON」导入与转化详解

> 适用场景：通过 App「导入规则」粘贴/加载规则时，看到的是一整行 JSON 字符串；
> 或通过 URL/文件导入规则。本文档讲清这行 JSON 的**结构**、**从哪来**（生成）、
> **到哪去**（落库解析）以及 **pageList ↔ pages 双向转化**的完整链路。

---

## 一、什么是「一行大 JSON」

海阔视界（Hiker）的规则本质是一个 JSON 对象，导入时以**单个字符串**形式传入，经过
序列化后看起来是**一整行、没有换行**的超长文本。它包含两种形态：

| 形态 | JSON 顶层 | 说明 |
|---|---|---|
| 单规则导入 | `{ ... }` | 一个规则对象，直接是规则本体 |
| 多规则导入 | `[ {...}, {...}, ... ]` | 数组，每个元素是一个规则对象 |

MCP 链路里处理的是**单规则**形态；`get_rule` 返回的落库对象、`save_rule`
提交的对象，都是同一套结构。所以「一行大 JSON」= 规则对象的紧凑序列化。

---

## 二、JSON 内部结构拆解

一行 JSON 内部由三部分组成：**顶层字段**、**pageList（数组）**、**pages（字符串）**。

### 2.1 顶层字段（单值，决定规则整体行为）

```jsonc
{
  "title": "读漫屋",                    // 规则名（App 列表展示）
  "type": "video",                      // video / all / live
  "author": "AI",
  "version": 20260816,
  "url": "hiker://empty?page=fypage",   // 主页入口，缺失 → 纯搜索
  "col_type": "movie_2",                // 列表卡片样式
  "detail_col_type": "movie_3",         // 详情页样式
  "sdetail_col_type": "movie_1",
  "find_rule": "js:$.require('读漫屋').主页()",   // 主页数据来源
  "search_url": "hiker://empty?page=fypage&kw=**",
  "searchFind": "js: putMyVar('keyword', getParam('kw')); $.require('读漫屋').搜索()",
  "class_name": "奇幻&搞笑&...",        // 分类标签（可选）
  "class_url": "2569&2570&...",         // 分类 ID（可选）
  "ua": "Mozilla/5.0 ...",              // 请求 UA（可选）
  "preRule": "// 读漫屋 漫画源",        // 前置说明（可选）
  "group": "#漫画"                      // 分组（可选）
}
```

### 2.2 pageList（数组）—— 子页面清单

每个子页面包含 4 个字段，其中 `rule` 是最关键、最容易被弄丢的：

```jsonc
"pageList": [
  {
    "name": "读漫屋",            // 页面显示名
    "path": "读漫屋",            // 模块名，供 $.require('读漫屋') 引用
    "col_type": "movie_2",      // 该页卡片样式
    "rule": "//js:\nvar Rule = {...}\n$.exports = Rule;"  // ★ 完整模块代码
  }
]
```

`rule` 的硬性要求：
- 必须以 `//js:` 开头（否则 App 不识别为 JS 模块）
- 被 `$.require('X')` 引用的模块页，必须以 `$.exports = ...` 结尾
- `path` 必须与 `find_rule`/`searchFind` 里的 `$.require('X')` 一致

### 2.3 pages（字符串）—— App 实际落库用的子页面存储

`pages` 就是 `pageList` 的 **JSON 字符串序列化**，是 App 真正持久化的形式：

```
pages = JSON.stringify(pageList)
```

例如 `pageList` 为 `[{...}]`，则 `pages` 是：

```
"[{\"name\":\"读漫屋\",\"path\":\"读漫屋\",\"col_type\":\"movie_2\",\"rule\":\"//js:\\n...\"}]"
```

> ★ 关键坑：**`pageList` 与 `pages` 必须同时存在且内容一致**。
> 直连 App 导入时若只给 `pageList` 数组、漏掉 `pages`，App 会落库成 `pageList: []`、
> `pages: "[]"`，子页面全部丢失 → 规则变成「纯搜索小程序」。

---

## 三、pageList ↔ pages 双向转化（核心）

```
        JSON.stringify(pageList)
pageList ────────────────────────► pages (字符串)
   ▲                                │
   └────────────────────────────────┘
        JSON.parse(pages)
```

### 3.1 数组 → 字符串（生成 pages）

```javascript
const pages = JSON.stringify(pageList);
```

### 3.2 字符串 → 数组（解析 pages）

```javascript
const pageList = JSON.parse(pages);   // 注意 try/catch，脏数据会抛错
```

### 3.3 规范化兜底（MCP 的 normalizeRule 已实现，逻辑如下）

```javascript
export function normalizeRule(rule) {
  const r = { ...rule };
  if (Array.isArray(r.pageList) && r.pageList.length) {
    r.pages = JSON.stringify(r.pageList);      // 有数组 → 补 pages 字符串
  } else if (typeof r.pages === 'string' && r.pages) {
    r.pageList = JSON.parse(r.pages);          // 有字符串 → 反向补数组
  } else {
    r.pageList = r.pageList || [];
    r.pages = r.pages || '[]';
  }
  return r;
}
```

这条规则是「一行大 JSON」正确转化的**唯一要点**：
导入/导出/保存任何一步，都要保证 pageList 和 pages 同步。

---

## 四、如何生成「一行大 JSON」（从 .js 模块代码打包）

典型场景：你写好一个 `读漫屋.js` 模块，想生成可直接导入的一行 JSON。

### 4.1 参考脚本（Node.js）

```javascript
// build_rule.js —— 把 .js 模块代码打包成一行 JSON 规则
const fs = require('fs');

const moduleCode = fs.readFileSync('读漫屋.js', 'utf8').replace(/\n+$/, '');

const rule = {
  title: '读漫屋',
  type: 'video',
  url: 'hiker://empty?page=fypage',
  col_type: 'movie_2',
  detail_col_type: 'movie_3',
  sdetail_col_type: 'movie_1',
  find_rule: "js:$.require('读漫屋').主页()",
  search_url: 'hiker://empty?page=fypage&kw=**',
  searchFind: "js:putMyVar('keyword', getParam('kw'));$.require('读漫屋').搜索()",
  class_name: '奇幻&搞笑&...',
  class_url: '2569&2570&...',
  ua: 'Mozilla/5.0 ...',
  group: '#漫画',
  pageList: [
    { name: '读漫屋', path: '读漫屋', col_type: 'movie_2', rule: '//js:\n' + moduleCode }
  ]
};

// ★ 关键：同步补 pages，否则 App 落库丢子页面
rule.pages = JSON.stringify(rule.pageList);

// 输出一行 JSON
const oneLine = JSON.stringify(rule);
console.log(oneLine);            // 可直接粘贴到 App「导入规则」
fs.writeFileSync('读漫屋_rule.json', oneLine, 'utf8');
```

### 4.2 生成后的自检

```javascript
// 自检：JSON 能往返、pageList/pages 一致、rule 完整
const parsed = JSON.parse(oneLine);
console.assert(JSON.stringify(parsed.pageList) === parsed.pages);
console.assert(parsed.pageList[0].rule.startsWith('//js:'));
console.assert(parsed.pageList[0].rule.includes('$.exports'));
```

---

## 五、如何解析「一行大 JSON」（导入回读/取子页面代码）

```javascript
// 1. 整行解析
const rule = JSON.parse(oneLineJson);

// 2. 取子页面数组（优先 pageList，退化到 pages 反解）
let pages = Array.isArray(rule.pageList) ? rule.pageList
          : JSON.parse(rule.pages || '[]');

// 3. 按 path 取某个模块代码
const mod = pages.find(p => p.path === '读漫屋');
const moduleCode = mod ? mod.rule.replace(/^\/\/js:\s*/, '') : '';
```

---

## 六、实战案例：读漫屋一行 JSON 的转化过程

1. **源头**：`读漫屋.js`（约 300 行模块代码，`$.exports = Rule` 结尾）。
2. **打包**：`rule = { ...顶层字段, pageList: [{ path:'读漫屋', rule:'//js:\n'+代码 }] }`。
3. **补 pages**：`rule.pages = JSON.stringify(rule.pageList)`。
4. **一行输出**：`JSON.stringify(rule)` → 粘贴导入 App。
5. **App 落库**：读取 `pages` 字符串，`JSON.parse` 得到子页面，存入数据库。
6. **回读校验**：`get_rule` 返回的 `pageList[].rule` 必须仍是完整代码（10933 字符）。

**踩坑还原**：初次提交只给了 `pageList` 数组、漏了 `pages` → App 落库 `pageList: []`、
`pages: "[]"` → `find_rule` 里 `$.require('读漫屋')` 加载不到代码 → 显示「纯搜索小程序」。
补齐 `pages` 后重新提交即恢复。

---

## 七、导入/导出常见坑速查

| 现象 | 原因 | 解决 |
|---|---|---|
| 导入后「纯搜索小程序」 | pageList 丢了 / rule 为空 / 缺 url | 补 pages；rule 非空且 `//js:` 开头；顶层带 url/col_type/find_rule |
| 导入后子页面全空 | 只传 pageList 漏 pages | 同时提供 pages = JSON.stringify(pageList) |
| 模块加载失败 | 缺 `$.exports` 导出 | 模块页 rule 结尾加 `$.exports = ...` |
| `$.require('X')` 报未定义 | path 与引用名不一致 | 让 pageList[].path 与引用一致 |
| 导入报 illegal identifier | JSON 被二次转义（多了反斜杠） | 只 JSON.stringify 一次，不要对字符串再转义 |

---

## 八、与 MCP 链路的衔接

| 环节 | 处理的是 | 转化动作 |
|---|---|---|
| 写 `.js` 模块 | 源码文本 | 组装进 pageList[].rule（加 `//js:` 前缀） |
| build_rule 脚本 | 规则对象 | 补 pages 字符串，输出一行 JSON |
| 导入 App / save_rule | 一行 JSON | App 读取 pages 反解子页面 |
| get_rule 回读 | 落库对象 | 验证 pageList[].rule 完整 |
| validate_rule | 规则对象 | 结构+语法+强校验+序列化干跑 |