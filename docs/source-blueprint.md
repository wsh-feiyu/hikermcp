# 海阔视界写源模板手册（基于 361 条真实规则实证）

> 本文档是 **AI 写源时的权威模板**：主页怎么写、分类怎么写、搜索怎么写、
> 二级/详情怎么写、播放怎么解析、数据怎么返回，全部给出可照抄的代码。
> 结论来自对 361 条真实规则的全量统计分析（历史规则库实证提炼），不是理论推测。
>
> **AI 写源流程（严格遵守）**：
> 1. 先读本文档（完整读完）
> 2. 按「8. 完整模板集」选对应类型模板，直接照抄修改
> 3. 不确定的字段查「1. 顶层字段字典」
> 4. 模板覆盖不了的写法，参考「9. 反例清单」推理；仍不确定时向用户确认，不要凭空编造

---

## 0. 最重要的一条：数据怎么返回

海阔视界的 findAll 是 `js:` 开头的**整段代码**，App 把它 **eval 执行**。
所以：

| 写法 | 是否有效 | 说明 |
|------|---------|------|
| `setResult(d)` 在代码末尾调用 | ✅ 有效 | **原生 js: 格式唯一正确的提交方式** |
| `return d` 写在代码末尾 | ❌ 无效 | 代码被 eval，return 不会把数据交给 App |
| `var Rule = {…}` 框架函数内 `return d` | ✅ 有效 | 青豆/Drpy 框架写法，框架自动提交（与 js: 格式二选一） |

**列表项统一字段**（真实源 361 条中 0 条用 vod_ 前缀！那是青豆框架的）：

```js
d.push({
  title:   "标题",                     // 必填，列表显示名
  url:     "http://…/detail.html",     // 必填，点击跳转地址（详情页/播放页）
  img:     "http://…/1.jpg",           // 封面图（img 或 pic_url 二选一）
  pic_url: "http://…/1.jpg",           // 同上，两者等价
  desc:    "更新至10集",               // 可选，备注/简介
  col_type: "movie_3",                 // 可选，默认继承规则顶层 col_type
  extra:   { /* 可选，传给下一页的参数 */ },
});
setResult(d);
```

---

## 1. 顶层字段字典（按真实覆盖率排序）

| 字段 | 覆盖率 | 必填 | 说明 |
|------|-------|------|------|
| `title` | 100% | ✅ | 规则名（App 列表显示） |
| `type` | 100% | ✅ | `video` / `tool` / `other` / `music` / `picture` / `news` / `read` / `all` / `live` / `cartoon` |
| `url` | 100% | ✅ | **主页入口 URL**。分页占位符 `fypage`；`hiker://empty##真实URL` 可包装真实地址 |
| `col_type` | 100% | ✅ | 列表卡片样式，视频源主流 `movie_3`（309 条） |
| `detail_col_type` | 100% | ✅ | 二级页样式，主流 `movie_1`（340 条） |
| `sdetail_col_type` | 100% | ✅ | 搜索详情样式，主流 `movie_1`（353 条） |
| `find_rule` | 100% | ✅ | 主页代码，`js:` 开头（355/361 条都是 js:） |
| `ua` | 100% | ✅ | `mobile`（311）/ `auto`（29）/ `pc`（21） |
| `version` | 100% | ✅ | 整数版本号 |
| `icon` | 100% | ✅ | 图标 URL 或 `hiker://images/icon1` |
| `author` | 34% | ⭕ | 作者名 |
| `search_url` | 19% | ⭕ | 搜索地址，**关键词用 `**` 占位**（68 条这样写） |
| `searchfind` | 19% | ⭕ | 搜索代码，`js:` 开头，用 `getResCode()` 拿已请求的搜索页 HTML |
| `pages` | 82% | ⭕ | 子页面数组（JSON 字符串）。被 `$.require` 引用的模块放这里 |
| `class_name`/`class_url` | 8% | ⭕ | 静态分类（少见，多数用动态分类） |
| `area_name`/`area_url` | 3% | ⭕ | 地区分类 |
| `year_name`/`year_url` | 2% | ⭕ | 年份分类 |
| `sort_name`/`sort_url` | 1% | ⭕ | 排序分类 |
| `detail_find_rule` | 9% | ⭕ | 二级解析代码（js: 或选择器格式），没有时就靠 pages 子页面 |
| `sdetail_find_rule` | 10% | ⭕ | 搜索二级解析（多为 `*`） |
| `preRule` | 11% | ⭕ | 预执行代码 |
| `last_chapter_rule` | 2% | ⭕ | 最新章节规则 |
| `group` | — | ⭕ | 分组标签 |
| `proxy` | — | ⭕ | 请求代理 |

