# 海阔视界视频源写源模板 · 渲染通用型

> 基于社区开发框架提取的公共框架（★采集点模式）。核心思想：
> **模板只负责渲染，不关心数据从哪来。** 数据可能是 API 返回的 JSON，也可能是 HTML 页面解析——AI 拿到源后自行分析数据来源，只需把「渲染需要的字段」喂给模板即可。
> `★采集点` = AI 需要处理数据的唯一位置。
>
> **文档定位**：**写视频源/视频小程序一律优先使用本模板**。渲染层固定，
> AI 只负责在每个 ★采集点分析源站数据并返回标准对象。API 细节以官方帮助手册
> (doc: hiker-help) 为准。
>
> ★ 修正说明（较原始模板）：
> 1. `type` 为 `video`（本模板是视频源；原稿误写 read）
> 2. 简介卡片用「点击展开完整简介」写法（@rule 动态规则渲染全文，见第六章）
> 3. `putVar/getVar` 改为 `putMyVar/getMyVar`（规则内隔离，避免跨规则污染）；
>    排序切换写 `putMyVar('shsort', '0'|'1')`（官方签名 key+value 两个参数）

---

## 一、模板总览

规则 = 一个**页面内嵌 find_rule 的视频规则**。数据获取与渲染彻底分离：

```
                ┌─────────────────────────────────────┐
                │          渲染层（模板已写好，勿改）        │
顶层 JSON        │                                       │
 ├── find_rule → │  ① 首页 + 分类列表渲染  d.push(...)     │
 ├── searchFind→ │  ② 搜索列表渲染                         │
 └── detail_find→│  ③ 详情页渲染（封面/简介/多线路/选集）     │
                  └─────────────▲───────────────────────┘
                                │  ★采集点：喂标准数据对象
                  ┌─────────────┴───────────────────────┐
                  │  数据层（AI 自行分析，模板不管）            │
                  │   - API：fetch → JSON → 取字段          │
                  │   - HTML：request → pdfa/pdfh → 取字段  │
                  └───────────────────────────────────────┘
```

> **铁律：** 渲染层（setResult、卡片 push、简介卡片、setTabs、setLists）**固定不要动**。AI 的工作只有一处——在 `★采集点` 把源数据整理成渲染层需要的标准对象。**你不需要在模板里写任何 API 调用或 HTML 选择器**，全部由 AI 分析后填进来。

### 本版机制速览

| 项       | 机制                                      | 说明                                                         |
| -------- | ----------------------------------------- | ------------------------------------------------------------ |
| 分类机制 | **顶层静态** (`class_name`/`class_url`)   | 机制固定；**但具体分类名/ID 由 AI 分析源后填入（★采集点 0）** |
| 主页入口 | `url: "hiker://empty##fyclass##fypage"`   | App 把「当前分类 ## 页码」拼进 `MY_URL`                      |
| 当前分类 | `MY_URL.split("##")[1]`                   | find_rule 里取                                               |
| 当前页码 | `MY_URL.split("##")[2]`                   | find_rule 里取                                               |
| 首页判断 | `分类 == 1 && 页码 == 1`                  | 第 1 个分类第 1 页渲染轮播 + 分区块                          |
| 分类列表 | `分类 != 1`                               | 渲染该分类页码列表                                           |
| 搜索     | `search_url: "hiker://empty##**##fypage"` | 关键词拼进 URL 第 2 段                                       |

---

## 二、渲染层需要的数据结构（给 AI 看的契约）

每个渲染函数，AI 必须提供下面这些字段。**这是 AI 理解和填充模板的唯一依据。**

### 2.1 列表数据（首页/分类/搜索共用）

每条 = 一个卡片对象：

```javascript
{
  title: "片名",          // ★必须：卡片标题
  desc: "更新至12集",      // ★必须：描述
  img: "https://...封面图", // ★必须：封面（相对路径需转绝对）
  url: "https://...详情页", // ★必须：跳转详情的最终地址
  col_type: "movie_3_marquee" // 表格样式（模板默认，可不改）
}
```

### 2.2 首页分区标题

```javascript
{ 分区名, 卡片数组 }
```

模板会把一个分区分组渲染为「富文本标题 + 一排卡片」。

### 2.3 详情页数据

