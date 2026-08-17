# 海阔视界视频源写源模板

> 基于社区成熟视频源公共框架提取，标注每个区块「写什么、干什么」，供 AI 写源时直接套用
>
> **文档定位**：**写视频源/视频小程序一律优先使用本模板**（模块化框架，
> 顶层 JSON + 子页面模块 + `$.require` + 多线路选集）。它同时覆盖单线路与多线路源
> （单线路源通过 map_list 归一化成单线路即可），适合所有视频源。
> API 细节以《官方帮助手册》(doc: hiker-help) 为准；非视频源（图片/资讯/阅读等）参考
> 《写源模板手册》(doc: blueprint)。

---

## 一、总览：一个规则由什么组成

海阔视界的一个规则 = **顶层 JSON 配置** + **若干子页面模块（pages）**。顶层配置决定规则的入口、样式、搜索方式；子页面模块是真正的 JS 代码，负责渲染首页、搜索、详情、播放。

```
顶层 JSON  →  find_rule  →  子页面模块【规则名】→  setResult(d)
入口/样式      js:$.require("规则名").home()   home/search/detail/play   渲染列表到 App
```

> **★ 模块命名规则（AI 必须遵守）：**
> 子页面模块名 **取规则名本身**（如规则名「某某影视」→ 模块名「某某影视」），
> 不要照抄模板示例模块名（hmhome/hmys 是旧示例名，不是通用名）。
> 模块名出现的位置**必须全部一致**：顶层 `find_rule`/`searchFind` 里的
> `$.require("X")`、`pages` 中的 `path`、模块内互相调用 `$.require("X")`。
>
> **核心理解：** 顶层 JSON 的 `find_rule` / `searchFind` 只是「入口指针」，真正干活的是 `$.require("规则名").函数()` 指向的子页面模块代码。所以写源的核心 = 写一个结构良好的模块对象，并在顶层 JSON 里正确引用它。

---

## 二、顶层 JSON 模板（带注释）

这是规则的整体配置，直接决定 App 里规则长什么样。**必填**字段缺失会导致「纯搜索小程序」。

```jsonc
// ============ 海阔视界规则 · 顶层 JSON 模板 ============
{
  // ---- 基本信息 ----
  "title": "规则名称",            // 规则名（App 列表展示）
  "author": "作者",              // 作者名
  "version": 1,                  // 版本号（数字）
  "type": "video",               // 源类型：video / all / live
  "group": "①影视",             // 分组（App 侧边栏分类）

  // ---- 主页入口（必填，缺失 → 纯搜索）----
  "url": "hiker://empty?page=fypage",  // 主页入口，fypage = 分页页面
  "col_type": "movie_2",        // 列表卡片样式
  "detail_col_type": "movie_3",  // 详情页样式
  "sdetail_col_type": "movie_1", // 二级详情样式
  "find_rule": "js:$.require(\"规则名\").home()", // ★ 主页数据来源：调用模块函数；【规则名】= 规则标题（如「某某影视」），勿用示例名

  // ---- 搜索（可选，但搜索源必须有）----
  "search_url": "hiker://empty?page=fypage&kw=**", // 搜索入口，** = 关键词占位
  "searchFind": "js:putMyVar('keyword', getParam('kw'));$.require(\"规则名\").search()", // ★ 搜索逻辑，模块名与 find_rule 一致

  // ---- 可选增强 ----
  "ua": "mobile",                 // 请求 UA（不写则用默认）
  "preRule": "// 版本说明\nsetItem(...)", // 前置初始化（版本说明、全局变量等）
  "class_name": "",              // 分类标签（可选，& 分隔）
  "class_url": "",               // 分类 ID（可选，& 分隔）

  // ---- 子页面模块（必填，否则无代码可执行）----
  "pages": [
    {
      "name": "主页",              // 页面显示名
      "path": "规则名",            // ★ 模块名 = 规则标题（如「某某影视」），必须与 $.require("规则名") 一致
      "col_type": "movie_3",      // 该页卡片样式
      "rule": "//js:\n...完整模块代码..." // ★ 必须以 //js: 开头，$.exports 结尾
    }
  ]
}
```