**最简可用骨架**（参考真实规则"蓝鲨"）：

```json
{
  "title": "示例源",
  "type": "video",
  "author": "AI",
  "version": 1,
  "url": "hiker://empty##https://www.example.com/page/fypage.html",
  "col_type": "movie_3",
  "detail_col_type": "movie_1",
  "sdetail_col_type": "movie_1",
  "find_rule": "js:…",
  "detail_find_rule": "js:…",
  "search_url": "https://www.example.com/search?q=**",
  "searchfind": "js:…",
  "ua": "mobile",
  "pages": "[]"
}
```

---

## 2. 主页怎么写（find_rule）

**标准模板**（真实规则"蓝鲨/4K蓝光"模式提炼）：

```js
js:
var d = [];
MY_URL = MY_URL.replace('hiker://empty##', '');      // 若 url 用 hiker://empty## 包装则先还原
var html = request(MY_URL);                           // 请求主页（fetch 也可，request=fetch）
var list = pdfa(html, '列表容器&&条目选择器');          // 取出列表

for (var i = 0; i < list.length; i++) {
  var item = list[i];
  d.push({
    title: pdfh(item, 'a&&title'),                    // 标题
    desc:  pdfh(item, '.remark&&Text'),               // 备注（更新信息）
    img:   pd(item, 'img&&data-original'),            // 封面（懒加载用 data-original）
    url:   pd(item, 'a&&href'),                       // 详情页地址
    // 注意：真正写源时用正则提取 href/src 更稳，
    // pd() 在沙箱里可能把相对路径解析成 hiker:// 页面地址
  });
}
setResult(d);
```

**分页**：URL 模板里用 `fypage` 占位，App 翻页时自动替换：
- `https://www.example.com/page/fypage.html` → 第 2 页 = `page/2.html`
- `hiker://empty##https://www.example.com/page/fypage`（包装形式同理）

**首页首屏横幅/工具入口**（可选，`MY_PAGE == 1` 时插入）：

```js
if (MY_PAGE == 1) {
  d.push({
    title: "🏠 网站首页",
    url: "https://www.example.com",
    img: "https://www.example.com/logo.png",
    col_type: "avatar"
  });
  d.push({                                            // 分隔线
    col_type: "line"
  });
}
```

**防盗链图**：图片 URL 后追加 `@Referer=站点根地址`：
```js
img: img + '@Referer=https://www.example.com/'
```

**点击行为封装（url 的 4 种写法）**：

| 写法 | 作用 |
|------|------|
| `url: "http://…/detail.html"` | 直接进二级页，用 detail_find_rule 解析 |
| `url: "hiker://empty##" + 真实地址` | 包装：二级页用 `MY_URL.replace('hiker://empty##','')` 还原取地址（原生 App 最常用，避免地址转义问题） |
| `url: "pics://图片1&&图片2"` | 图片/漫画：直接渲染一组图 |
| `url: "'hiker://search?s='+input"` | 搜索框入口（配合 col_type: input） |

---

## 3. 分类怎么写

**方式 A（主流）：动态分类——把页面上的导航/分类按钮解析成列表项，点击后 URL 带 fyclass**

真实样例（4K蓝光）：

```js
// 1. 主页代码里解析导航为分类按钮
var list = pdfa(html, 'body&&.nav-items');            // 导航条
for (var i in list) {
  d.push({
    title: pdfh(list[i], 'a&&Text'),
    url:   pd(list[i], 'a&&href').replace('index.html', 'vod/show/id/fyclass/page/fypage.html'),
    //                    ↑ 分类链接里嵌入 fyclass/fypage 占位，App 点击时自动替换
    col_type: 'icon_round_4'
  });
}
setResult(d);
```

**URL 占位符表**（App 自动替换）：

| 占位符 | 替换内容 |
|--------|---------|
| `fyclass` | 当前分类 ID |
| `fypage` | 当前页码 |
| `fyarea` | 地区分类 |
| `fyyear` | 年份分类 |
| `fysort` | 排序分类 |
| `fyAll` | 全部 |

**方式 B（少见，仅 8%）：静态分类**——顶层字段直接声明：

```json
{
  "class_name": "电影&电视剧&综艺",
  "class_url": "1&2&3",
  "url": "https://www.example.com/vodshow/id/fyclass/page/fypage.html"
}
```

---