| 字段              | 必须 | 说明                                         |
| ----------------- | ---- | -------------------------------------------- |
| `标题`            | ✅    | 片名                                         |
| `主演`            | 可选 | 演员列表                                     |
| `更新`            | 可选 | 更新状态/评分                                |
| `图片`            | ✅    | 封面大图                                     |
| `简介`            | 可选 | 剧情简介                                     |
| `线路名数组 tabs` | ✅    | 如 `['线路1','线路2']`                       |
| `选集数组 lists`  | ✅    | 每线路一个数组，如 `[['第1集','第2集'],...]` |

### 2.4 播放数据

只需要最终能定位到真实播放地址的东西。常见形式：

- 直连视频流地址（`.m3u8` / `.mp4`）
- 一个播放页地址，点击时二次解析

> AI 自行决定怎么拿到播放地址，模板只负责「把得到的地址返回」。

---

## 三、顶层 JSON 结构模板（静态分类模式）

> **静态分类模式：** 分类名称与 ID 在顶层写死（`class_name`/`class_url`），`&` 分隔且一一对应。主页、搜索都用 URL 分段传参。

```jsonc
{
  "title": "目标站点名",              // ★ 改站点名
  "author": "AI",                     // ★ 改作者
  "version": 1,
  "type": "video",                    // ★ 视频源
  // 主页入口：##fyclass##fypage = App 把「当前分类 ## 页码」拼进 URL
  "url": "hiker://empty##fyclass##fypage",
  "col_type": "movie_3",
  "group": "①影视",
  // ★采集点 0：静态分类数据（AI 分析源后填入，不是固定值！）
  //   class_url(ID) 会替换 url 里的 ##fyclass##，驱动 home/category
  //   首项固定为「首页/推荐」，其 ID 写 1
  //   ⚠️ 分类名和 ID 必须从源里分析得到，禁止照抄示例
  "class_name": "……AI 填，用 & 分隔，如「首页&电影&电视剧」（示例，勿照抄）",
  "class_url": "……AI 填，用 & 分隔，如「1&dianying&dianshi」（示例，勿照抄）",
  "find_rule": "js:\n<见第四章：首页 + 分类列表>",
  // 搜索：##**##fypage = 关键词拼进 URL 第 2 段
  "search_url": "hiker://empty##**##fypage",
  "searchFind": "js:\n<见第五章>",
  "detail_col_type": "movie_1",
  "detail_find_rule": "js:\n<见第六章>",
  "ua": "mobile",
  "pages": "[<可选子页面>]"
}
```

> **分类 ID 约定：** 首项「首页/推荐」的 ID 写 `1`。`tag_id==1` 表示首页，`tag_id>1` 表示具体分类。
>
> **分类数据怎么来（★采集点 0）：** AI 打开源站，**自己分析出**站点的分类导航（哪个 tag 对应首页、哪个对应电影/电视剧……），再填进 `class_name`/`class_url`。通常：
> - API 源：请求分类接口，取 `{type_name, type_id}`，`type_id` 就是 `class_url` 的 ID
> - HTML 源：解析分类导航 DOM，取 `{显示文本, href}`，从 `href` 里提取 ID
> - 站点的某个入口对应「全部/首页」，把它定为 ID=1 的首项

---

## 四、find_rule —— 首页 + 分类列表渲染模板（渲染层固定）