> ⚠️ **易错点：** ① `pages` 中的 `path` 必须与 `find_rule` / `searchFind` 里的 `$.require("X")` 完全一致；② 子页面 `rule` 必须以 `//js:` 开头、被引用模块必须以 `$.exports = ...` 结尾；③ 顶层缺 `url` / `col_type` / `find_rule` 会显示「纯搜索小程序」。

---

## 三、模块 JS 框架模板（核心）

这是写源的核心部分。模块是一个**大对象**，按职责分为 5 个区块。AI 写源时按这个骨架填充即可。

```javascript
// ============================================================
// 模块名：【规则名】（主页模块）★ 规则名 = 规则标题，如「某某影视」
// 被 $.require("规则名") 引用，必须以 $.exports 导出
// ============================================================

const 规则名 = {   // ★ const 后的名字 = 规则标题；下方 $.exports = 规则名 保持一致

  // ========== ① 数据区：页面渲染的容器 ==========
  d: [],        // 主数据数组：列表项，最终 setResult(d) 渲染
  d_: [],       // 预渲染数组：导航/loading，setPreResult(d_) 先渲染
  author: '',   // 作者
  title: '',    // 规则名
  version: 0,   // 版本号

  // ========== ② 配置区：站点参数与密钥 ==========
  host: '',           // 站点地址（可 getItem 持久化，支持换域名）
  headers: {},        // 请求头（UA、token、签名参数等）
  key: '', iv: '',  // 加密密钥（接口需解密时用）
  loading: {          // loading 动画配置（可选）
    img: "...", url: "hiker://empty",
    col_type: "pic_1_full", extra: { id: "loading_" }
  },

  // ========== ③ 工具函数区：通用能力封装 ==========
  request: function (url, data) { /* 统一请求：fetch 获取原始内容（JSON 或 HTML），解析方式由调用方决定 */ },
  init: function () { /* 初始化：设备ID、token、请求头 */ },
  login: function () { /* 鉴权：获取 token 并缓存 */ },
  decryptData: function (ciphertext) { /* 解密响应（如需） */ },
  color: function (txt) { /* 文字着色工具 */ },
  strong: function (d, c) { /* 加粗高亮工具 */ },

  // ========== ④ 数据解析区：数据 → 标准卡片 ==========
  parseVodShort: function (v) {
    // 把一条数据（来源可能是 JSON 字段，也可能是 HTML 解析结果）转成 App 标准卡片对象
    return {
      title: v.title,          // 标题
      img: v.pic,             // 封面图
      desc: remark,          // 描述（集数/评分等）
      col_type: 'movie_3', // 卡片样式
      url: $('hiker://empty?#immersiveTheme##fypage').rule((v) => {
        // 点击卡片 → 存参数 → 跳详情
        putMyVar('vod_id', v.id);
        $.require("规则名").detail();   // ★ 模块名 = 规则标题
      }, v),
      extra: { vod_id: v.id } // 附加数据
    };
  },

  // ========== ⑤ 页面函数区：App 各页面的渲染入口 ==========
  home: function () { /* 主页：find_rule 调用 */ },
  search: function () { /* 搜索：searchFind 调用 */ },
  detail: function () { /* 详情页 */ },
  play: function (id, map_id, collection) { /* 播放页：返回播放地址 */ },
};

$.exports = 规则名;  // ★ 必须导出（导出名与 const 名一致），否则 $.require 加载不到
```

> **为什么这样分 5 块？** 数据区（d/d_）是所有页面共用的容器；配置区集中管理站点参数，改域名/换密钥只动一处；工具函数区避免重复代码；数据解析区保证列表项格式统一；页面函数区是 App 的入口，每个函数对应一个页面。

> **工具函数放哪？** 简单的工具函数（如 `color` / `strong` / `request`）可直接写在主模块的③工具函数区；**复杂、可复用、与页面渲染无关的工具**（如富文本简介处理、加解密）建议单独建一个「工具子页面」模块（如 `tools`），通过 `$.require("tools").函数()` 跨模块调用。详见下一章。

---

## 四、工具子页面模块（tools）—— 独立工具函数供调用