## 4. 搜索怎么写

`search_url` 用 `**` 代替关键词（真实源 68 条都是这个模式），
`searchfind` 里用 `getResCode()` 拿 App 已请求完成的搜索页 HTML：

```js
// search_url:  https://www.example.com/search?q=**
// searchfind:
js:
var d = [];
var html = getResCode();                              // ★ 搜索页 HTML 已由 App 请求好
var list = pdfa(html, 'body&&.search-list&&li');
for (var i = 0; i < list.length; i++) {
  var item = list[i];
  d.push({
    title: pdfh(item, 'a&&title'),
    img:   pd(item, 'img&&src'),
    url:   pd(item, 'a&&href'),
    desc:  pdfh(item, '.remarks&&Text'),
  });
}
setResult(d);
```

> 搜索结果页的 HTML 是 App 请求好的（`getResCode()`），**不要在 searchFind 里再 fetch**，
> 否则多一次请求且拿不到（除非搜索接口是 POST 等需要 JS 内自行请求的场景）。

---

## 4.5 选择器完整语法（官方）

`parseDom/pd`（自动补域名）、`parseDomForHtml/pdfh`（原样返回）、`parseDomForArray/pdfa`（列表数组）

| 语法 | 含义 | 示例 |
|------|------|------|
| `&&` | 级联取子元素 | `.box&&a&&title` |
| `--` | 排除 | `body--a&&a&&href`（排除第一个 a 取下一个） |
| `\|\|` | 或（找不到前一个用后一个） | `#app\|\|#app2&&Text` |
| `,索引` | 取第 n 个（负数倒取） | `body&&a,1`、`body&&a,-1&&href` |
| `#id` / `.class` / `tag` | querySelector 风格 | `.list&&li` |
| `Text` / `Html` | 取文字 / 取带标签文本 | `a&&Text` |
| 其它 | 默认取属性 | `a&&href`、`img&&data-original` |
| `+` | 多选择器结果拼接 | `a,0&&title+'--'+a,1&&title` |
| `.js:代码` | 值用 JS 再处理 | `a&&href.js:'https://x?id='+input` |
| jsoup 原生语法 | 属性过滤等 | `body img[src$=.png]&&src` |

非 js 规则格式：`列表;标题;图片;描述;链接;显示样式`（搜索为 `列表;标题;链接;描述;详情;图片`，多余用 `*`）。

## 4.6 URL 链接增强与常用标识（官方）

**链接完整格式**：`地址;请求方式;编码;{header}`，例：
```
https://movie.dban.com/j/search?q=**;POST;gbk;{User-Agent@Windows&&Cookie@id}
```
- 关键词占位：`**`（冲突用 `%%`）；POST 参数照样写在 URL（问号用 `？？`）；JSON 用 `JsonBody={...}`
- 值可用 JS：`Timestamp@.js:new Date().getTime()`；header 内分号用中文 `；；`
- 图片自定义 header：`图片@headers={"User-Agent":"Windows"}`；旧式 `@Referer=x/@User-Agent=w/@Cookie=c`（Cookie 最后）
- 视频带 header：`https://a.baid.com/2.mp4;{Cookie@aaa&&Referer@a.baid.com}`

**常用链接标识**（请求时自动删除，仅标记用）：
`#isVideo=true#`（强制视频）、`#noHistory#`（不记足迹）、`#noRefresh#`、`#noLoading#`、
`#immersiveTheme#`（沉浸二级）、`#readTheme#`（阅读模式）、`#autoPage#`（自动下一章）、
`#autoCache#`（页面秒开缓存）、`#fastPlayMode#`（极速播放）、`#ignoreVideo=true#`（强制非视频）。
完整清单见官方帮助手册（doc: hiker-help）第 6 节。

---

## 5. 二级 / 详情页怎么写 🎯（最重要）

**核心认知：海阔视界的"二级详情页"也是一个列表** ——
你 `setResult` 一个数组，每个元素是一"块"内容（信息卡、简介文字、播放按钮、选系列表块）。
真实源（4K蓝光/七猫短剧）都是这种组织方式。

### 5.1 入口方式

- **有 `detail_find_rule`**（顶层字段）：点击列表项 → App 请求该 URL → 执行 detail_find_rule（同样 `js:` 代码）
- **没有 detail_find_rule**：点击列表项 → 跳 pages 子页面（`hiker://page/detail?url=…&rule=…`），子页面 `//js:` 模块里 setResult

### 5.2 详情页的常见"块"结构（真实样例 4K蓝光）