```javascript
// ============ 渲染层开始 ============
var d = [];                     // 主列表（最终 setResult 渲染）
var tag_id = MY_URL.split("##")[1];   // ★ 当前分类 ID（约定：1=首页）
var page = MY_URL.split("##")[2];     // ★ 当前页码（App 自动递增）
page = parseInt(page) || 1;

var homeUrl = "https://目标站点/";  // ★ AI 填：站点根地址（用于拼相对路径）

// 工具：相对路径封面转绝对（渲染层固定，AI 保留即可）
function getRealPicUrl(pic) {
    if (!pic.includes('http')) pic = homeUrl + pic;
    return pic;
}

try {
    // ===== 首页：分类1 且 第1页 =====
    if (tag_id == 1 && page == 1) {
        /* ┌────────────────────────────────────────────┐
           │ ★采集点 ①：首页轮播（可选，无则删）           │
           │ AI 在此获取轮播数据：                       │
           │   [{ title, img, url }, ...]              │
           └────────────────────────────────────────────┘ */
        var 轮播 = AI采集轮播();    // ← AI 实现，无则留空

        /* ┌────────────────────────────────────────────┐
           │ ★采集点 ②：首页分区块                        │
           │ AI 在此获取首页分区内容，每组：              │
           │   { 分区名, 卡片数组 [{title,desc,img,url}] }│
           └────────────────────────────────────────────┘ */
        var 区块 = AI采集首页();    // ← AI 实现，返回分区块数据
        区块.forEach(group => {
            // 分区标题（渲染层固定）
            d.push({
                title: '▍<b>' + group.分区名 + '</b>',
                col_type: "rich_text"
            });
            // 分区内卡片（渲染层固定）
            group.卡片数组.forEach(card => {
                d.push({
                    ...card,
                    img: getRealPicUrl(card.img),          // 相对转绝对
                    col_type: 'movie_3_marquee'
                });
            });
        });
    }

    // ===== 其他分类：渲染该分类第 page 页列表 =====
    else if (tag_id != 1) {
        /* ┌────────────────────────────────────────────┐
           │ ★采集点 ③：分类列表                         │
           │ AI 在此用「tag_id(分类) + page(页码)」获取列表：│
           │   [{ title, desc, img, url }, ...]         │
           │ 记得把 tag_id 和 page 传给数据源             │
           └────────────────────────────────────────────┘ */
        var list = AI采集分类(tag_id, page);   // ← AI 实现
        list.forEach(card => {
            d.push({
                ...card,
                img: getRealPicUrl(card.img),   // 相对转绝对
                col_type: 'movie_3_marquee'
            });
        });
    }
} catch (e) { log(e.message); }

setResult(d);    // ★ 最终渲染列表
// ============ 渲染层结束 ============
```

> **机制说明：**
> ① `MY_URL.split("##")[1]` = 当前分类，`[2]` = 当前页码，翻页由 App 改 `fypage` 段自动触发；② `tag_id==1 && page==1` 才是首页（轮播 + 分区），翻到首页第 2 页时走 `else` 分支渲染更多列表；③ 相对路径封面统一用 `getRealPicUrl` 转绝对。

### 4.1 采集点说明

AI 只需替换 `AI采集轮播`、`AI采集首页`、`AI采集分类` 三个函数。若站点首页/分类结构复杂，
也可抽成子页面模块方法（find_rule 改为 `$.require("规则名").home()` 等），模块命名规则见
《写源模板手册》(doc: blueprint) 与官方帮助手册「$ 工具」（子页面模块名 = 规则名本身）。

---

## 五、searchFind —— 搜索渲染模板（渲染层固定）

> 与 URL 拼接搜索衔接：顶层 `search_url` 用 `hiker://empty##**##fypage`，App 把搜索关键词放进 URL 第 2 段。这里用 `MY_URL.split("##")` 读取。

```javascript
var d = [];
var word = MY_URL.split("##")[1];   // ★ 关键词从 URL 第 2 段取
var page = MY_URL.split("##")[2];   // ★ 页码（App 自动翻页）
page = parseInt(page) || 1;

var homeUrl = "https://目标站点/";  // ★ AI 填：站点根地址

if (!word) { setResult(d); return; }   // 无关键词则不渲染

/* ┌────────────────────────────────────────────┐
   │ ★采集点：搜索结果数据                        │
   │ AI 在此获取，返回卡片数组：                  │
   │   [{ title, desc, img, url }, ...]         │
   │ 记得把 word（关键词）和 page 传给数据源     │
   └────────────────────────────────────────────┘ */
var list = AI搜索(word, page);   // ← 替换成 AI 自己的数据获取方式

list.forEach(card => {
    d.push({
        ...card,
        img: card.img.includes('http') ? card.img : homeUrl + card.img,   // 相对转绝对
        col_type: 'movie_3_marquee'
    });
});

setResult(d);
```

> 本模板不渲染顶部搜索框（`col_type:"input"`），搜索入口由 App 自带搜索按钮触发，关键词走 URL。
> 若想让搜索进详情页二次解析，可在卡片 `url` 末尾加 `@rule=js:$.require("子页面模块")`。

---

## 六、detail_find_rule —— 详情页渲染模板（核心，渲染层固定）