把与页面渲染无关的复杂工具抽到独立的 `tools` 子页面，主模块通过 `$.require("tools").xxx()` 调用。这样主模块精简、工具可复用、职责清晰。

### 4.1 工具子页面骨架

```javascript
// ============================================================
// 模块名：tools（工具子页面）
// 被 $.require("tools") 引用，必须以 $.exports 导出
// 注意：工具子页面不需要 d/d_/setResult，只导出纯函数
// ============================================================

// ---- 工具函数 1：通用请求封装 ----
function request(url, data) {
  // 通用请求封装：fetch 获取原始内容
  // 返回内容可能是 JSON 字符串，也可能是 HTML 文本，由调用方自行解析
  var resp = fetch(url, { headers: headers, body: data });
  return resp;  // 原始响应（JSON 或 HTML）
}

// ---- 工具函数 2：xxx ----
function anyTool(d, param) {
  // 你的工具函数...
}

// ---- ★ 导出所有工具函数（必须）----
$.exports = {
  request,
  anyTool
};
```

### 4.2 从主模块调用工具

```javascript
// 主模块（规则名）中调用工具子页面
// 请求接口（复用通用请求封装）
var data = $.require("tools").request(host + '获取数据接口', { id: id });

// 调用其他工具函数
$.require('tools').anyTool(d, param);
```

### 4.3 顶层 JSON 注册工具子页面

工具子页面与主页模块一样，必须注册进 `pages`，否则 `$.require("tools")` 加载不到。

```jsonc
"pages": [
  { "name": "主页", "path": "规则名", "col_type": "movie_3", "rule": "//js:\n..." },  // ★ path = 规则标题
  { "name": "工具", "path": "tools", "col_type": "movie_3", "rule": "//js:\n..." }  // ★ 工具子页面（固定名 tools）
]
```

> ⚠️ **易错点：** ① 工具子页面的 `path` 必须与 `$.require("tools")` 一致；② 工具子页面 `rule` 必须以 `//js:` 开头、以 `$.exports = {...}` 结尾；③ 工具函数被主模块 `$.require` 引用时，必须出现在导出对象里，否则调用报 undefined。

---

## 五、页面函数详解（写什么、干什么）

### 5.1 home() —— 主页渲染（必写）

被顶层 `find_rule` 调用。核心逻辑：**第一页渲染导航，所有页渲染列表**。

```javascript
home: function () {
  var d = this.d, d_ = this.d_;
  var pg = MY_PAGE;  // 当前页码，App 自动分页

  // ---- 第 1 页：初始化 + 渲染导航（d_）----
  if (MY_PAGE == 1) {
    this.init();
    this.login();   // 鉴权（如需）

    // 搜索入口（input 卡片）
    d_.push({ title: "搜索", col_type: "input", extra: { onChange: ... } });

    // 分类导航（Cate 渲染）
    this.Cate(首页, '首页', d_, 'icon_5');

    setPreResult(d_);  // ★ 预渲染导航，先于列表显示
  }

  // ---- 所有页：渲染列表（d）----
  let 分类 = getMyVar('首页', '0');  // 读当前选中分类
  if (分类 == 0) this.recommend(pg);  // 推荐列表
  else this.category(分类, pg);          // 分类列表

  setResult(d);  // ★ 最终渲染列表到 App
}
```

> **关键点：** ① `setPreResult(d_)` 渲染导航/loading，`setResult(d)` 渲染列表，两者配合实现「先出导航、后出列表」；② 分页逻辑靠 `MY_PAGE`，请求时把 `pg` 传给接口；③ 导航点击用 `putMyVar` 存选中项 + `refreshPage(false)` 刷新；④ `recommend` / `category` 子函数内部同样遵循「获取下方需要的数据」原则：先列出需要的字段（标题/封面/描述/跳转参数），再自行分析数据来源（JSON 接口或 HTML 页面）决定解析方式。

### 5.2 search() —— 搜索渲染（搜索源必写）

被顶层 `searchFind` 调用。先读关键词，再请求搜索接口，结果用标准卡片渲染。