```js
js:
var d = [];
var html = getResCode();                              // 详情页 HTML 已请求好

// ① 信息卡块：海报 + 标题 + 简介
d.push({
  title: pdfh(html, '.module-info-item,1&&Text'),     // 标题
  desc:  pdfh(html, '.module-info-item,3&&Text'),     // 描述
  img:   pd(html, '.lazyloaded&&data-original') + '@Referer=',   // 海报
  url:   MY_URL,                                      // 点击同一页
  col_type: 'movie_1_vertical_pic_blur',
  extra: { gradient: true }
});

// ② 简介块：富文本（用 "''"'' 包裹 HTML）
d.push({
  title: "''''<font color='#666'>" + 简介 + "</font>'''",
  url: 'hiker://empty',
  col_type: 'rich_text'
});

// ③ 选系列表块：一条线路 = 一组按钮
var arts = pdfa(html, '#y-playList&&span');           // 线路名
var conts = pdfa(html, 'body&&.module-play-list');    // 各线路的选集区
for (var i = 0; i < arts.length; i++) {
  var episodes = pdfa(conts[i], 'body&&a');
  for (var j = 0; j < episodes.length; j++) {
    d.push({
      title: pdfh(episodes[j], 'a&&title'),
      url:   pd(episodes[j], 'a&&href'),              // 播放地址（见第 6 节协议）
      col_type: 'text_4'                              // 或 flex_button 等按钮样式
    });
  }
}
setResult(d);
```

### 5.3 选集跳播放的几种真实做法

```js
// A. 直接给播放地址（m3u8/mp4 直链）
url: 'http://…/1.m3u8#isVideo=true#'                  // #isVideo=true# 强制识别为视频

// B. 点击后执行一段 JS（动态规则）
url: 'http://…/play/1.html@rule=js:var d=[];d.push({title:MY_URL,col_type:"long_text"});setResult(d);'

// C. 点击后跳子页面模块（require 子页面）
url: $(播放页).rule(() => { require('hiker://page/down') })

// D. 嗅探：x5Rule://地址@JS（JS 内 _getUrls() 找 .mp4/.m3u8）
url: 'x5Rule://' + 播放页 + '@' + $.toString(() => {
  var urls = _getUrls();
  for (var i in urls) {
    if (urls[i].match(/\.mp4|\.m3u8/)) return urls[i];
  }
})

// E. 网页版解析：webRule://地址@JS
url: 'webRule://' + 播放页 + '@' + $.toString(() => {
  var urls = _getUrls();
  for (var i in urls) { if (urls[i].match(/\.m3u8/)) return urls[i]; }
})
```

### 5.4 详情页富文本

富文本块用 `"''"''"`（两个左单引号 + 两个右单引号）包裹 HTML，`col_type: rich_text` 或 `long_text`：

```js
title: "''''<font color='#0088cc'>" + 内容 + "</font>''''",
url: 'hiker://empty',
col_type: 'long_text'
```

---

## 6. 播放地址解析协议字典（真实使用率）

| 协议 | 真实使用率 | 用法 | 场景 |
|------|-----------|------|------|
| 直链 m3u8/mp4 | 大量 | `http://…/x.m3u8`（可选 `#isVideo=true#`） | 播放地址已知 |
| `hiker://empty##真实地址` 包装 | 13 条 | 详情页 `MY_URL.replace('hiker://empty##','')` 还原 | 传输任意地址给下一页 |
| `x5Rule://地址@JS` | 8 条 | JS 里 `_getUrls()` 嗅探 `.mp4/.m3u8` | 播放地址藏在 JS/iframe 里 |
| `webRule://地址@JS` | 199 条 | 同上，但用网页版方式解析 | 通免/网页解析 |
| `video://地址` | 2 条 | 老式直链协议 | 兼容旧格式 |
| `@lazyRule=.js:代码` | 19 条 | URL 后挂动态解析代码 | 点击时才解析 |
| `@rule=js:代码` | 18 条 | URL 后挂动态规则 | 点击后执行一段 js 出结果 |
| `pics://图1&&图2` | 11 条 | 图片列表直接渲染 | 图片/漫画 |
| `@Referer=xxx` | 23 条 | URL 后追加防盗链 referer | 图/视频防盗链 |
| `hiker://play?url=` | 少量 | 官方播放页路由 | 需官方解析的源 |

**通用规律**：真实视频源绝大多数直接把 m3u8/网页播放页地址拼进 `url` 字段，
App 自动识别处理（`.m3u8` 自动当视频播）；需要解析的用 `x5Rule://` / `webRule://` /
`@lazyRule=` / `@rule=` 四种动态方式。