```javascript
var d = [];
var html = getResCode();   // ★ AI 可用的当前详情页源码（若数据源是 HTML）
                            //   若数据源是 API，AI 忽略这行，改用自己方式拿详情数据

var homeUrl = "https://目标站点/";  // ★ AI 填：站点根地址

function getRealPicUrl(pic) {          // 工具：相对转绝对（渲染层固定）
    if (!pic.includes('http')) pic = homeUrl + pic;
    return pic;
}

/* ┌────────────────────────────────────────────┐
   │ ★采集点：详情基础数据                         │
   │ AI 在此获取并整理：                          │
   │   标题, 主演(可选), 更新(可选), 图片, 简介    │
   │   来源可为 API JSON 或 HTML 解析              │
   └────────────────────────────────────────────┘ */
var 详情 = AI采集详情();    // ← 替换成 AI 自己的数据获取方式，含字段：
// 详情 = { 标题, 主演, 更新, 图片, 简介 }

// ===== 封面大图卡片（渲染层固定）=====
d.push({
    title: 详情.标题 + '\n\n' + (详情.更新 || ''),
    desc: 详情.主演 || '',
    pic_url: getRealPicUrl(详情.图片),
    url: MY_URL + '#noHistory#',
    col_type: 'movie_1_vertical_pic_blur',
    extra: { gradient: true }
});

// ===== 简介卡片（渲染层固定，勿改）=====
//  点击卡片 → @rule 动态规则渲染完整简介（长文不挤版面）
if (详情.简介) {
    d.push({
        title: '简介：'.fontcolor("#1e90ff").bold() + 详情.简介.substr(0, 55).small() + '...详情'.fontcolor("red").small(),
        url: 'hiker://empty##noHistory#' + '\n' + 详情.简介 + '@rule=js:...',
        col_type: 'text_1'
    });
}

// 预留空位，避免线路/选集紧贴简介（渲染层固定）
for (let i = 0; i < 8; i++) d.push({ col_type: 'blank_block' });

/* ┌────────────────────────────────────────────┐
   │ ★采集点：多线路 + 选集数据                   │
   │ AI 在此获取并整理：                          │
   │   tabs = ['线路1', '线路2']  线路名数组      │
   │   lists = [['第1集','第2集'], ['第1集',...]] │
   └────────────────────────────────────────────┘ */
var 线路 = AI采集选集();    // ← 替换成 AI 自己的数据获取方式
var tabs = 线路.tabs;       // 线路名数组
var lists = 线路.lists;     // 每线路选集数组

// ===== 排序 + 线路 tab 渲染（渲染层固定）=====
function setTabs(tabs, vari) {
    d.push({
        title: (getMyVar('shsort', '0') == '1') ? '降序' : '正序',
        url: '#noLoading#@lazyRule=.js:var c=getMyVar("shsort","0");putMyVar("shsort",c=="1"?"0":"1");refreshPage();',
        col_type: 'scroll_button'
    });
    for (var i = 0; i < tabs.length; i++) {
        d.push({
            title: getMyVar(vari, '0') == i ? '❆' + tabs[i] + '❆' : tabs[i],
            url: '#noLoading#@lazyRule=.js:putMyVar("' + vari + '","' + i + '");refreshPage(false);',
            col_type: 'scroll_button',
            extra: { 'backgroundColor': getMyVar(vari, '0') == i ? '#5cb85c' : '' }
        });
    }
    d.push({ col_type: 'line' });
}

// ===== 选集渲染（渲染层固定）=====
function setLists(lists, index) {
    var list = lists[index];
    if (getMyVar('shsort', '0') == '1') { list = lists[index].slice().reverse(); }
    for (var j in list) {
        var 选集标题 = list[j];   // AI 给的选集名（如 "第1集"/"01"/"EP01"）
        d.push({
            title: 选集标题.small(),
            url: $("#noLoading#").lazyRule(() => {
                /* ┌──────────────────────────────────┐
                   │ ★采集点：播放地址（详见 6.1）      │
                   │ 这里 AI 用自己的方式拿播放地址并返回 │
                   └──────────────────────────────────┘ */
                return AI解析播放(选集标题, index, j);
            }),
            col_type: list.length > 3 && 选集标题.length < 5 ? 'text_5' : 'text_2',
            extra: { videoRules: ['videoType=1', '*.m3u8'], blockRules: ['.png', '.jpg'] }
        });
    }
}

setTabs(tabs, MY_URL);
setLists(lists, getMyVar(MY_URL, '0'));
setResult(d);
```