```javascript
search: function () {
  var d = this.d, d_ = this.d_;
  let pg = MY_PAGE;
  let keyword = getMyVar('keyword');  // 读搜索关键词
  if (!keyword) { setResult(d); return; }

  if (MY_PAGE == 1) {
    d_.push(this.loading);   // 第 1 页显示 loading
    setPreResult(d_);
  }

  // ★ 获取下方需要的数据（自行分析解析方式）：
  //   需要：搜索结果列表，每项含 title / img / desc / 详情跳转参数
  //   来源可能是 JSON 接口返回，也可能是 HTML 页面解析
  //   JSON 接口：直接取字段（如 data.result / data.data / data.list）
  //   HTML 页面：用 pdfa(html, 规则) 解析列表、pdfh(html, 规则) 取字段
  var data = this.request(host + '搜索数据接口', { kw: keyword, pn: pg });
  var list = this.parseList(data);  // 自行实现：从 data 提取列表（JSON 或 HTML）

  for (var i = 0; i < list.length; i++)
    d.push(this.parseVodShort(list[i]));  // 复用解析函数

  deleteItem("loading_");  // 移除 loading
  setResult(d);
}
```

### 5.3 detail() —— 详情页渲染（必写）

点击列表卡片后进入。详情页是一个**固定流程**：鉴权 → 读参 → 设标题 → 监听清理 → 获取数据 → 封面大图 → 简介 → 线路切换 → 排序切换 → 选集列表 → 播放。

```
鉴权 → 读参数 → 设标题 → 监听清理 → 获取数据 → 封面大图 → 简介 → 线路切换 → 排序切换 → 选集列表 → 播放
```