---

## 7. 各类型数据返回协议

### 视频源 video（210 条）
- 列表/详情都走「列表 push → setResult(d)」（见第 2、5 节）
- 选集按钮 col_type 常用：`text_4` / `flex_button` / `icon_4_card`

### 图片/漫画 picture/cartoon（13+1 条）
- 列表项 url 直接给 `pics://图1&&图2`，col_type 图片样式（`pic_3`/`movie_1_vertical_pic`）
- 或点击后 `lazyRule` 返回 `pics://`（先 fetch 详情页收集所有图）：

```js
js:
var d = [];
var list = pdfa(html, 'body&&.pic-list&&li');
for (var i in list) {
  d.push({
    title: pdfh(list[i], 'img&&alt'),
    img:   pd(list[i], 'img&&lay-src') + '@Referer=',
    url: $(pd(list[i], 'a&&href')).lazyRule(() => {   // 点击后动态拿图
      var html = fetchPC(input);
      var pics = [];
      pdfa(html, 'body&&#showimg&&img').forEach(x => pics.push(pd(x, 'src')));
      return 'pics://' + pics.join('&&');             // ★ 返回 pics:// 协议
    }),
    col_type: 'pic_3'
  });
}
setResult(d);
```

### 音乐 music（14 条）
- 播放：直接给 mp3 地址或 `x5Rule://` 嗅探（`_getUrls()` 匹配 `.mp3`）
- 歌词：App 播放器支持 `lyric` 字段（见 hiker.d.ts urls 类型 `{urls, lyric}`）

### ★ 多线路/字幕/弹幕/音频分离（url 字段直接写 JSON 字符串）

```js
url: JSON.stringify({
  urls:    ['http://x/1.mp4', 'http://x/2.mp4'],      // 必选
  names:   ['超清', '高清'],                           // 线路名，可选
  headers: [{'Referer':'xxx'}, {'Referer':'yyy'}],    // 可选，分号用；；代替
  subtitle: 'http://x/1.srt',                         // 外挂字幕 srt/vtt/ass
  danmu:   'http://x/1.xml',                          // 弹幕（xml/json/web://）
  lyric:   'http://x/1.lrc'                           // 歌词
})
// 音频分离（视频与音频不同地址）:
url: JSON.stringify({ urls: [v], audioUrls: [a] }), col_type: 'text_3'
// audioUrls 长度与 urls 一致；单元素则多线路复用同一音频
```

### 阅读 read（11 条）
- 章节列表：同视频选集，「按钮列表 push → setResult」
- 正文：富文本块（`rich_text` / `long_text` + 换页按钮）
- 智能加载正文：详情页子页面规则写 `js: loadReadContentPage(MY_PARAMS.u)`（官方接口，自动提取正文+下一页）

### 资讯 news（13 条）
- 列表同主页模板；详情用 pages 子页面渲染富文本/网页（YINRSS 的 detail 子页面就是范例）

### 直播 live（2 条）
- 列表项 url 直接给 `直播流地址`（.m3u8/.flv），点击即播
- `playUrls`/`playNames` 字段支持多线路（青豆框架字段，原生源少用）

### 工具 tool（44 条）
- 列表项多为按钮/输入框：`col_type: input`、`scroll_button`、`avatar`、`text_center_1`
- 常用 `toast://`、`copy://`、`download://`、`share://` 协议做动作

---

## 8. 完整可照抄模板集

### 8.1 干净视频源（js: 一套走完，含主页+详情+搜索）