### 6.1 播放解析 —— AI 只需返回可播放地址

播放地址解析是 `★采集点` 的最后一块。

```javascript
function AI解析播放(选集标题, 线路索引, 集索引) {
    // ★ AI 在此分析源后，自行实现播放地址的获取。
    //   拿到真实播放地址后，返回带协议的字符串：
    //     "#isVideo=true#" + 视频流地址   → 直连 m3u8/mp4
    //     或 "video://..."                  → 兜底协议
    //   ⚠️ 不要照抄固定接口路径或正则，按源实际情况写。
}
```

> **返回格式：** 播放地址必须带 `#isVideo=true#`（直连视频流）或以 `video://` 开头。**这是播放能否成功的唯一关键。**

---

## 七、pages 子页面注册（可选）

```jsonc
"pages": "[
  {\"col_type\":\"movie_3\",\"name\":\"模块名\",\"path\":\"取个ID\",
   \"rule\":\"//js:\\n...业务逻辑或公共函数...\\n$.exports = {函数1, 函数2}\"},
  ....
]"
```

> 子页面 rule 必须以 `//js:` 开头、被 `$.require` 引用的模块以 `$.exports = ...` 结尾；
> `path` 与 `$.require("X")` 一致。

---

## 八、AI 写源操作清单

| 步骤 | AI 操作                                                      | 涉及       |
| ---- | ------------------------------------------------------------ | ---------- |
| 1    | 打开源，**判断数据来源**：API 接口 还是 HTML 页面            | 全局       |
| 2    | 改站点名、默认域名                                           | 顶层 JSON  |
| 3    | **分析源站分类导航，填 `class_name`/`class_url`（★采集点 0）** | 顶层 JSON  |
| 4    | 在 `★采集点①轮播` 获取轮播数据（无则删）                     | find_rule  |
| 5    | 在 `★采集点②首页` 获取首页分区块                             | find_rule  |
| 6    | 在 `★采集点③分类` 获取分类列表                               | find_rule  |
| 7    | 在 `★采集点搜索` 获取搜索结果                                | searchFind |
| 8    | 在 `★采集点详情` 获取标题/主演/更新/图片/简介                | detail     |
| 9    | 在 `★采集点选集` 获取 tabs + lists                           | detail     |
| 10   | 在 `★采集点播放` 实现地址解析                                | detail 6.1 |
| 11   | MCP `validate_rule` 校验                                     | 全局       |

> **AI 唯一要做的：** 判断数据来源 → 分析源站分类导航填入 `class_name`/`class_url` → 在每个 ★采集点把数据整理成渲染层要的结构。渲染层全部固定。

---

## 九、检查清单

| #    | 检查项                                                       | 错误后果            |
| ---- | ------------------------------------------------------------ | ------------------- |
| 1    | 顶层有 `url`(##fyclass##fypage) + `col_type` + `find_rule`   | 缺失 → 纯搜索小程序 |
| 2    | `class_name` 与 `class_url` `&` 分隔且一一对应，首项 ID=1    | 不对应 → 分类错乱   |
| 3    | find_rule 用 `MY_URL.split("##")` 取分类/页码                | 取错 → 分类内容错   |
| 4    | 每个 ★采集点**返回了渲染层要的字段**                         | 少了 → 卡片渲染异常 |
| 5    | 列表数据含 title/img/url/col_type                            | 缺 → 卡片空         |
| 6    | 封面图相对路径已转绝对                                       | 没转 → 图片裂       |
| 7    | 详情简介用「简介卡片 + @rule 展开全文」写法               | 不用 → 长简介挤版面 |
| 8    | 详情含 tabs（线路名）+ lists（选集）                         | 缺 → 无法选集       |
| 9    | 播放返回带 `#isVideo=true#` 或以 `video://` 开头              | 不带 → 无法播放     |
| 10   | 分页用 `##fypage`（App 自动递增）                            | 不用 → 无法翻页     |
| 11   | 搜索用 `##**` 段取关键词                                     | 不用 → 搜不到       |
| 12   | `pages` 子页面 rule `//js:` 开头、被引用模块 `$.exports` 结尾 | 缺 → 加载失败       |

---

*海阔视界写源模板 · 渲染通用型 v3 · 静态分类 + URL 拼接分页，渲染层固定，数据获取由 AI 按源分析（API or HTML 均可）*