```javascript
detail: function () {
  // ① 鉴权：详情接口需要 token 时先登录
  if (!this.headers.token) { this.login(); }

  // ② 读参数：卡片点击时 putMyVar 存的，这里取回
  var d = this.d,
      id = MY_PARAMS.vod_id || getMyVar('vod_id'),
      name = MY_PARAMS.vod_name || getMyVar('vod_name');

  // ③ 设置页面标题
  setPageTitle(name);

  // ④ 监听页面关闭：清理会话变量，避免下次进入残留
  addListener('onClose', $.toString(() => { clearMyVar('sort'); }));

  // ⑤ 获取下方需要的数据（自行分析解析方式）：
  //   需要：title / tags / year / actor / remarks / pic / intro
  //        选集数据二选一：
  //          play_list（多线路：线路数组，每线路含「线路名」+「选集数组」）
  //          map_list（单线路：直接是选集数组，每项含 title/id/collection）
  //   来源可能是 JSON 接口返回，也可能是 HTML 页面解析
  var data = this.request(this.host + '获取数据接口', { id: id });
  var res = this.parseDetail(data);  // 自行实现：从 data 提取详情对象（JSON 或 HTML）

  // ⑥ 封面大图卡片（毛玻璃背景）
  d.push({
    title: res.title + '\n' + ('``' + (res.tags || '') + ' ' + (res.year || '')).small(),
    desc: (res.actor ? '演员：' + res.actor + '\n' : '') + (res.remarks || ''),
    img: res.pic,
    url: res.pic + '#.jpg#',   // 点击看大图
    col_type: 'movie_1_vertical_pic_blur',
    extra: { vod_id: res.vod_id }
  });

  // ⑦ 简介：直接渲染富文本（展开/收起，固定写死在详情页）
  if (res.intro) {
    var desc = res.intro.constructor == Array ? res.intro.join('<br>') : res.intro;

    // 截断函数：中文按 2 字符计
    function substr(str, maxLength) {
      let len = 0;
      for (let i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 255) len += 2; else len++;
        if (len > maxLength) return str.slice(0, i) + '...';
      }
      return str;
    }

    var shortDesc = substr(desc, 200);
    var show = getMyVar('expand_desc', '0');

    // 展开/收起：lazyRule 切换显示全文或截断
    var lazy = $(`#noLoading#`).lazyRule((m) => {
      var s = getMyVar(m, '0');
      putMyVar(m, s == '1' ? '0' : '1');
      refreshPage(false);
      return `hiker://empty`
    }, 'expand_desc');

    var expandText = (getMyVar('expand_desc', '0') == '1') ? '收起' : '展开';
    var displayDesc = (getMyVar('expand_desc', '0') == '1') ? desc : shortDesc;

    d.push({
      title: '<b><font color="#098AC1">∷剧情简介</font></b><small><a href="' + lazy + '">' + expandText + '</a></small>' + displayDesc,
      col_type: 'rich_text',
      extra: { id: 'desc', lineSpacing: 6, textSize: 15, lineVisible: true }
    });
  }

  // ⑧ 选集列表（多线路支持，社区通用模式）
  //   单线路源天然兼容：通过数据归一化统一转成 tabs + lists 结构
  //   单线路源只有 1 个线路 tab，渲染逻辑完全复用
  var tabs = [], lists = [];
  if (res.play_list && res.play_list.length > 0) {
    // ---- 多线路源：play_list 是线路数组，每线路含「线路名」+「选集数组」----
    // 需要：每线路的 name（线路名）+ 选集数组
    // 自行适配字段名（如 playUrlList / vod_play_list，选集项可能是 name/ji 或 title/id）
    tabs = res.play_list.map(x => x.name);           // 线路名数组
    lists = res.play_list.map(x => x.episodes);      // 每线路选集数组
  } else if (res.map_list && res.map_list.length > 0) {
    // ---- 单线路源：map_list 直接是选集数组，包装成单线路 ----
    tabs = ['线路1'];                                  // 只有一个线路
    lists = [res.map_list];                           // 选集数组包一层
  }

  if (lists.length > 0) {
    d.push({ col_type: 'blank_block' });  // 选集前分隔

    // ⑧a 选集数据编码：统一用 $ 分隔符（标题$videoId$ji$索引，社区通用模式）
    //   单线路源选集项字段可能是 id/collection，多线路源可能是 ji
    //   自行适配：把选集项统一映射成 { title, ji } 再编码
    var videoId = res.video_id;
    lists = lists.map((episodes, li) =>
      episodes.map((ep, i) => ep.title + '$' + videoId + '$' + (ep.ji || ep.id) + '$' + i)
    );

    storage0.putMyVar('lists', lists);  // 存储所有线路
    var list = lists[getMyVar(MY_URL, '0')];  // 读取当前线路的选集

    // 选集点击 lazyRule：解析编码（vid$ji$index），调用 play()
    var lazy = $('').lazyRule((input) => {
      var parts = String(input).split('$');
      return $.require("规则名").play(parts[1], parts[2], parts[3]);
    });

    // ⑧b 排序切换（正序/倒序）
    var 排序 = getMyVar(MY_URL + '章节排序', '正序');
    var 提示 = 排序 == '倒序' ? '正序' : '倒序';
    d.push({
      title: '排序：' + 排序,
      url: $('#noLoading#').lazyRule((lazy) => {
        var lists = storage0.getMyVar('lists');
        var 章节 = lists[getMyVar(MY_URL, '0')];
        var 排序 = getMyVar(MY_URL + '章节排序', '正序');
        var 提示 = 排序 == '倒序' ? '正序' : '倒序';
        if (排序 == '正序') 章节.reverse();  // 切换排序
        // 重新渲染选集（删除旧的 + 插入新的）
        let cp = 章节.map(data => {
          let parts = data.split('$');
          return {
            title: parts[0],
            url: parts[1] + '$' + parts[2] + '$' + parts[3] + lazy,
            col_type: 章节.length > 3 ? 'text_4' : 'text_2',
            extra: { cls: MY_URL + '_选集', id: parts[1] + '$' + parts[2] + '$' + parts[3] }
          };
        });
        deleteItemByCls(MY_URL + '_选集');
        addItemBefore(MY_URL + 'footer', cp);
        putMyVar(MY_URL + '章节排序', 提示);
        return 'hiker://empty';
      }, lazy),
      col_type: 'flex_button',
      extra: { id: MY_URL + '_排序' }
    });

    // ⑧c 线路切换 tabs（多线路核心）
    tabs.forEach((data, id) => {
      d.push({
        title: getMyVar(MY_URL, '0') == id ? '「' + data + '」' : data,  // 当前线路高亮
        url: $('#noLoading#').lazyRule((线路, lazy, id) => {
          var lists = storage0.getMyVar('lists');
          var 排序 = getMyVar(MY_URL + '章节排序', '正序');
          // 更新线路 tab 高亮：★ updateItem(id, layout)，id 为 extra.id
          线路.forEach((xlData, xlid) => {
            updateItem(MY_URL + '_线路' + xlid, {
              title: id == xlid ? '「' + xlData + '」' : xlData
            });
          });
          putMyVar(MY_URL, id);  // 记录当前线路
          var 章节 = lists[getMyVar(MY_URL, '0')];
          if (排序 == '倒序') 章节.reverse();
          // 重新渲染选集
          let cp = 章节.map(data => {
            let parts = data.split('$');
            return {
              title: parts[0],
              url: parts[1] + '$' + parts[2] + '$' + parts[3] + lazy,
              col_type: 章节.length > 3 ? 'text_4' : 'text_2',
              extra: { cls: MY_URL + '_选集', id: parts[1] + '$' + parts[2] + '$' + parts[3] }
            };
          });
          deleteItemByCls(MY_URL + '_选集');
          addItemBefore(MY_URL + 'footer', cp);
          return 'hiker://empty';
        }, tabs, lazy, id),
        col_type: 'flex_button',
        extra: { id: MY_URL + '_线路' + id }
      });
    });

    // ⑧d 选集渲染（当前线路）
    if (排序 == '倒序') list.reverse();
    list.forEach(data => {
      let parts = data.split('$');
      d.push({
        title: parts[0],
        url: parts[1] + '$' + parts[2] + '$' + parts[3] + lazy,  // 点击 → play()
        col_type: list.length > 3 ? 'text_4' : 'text_2',
        extra: { cls: MY_URL + '_选集', id: parts[1] + '$' + parts[2] + '$' + parts[3] }
      });
    });
    d.push({ col_type: 'big_blank_block', extra: { id: MY_URL + 'footer' } });  // 底部占位（选集插入锚点）
  }

  setResult(d);  // ⑨ 渲染
}
```

#### 详情页卡片类型速查

| 区块 | col_type | 用途 | 关键字段 |
|------|----------|------|----------|
| 封面大图 | `movie_1_vertical_pic_blur` | 竖版封面 + 毛玻璃背景 | `title` / `desc` / `img` / `url` |
| 简介 | `rich_text` | 富文本简介（展开/收起） | `title`（含 HTML）/ `extra.id` |
| 分隔 | `blank_block` | 区块间空白占位 | `extra.id`（可选） |
| 排序切换 | `flex_button` | 正序/倒序切换按钮 | `title` / `url`（lazyRule） |
| 线路切换 | `flex_button` | 多线路 tab（当前线路高亮） | `title` / `url`（lazyRule）/ `extra.id` |
| 选集 | `text_4` / `text_2` | 单集入口（点击播放） | `title` / `url`（lazyRule→play）/ `extra.cls` |

> **详情页关键点：** ① 参数传递链：列表卡片 `putMyVar('vod_id', id)` → 详情页 `getMyVar('vod_id')` 取回；② 多线路用 `tabs`（线路名）+ `lists`（每线路选集）两个数组，`storage0.putMyVar('lists', lists)` 存储，当前线路用 `getMyVar(MY_URL, '0')` 记录；③ 选集数据用 `$` 分隔符编码（`标题$videoId$ji$索引`），点击时 lazyRule 解析并调用 `play()`；④ 切换线路/排序用 `updateItem`（更新 tab 高亮）+ `deleteItemByCls`（删旧选集）+ `addItemBefore`（插新选集）动态更新，不刷新整页；⑤ **单线路源天然兼容**：`map_list` 会被归一化成单线路（`tabs=['线路1']`、`lists=[map_list]`），渲染逻辑完全复用，只是不显示线路切换 tab；⑥ `addListener('onClose')` 清理会话变量，防止下次进入残留旧状态。

### 5.4 play() —— 播放地址（必写）

返回播放地址字符串。核心逻辑：获取播放数据 → 返回可播放的 URL。

```javascript
play: function (video_id, vod_map_id, collection) {
  // ★ 获取下方需要的数据（自行分析解析方式）：
  //   需要：可播放的 URL（可能直接返回，也可能需要从字段中提取）
  //   来源可能是 JSON 接口返回，也可能是 HTML 页面解析
  var data = this.request(host + '获取播放地址接口', {
    vod_id: video_id, vod_map_id: vod_map_id, collection: collection
  });
  var url = this.parsePlayUrl(data);  // 自行实现：从 data 提取播放地址（JSON 或 HTML）

  if (url) return url;
  return 'hiker://empty';  // 失败兜底
}
```

---

## 六、标准卡片对象（列表项格式）

所有列表项（首页/搜索/分类）最终都要转成这个格式，App 才能正确渲染。

| 字段 | 必填 | 说明 | 示例 |
|------|------|------|------|
| `title` | ✅ | 卡片标题 | `"狂飙"` |
| `img` | ✅ | 封面图 URL | `"https://..."` |
| `desc` | 可选 | 描述（集数/评分/简介） | `"更新至12集"` |
| `col_type` | ✅ | 卡片样式（决定布局） | `"movie_3"` |
| `url` | ✅ | 点击跳转（rule 函数） | `$('...').rule(...)` |
| `extra` | 可选 | 附加数据（传给详情页） | `{vod_id: "123"}` |

### 点击跳转的两种写法

| 写法 | 代码 | 适用 |
|------|------|------|
| **rule() 跳详情** | `$('hiker://empty?...#fypage').rule((v) => { putMyVar('id', v.id); $.require("模块").detail(); }, v)` | 列表项 → 详情页（最常用） |
| **lazyRule() 返回地址** | `$().lazyRule((id, mid, col) => $.require("模块").play(id, mid, col), id, mid, col)` | 选集 → 播放地址（延迟求值） |

> **为什么用 rule() 而不是直接写 URL？** 因为需要「点击时执行 JS」——存参数、调函数。rule() 把函数序列化进 URL，点击时 App 反序列化执行。参数通过 `putMyVar` 存、`getMyVar` 读，跨页面传递。

---

## 七、col_type 常用样式速查

| col_type | 用途 |
|----------|------|
| `movie_2` | 一行两列卡片（直播/视频列表） |
| `movie_3` | **默认三列卡片**（图片+名称+描述，主流列表样式） |
| `movie_1_vertical_pic_blur` | 详情页封面大图（毛玻璃背景） |
| `scroll_button` | 横滑按钮（分类导航） |
| `text_4` | 一行四列文本（选集按钮） |
| `text_center_1` | 居中文字（提示/错误） |
| `text_icon` | 文字+图标 |
| `input` | 搜索输入框 |
| `blank_block` | 空白占位（分隔） |
| `pic_1_full` | 全宽图片（loading 动画） |
| `rich_text` | 富文本（简介/区块标题） |

---

## 八、关键 API 速查（写源必用）

| API | 作用 | 示例 |
|-----|------|------|
| `setResult(d)` | 渲染主列表 | `setResult(d)` |
| `setPreResult(d_)` | 渲染预加载内容（导航/loading） | `setPreResult(d_)` |
| `$.require("模块")` | 加载子页面模块（模块名 = 规则名） | `$.require("某某影视").home()` |
| `$.exports = obj` | 导出模块（必须） | `$.exports = 某某影视` |
| `putMyVar(k, v)` | 存会话变量（跨页面传参） | `putMyVar('vod_id', id)` |
| `getMyVar(k, def)` | 读会话变量 | `getMyVar('vod_id', '')` |
| `setItem(k, v)` | 持久化存储（重启不丢） | `setItem('host', url)` |
| `getItem(k, def)` | 读持久化存储 | `getItem('host', 'https://...')` |
| `MY_PAGE` | 当前页码（自动分页） | `var pg = MY_PAGE` |
| `MY_PARAMS` | 页面参数 | `MY_PARAMS.vod_id` |
| `refreshPage(false)` | 刷新当前页（导航切换） | `refreshPage(false)` |
| `setPageTitle(t)` | 设置页面标题 | `setPageTitle(name)` |
| `fetch(url, opt)` | 网络请求 | `fetch(url, {headers, method, body})` |
| `getCryptoJS()` | 加载加密库 | `eval(getCryptoJS())` |
| `storage0` | 持久化存储对象（跨规则共享） | `storage0.putMyVar(k, v) / storage0.getMyVar(k)` |
| `findItem(id)` | 查找已渲染的 item（按 extra.id） | `findItem('desc').title` |
| `updateItem(id, obj)` | 更新已渲染的 item（**参数1=extra.id，参数2=新属性**） | `updateItem('desc', {title: '...'})` |
| `deleteItem(id)` | 删除单个 item（按 extra.id） | `deleteItem("loading_")` |
| `deleteItemByCls(cls)` | 批量删除 item（按 extra.cls） | `deleteItemByCls(MY_URL + '_选集')` |
| `addItemBefore(id, items)` | 在指定 item 前插入选集 | `addItemBefore(MY_URL + 'footer', cp)` |
| `clearMyVar(k)` | 清除会话变量 | `clearMyVar('sort')` |
| `addListener(evt, fn)` | 监听页面事件 | `addListener('onClose', $.toString(() => {}))` |

---

## 九、AI 写源检查清单

> ⚠️ **写完后必须自查，防止「保存成功但不可用」：**

| # | 检查项 | 错误后果 |
|---|--------|----------|
| 1 | 顶层有 `url` / `col_type` / `find_rule` | 缺失 → 纯搜索小程序 |
| 2 | `pages` 中的 `path` 与 `$.require("X")` 一致；**X = 规则名本身**（勿用 hmhome/hmys 等示例名） | 不一致 → 模块加载失败 |
| 3 | 子页面 `rule` 以 `//js:` 开头 | 缺 → App 不识别为 JS |
| 4 | 被引用模块以 `$.exports = ...` 结尾 | 缺 → 加载不到导出 |
| 5 | 每个列表项含 `title` / `img` / `col_type` / `url` | 缺 → 卡片渲染异常 |
| 6 | 函数结尾调用 `setResult(d)` | 缺 → 页面空白 |
| 7 | 分页用 `MY_PAGE` 传给接口 | 不用 → 无法翻页 |
| 8 | 跨页传参用 `putMyVar` / `getMyVar` | 不用 → 参数丢失 |
| 9 | 工具子页面 `path` 与 `$.require("X")` 一致 | 不一致 → 调用报 undefined |
| 10 | 工具函数在导出对象中（`$.exports = {fn}`） | 漏导出 → 调用报 undefined |
| 11 | `pages` 包含所有被引用的子页面 | 漏注册 → `$.require` 加载失败 |
| 12 | 主页模块 home() 中存在 `setPreResult(d_)` 和 `setResult(d)` | 缺一 → 导航/列表不显示 |
| 13 | 详情页 `play()` 返回字符串地址 | 不返回 → 无法播放 |
| 14 | 多线路选集用 `storage0.putMyVar('lists', lists)` 存储全部线路 | 不存 → 切换线路无数据 |
| 15 | 当前线路用 `getMyVar(MY_URL, '0')` 记录，切换时 `putMyVar(MY_URL, id)` | 不记 → 刷新后回到线路1 |
| 16 | 选集编码用 `$` 分隔（`标题$videoId$ji$索引`），lazyRule 内按 `$` 拆分 | 分隔符不一致 → 解析失败 |
| 17 | 切换线路/排序后 `deleteItemByCls` + `addItemBefore` 重渲染选集 | 漏做 → 选集不更新 |
| 18 | 选集列表底部有 `big_blank_block` 占位（`extra.id = MY_URL + 'footer'`） | 无锚点 → `addItemBefore` 失败 |
| 19 | **单线路源**：`map_list` 归一化成 `tabs=['线路1']`、`lists=[map_list]` | 不归一化 → 单线路源选集不渲染 |
| 20 | **单线路源**：选集项字段 `ep.ji || ep.id` 兼容两种命名 | 写死 `ep.ji` → 单线路源选集项取不到 ji |

---

*海阔视界写源模板 v1 · 基于社区视频源公共框架提取 · 供 AI 写源参考*