```json
{
  "title": "示例影视",
  "type": "video",
  "author": "AI",
  "version": 1,
  "url": "hiker://empty##https://www.example.com/page/fypage.html",
  "col_type": "movie_3",
  "detail_col_type": "movie_1",
  "sdetail_col_type": "movie_1",
  "search_url": "hiker://empty##https://www.example.com/search?q=**",
  "ua": "mobile",
  "find_rule": "js:var d=[];MY_URL=MY_URL.replace('hiker://empty##','');var html=request(MY_URL);var list=pdfa(html,'body&&.vod-item');for(var i=0;i<list.length;i++){var it=list[i];d.push({title:pdfh(it,'a&&title'),desc:pdfh(it,'.remarks&&Text'),img:pd(it,'img&&data-original'),url:'hiker://empty##'+pd(it,'a&&href')});}setResult(d);",
  "detail_find_rule": "js:var d=[];MY_URL=MY_URL.replace('hiker://empty##','');var html=request(MY_URL);d.push({title:pdfh(html,'.info-title&&Text'),desc:pdfh(html,'.info-desc&&Text'),img:pd(html,'.poster&&img&&src'),url:MY_URL,col_type:'movie_1_vertical_pic'});d.push({col_type:'line'});var eps=pdfa(html,'body&&.play-list&&a');for(var j=0;j<eps.length;j++){d.push({title:pdfh(eps[j],'a&&title'),url:pd(eps[j],'a&&href'),col_type:'text_4'});}setResult(d);",
  "searchfind": "js:var d=[];var html=getResCode();var list=pdfa(html,'body&&.search-list&&li');for(var i=0;i<list.length;i++){var it=list[i];d.push({title:pdfh(it,'a&&title'),img:pd(it,'img&&src'),url:'hiker://empty##'+pd(it,'a&&href'),desc:pdfh(it,'.remarks&&Text')});}setResult(d);",
  "pages": "[]"
}
```

> 模板要点核对：`setResult(d)` 结尾 ✅ / 无 return ✅ / 用 title/url/img/desc ✅ /
> findByRule 一次性给全 ✅ / 搜索结果用 getResCode ✅

### 8.2 图片源

```js
// find_rule
js:
var d = [];
var html = getResCode();
var list = pdfa(html, 'body&&.pic-list&&li');
for (var i = 0; i < list.length; i++) {
  var it = list[i];
  d.push({
    title: pdfh(it, 'img&&alt'),
    img: pd(it, 'img&&src') + '@Referer=',
    url: $(正则提取的详情地址).lazyRule(() => {
      var h = fetchPC(input);
      var pics = [];
      pdfa(h, 'body&&#showimg&&img').forEach(x => pics.push(pd(x, 'src')));
      return 'pics://' + pics.join('&&');
    }),
    col_type: 'pic_3'
  });
}
setResult(d);
```

### 8.3 资讯源（列表 + 富文本详情）

```js
// find_rule: 同主页模板（title/url/img/desc）
// 详情：pages 子页面，正文渲染成富文本
//js:
var d = [];
var html = request(MY_URL);
d.push({
  title: "''''" + pdfh(html, 'body&&.article-content&&Html') + "''''",
  url: 'hiker://empty',
  col_type: 'rich_text'
});
setResult(d);
```

### 8.4 工具源（输入框 + 动作）

```js
// find_rule
js:
var d = [];
d.push({
  title: "搜索",                                     // col_type: input 时 title 是输入框标签
  url: "'hiker://search?s='+input",                  // input 是用户输入的关键词
  col_type: 'input',
  extra: { defaultValue: '' }
});
d.push({
  title: "打开官网",
  url: "https://www.example.com",
  col_type: "avatar"
});
setResult(d);
```

---

## 9. AI 写源反例清单（必须避免）

| ❌ 错误写法 | ✅ 正确写法 | 原因 |
|-----------|-----------|------|
| `js: … var list=[…]; return list;` | `js: … setResult(list);` | js: 格式被 eval，return 无效 |
| `d.push({vod_name:…, vod_pic:…})` | `d.push({title:…, img:…, url:…})` | 原生源不用 vod_ 前缀（361 条 0 使用） |
| 用 `createDetailResult()` 做二级 | 直接 push 各块 + setResult | createDetailResult 是青豆框架函数，原生源 0 使用 |
| 二级详情 `setResult(单个对象)` | `setResult([…块数组])` | 详情页也是列表，一块一元素 |
| `searchFind` 里 `request(search_url)` | `getResCode()` | 搜索页 HTML 已由 App 请求好 |
| 图片不带防盗链 | `img + '@Referer=站点'` | 多数图站防盗链 |
| `pdfa(html,'body&&…')` 但 html 是片段 | 用片段内相对选择器 | body&& 只用于完整 HTML |
| 用 `let/const` | 用 `var` | 沙箱兼容性（虽然很多真源也用 let，保守用 var） |

---

## 10. 疑难写法处理

本文档已提炼 361 条真实规则的共性，覆盖绝大多数写源场景。个别疑难写法
（加密、签名、特殊 API）的处理原则：

- 先按「9. 反例清单」自查是否踩了常见错误
- 结合本文档第 5、6 节的协议字典推理（url 包装、x5Rule/webRule、@lazyRule/@rule= 等）
- 仍不确定时，向用户确认目标站点的实际响应数据，不要凭空编造选择器或加密算法