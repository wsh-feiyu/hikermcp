# 海阔视界规则「一行大 JSON」导入与转化详解

> 适用场景：通过 App「导入规则」粘贴/加载规则时，看到的是一整行 JSON 字符串；
> 或通过 URL/文件导入规则。本文档讲清这行 JSON 的**结构**、**从哪来**（生成）、
> **到哪去**（落库解析）以及 **子页面字段（pages）的序列化**链路。

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

一行 JSON 内部由两部分组成：**顶层字段**、**pages（子页面）**。

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
  "group": "#漫画",                     // 分组（可选）
  "pages": "[...]"                      // ★ 子页面（JSON 字符串或数组，见 2.2）
}
```

### 2.2 pages —— 子页面（数组或 JSON 字符串，App 落库为字符串）

每个子页面包含 4 个字段，其中 `rule` 是最关键、最容易被弄丢的：

```jsonc
"pages": [
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

### 2.3 App 落库形态：pages 字符串

App 真正持久化时，把子页面数组序列化为 **JSON 字符串** 存到 `pages` 字段
（数据库 articlelistrule.pages 就是 TEXT）：

```
pages = JSON.stringify([{ name, path, col_type, rule }, ...])
```

即 `pages` 字段**要么是数组（写源时方便），要么是 JSON 字符串（落库形态）**，
两者是同一个东西的两种表示。

> ★ 关键约定（2026-08 起）：**MCP 的 save_rule / validate_rule / 规则对象统一以
> `pages` 为准**，保存时自动序列化为字符串提交（与 App 落库一致）。
> 旧写法 `pageList`（数组）仍被兼容**输入**（自动转为 pages），但**不再作为输出字段**——
> App 落库只认 `pages`。

---

## 三、子页面字段的规范化（MCP 的 normalizeRule）

MCP 的 `normalizeRule` 保证：无论你传的是数组还是字符串，输出统一为 pages 字符串：

```javascript
export function normalizeRule(rule) {
  const r = { ...rule };
  if (typeof r.pages === 'string') {
    if (!r.pages) r.pages = '[]';
  } else if (Array.isArray(r.pages)) {
    r.pages = r.pages.length ? JSON.stringify(r.pages) : '[]';
  } else if (Array.isArray(r.pageList)) {      // 旧写法兼容
    r.pages = r.pageList.length ? JSON.stringify(r.pageList) : '[]';
  } else {
    r.pages = '[]';
  }
  delete r.pageList;                            // ★ 输出不含 pageList
  return r;
}
```

写入规则对象时**直接写 `pages` 即可**（数组或字符串都行，保存前自动转字符串）：
- 有子页面：`pages: [{...}]` 或 `pages: "[{...}]"`
- 无子页面：不用写或 `pages: []`

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
  ua: 'Mozilla/5.0 ...',
  group: '#漫画',
  // ★ 子页面直接写 pages（数组即可，MCP 保存/导入时自动序列化）
  pages: [
    { name: '读漫屋', path: '读漫屋', col_type: 'movie_2', rule: '//js:\n' + moduleCode }
  ]
};

// 一行输出
const oneLine = JSON.stringify(rule);
console.log(oneLine);            // 可直接粘贴到 App「导入规则」
fs.writeFileSync('读漫屋_rule.json', oneLine, 'utf8');
```

### 4.2 生成后的自检

```javascript
// 自检：JSON 能往返、pages 完整、rule 完整
const parsed = JSON.parse(oneLine);
const pages = Array.isArray(parsed.pages) ? parsed.pages : JSON.parse(parsed.pages || '[]');
console.assert(pages[0].rule.startsWith('//js:'));
console.assert(pages[0].rule.includes('$.exports'));
```

---

## 五、如何解析「一行大 JSON」（导入回读/取子页面代码）

```javascript
// 1. 整行解析
const rule = JSON.parse(oneLineJson);

// 2. 取子页面数组（兼容数组与字符串两种形态）
let pages = Array.isArray(rule.pages) ? rule.pages : JSON.parse(rule.pages || '[]');

// 3. 按 path 取某个模块代码
const mod = pages.find(p => p.path === '读漫屋');
const moduleCode = mod ? mod.rule.replace(/^\/\/js:\s*/, '') : '';
```

---

## 六、实战案例：读漫屋一行 JSON 的转化过程

1. **源头**：`读漫屋.js`（约 300 行模块代码，`$.exports = Rule` 结尾）。
2. **打包**：`rule = { ...顶层字段, pages: [{ path:'读漫屋', rule:'//js:\n'+代码 }] }`。
3. **一行输出**：`JSON.stringify(rule)` → 粘贴导入 App。
4. **App 落库**：读取 `pages`（数组或字符串均可识别），解析子页面存入数据库
   （落库为 pages 字符串）。
5. **回读校验**：`get_rule` 返回的 `pages[].rule` 必须仍是完整代码（10933 字符）。

> 旧写法提示：早期版本用 `pageList` 数组作为子页面字段。MCP 仍兼容这种**输入**
> （自动转为 pages），但新规则请统一使用 `pages`。

---

## 七、导入/导出常见坑速查

| 现象 | 原因 | 解决 |
|---|---|---|
| 导入后「纯搜索小程序」 | pages 丢了 / rule 为空 / 缺 url | pages 非空且每条 rule 以 `//js:` 开头；顶层带 url/col_type/find_rule |
| 导入后子页面全空 | pages 给了空数组/漏传 | 提供完整 pages（含 rule），别用 `[]` |
| 模块加载失败 | 缺 `$.exports` 导出 | 模块页 rule 结尾加 `$.exports = ...` |
| `$.require('X')` 报未定义 | path 与引用名不一致 | 让 pages[].path 与引用一致 |
| 导入报 illegal identifier | JSON 被二次转义（多了反斜杠） | 只 JSON.stringify 一次，不要对字符串再转义 |
| 旧规则里 pageList 被忽略 | 向 App 提交了 pageList 字段 | 改用 pages（MCP 会自动兼容转换） |

---

## 八、与 MCP 链路的衔接

| 环节 | 处理的是 | 转化动作 |
|---|---|---|
| 写 `.js` 模块 | 源码文本 | 组装进 pages[].rule（加 `//js:` 前缀） |
| build_rule 脚本 | 规则对象 | pages 数组直接打包，输出一行 JSON |
| 导入 App / save_rule | 一行 JSON | normalizeRule 统一 pages 为字符串提交 |
| get_rule 回读 | 落库对象 | 验证 pages[].rule 完整 |
| validate_rule | 规则对象 | 结构+语法+强校验（含 pages 子页面）+序列化干跑 |