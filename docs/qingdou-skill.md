# 青豆剧场规则编写指南

## 一、规则基本结构

```javascript
var Rule = {
    名称: "示例影视",
    作者: "xxx",
    版本: "1.0",
    类型: "主页源",          // 主页源 | 搜索源 | 直播源

    host: "https://www.example.com",
    UA: "Mozilla/5.0 ...",
    timeout: 15000,

    分类: {
        class_name: "电影&电视剧&综艺",
        class_url: "1&2&3"
    },

    推荐: function() { ... },
    主页: function(page, categoryId) { ... },
    搜索: function(keyword, page) { ... },
    二级: function(url) { ... },
    解析: function(url) { ... }
};
```

## 二、规则类型

| 类型 | 说明 | 必需方法 |
|------|------|---------|
| 主页源 | 有首页和分类 | 推荐/主页, 搜索, 二级, 解析 |
| 搜索源 | 仅搜索（网盘等） | 搜索, 二级 |
| 直播源 | 直播频道 | 主页, 解析 |

搜索源的 `解析` 可设为空字符串 `""`（网盘链接无需解析）。

## 三、方法说明

### 推荐() → 数组
首页推荐内容。无参数。不实现时框架自动调用主页第一页。

### 主页(page, categoryId) → 数组
分类列表。page从1开始，categoryId为分类ID。

返回项字段（两种格式均可）：

| 标准字段 | vod_前缀字段 | 说明 |
|---------|-------------|------|
| title | vod_name | 标题 |
| pic_url | vod_pic | 海报URL |
| url | vod_id | 详情页URL/ID |
| desc | vod_remarks | 备注（如"更新至10集"） |

### 搜索(keyword, page) → 数组
搜索结果。结构同主页。

### 二级(url) → 对象
影片详情。使用 `createDetailResult()` 创建返回对象：

```javascript
二级: function(url) {
    var result = createDetailResult();
    result.img = "海报URL";
    result.desc = "简介";
    result.detail1 = "年份 / 地区 / 类型";     // 信息行1
    result.detail2 = "导演：xxx 主演：xxx";     // 信息行2
    result.line.push("线路1");                  // 线路名
    result.list.push([                          // 选集数组，与line一一对应
        { title: "第1集", url: "playUrl" },
        { title: "第2集", url: "playUrl2" }
    ]);
    return result;
}
```

**createDetailResult() 返回对象字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| img | string | 海报图片URL |
| desc | string | 简介/剧情 |
| detail1 | string | 信息行1（年份/地区/类型/备注） |
| detail2 | string | 信息行2（导演/主演） |
| line | string[] | 线路名称数组 |
| list | array[][] | 选集二维数组，line[i]对应list[i] |

选集项字段：`title`（或`name`）、`url`（或`play_url`）。

line和list长度必须一致。

### 解析(url) → string | object
播放地址解析。

**返回字符串：**
- 直链: `"video://https://xxx.m3u8"`
- 嗅探: `"x5Rule://..."`
- 原链接: `url + "#isVideo=true#"`
- 空字符串 `""`：网盘链接无需解析时

**返回对象（带headers）：** m3u8需要Referer时必须用此格式：

```javascript
解析: function(url) {
    var playHeaders = { "Referer": this.host + "/", "User-Agent": this.UA };
    return { urls: [m3u8Url], headers: [playHeaders] };
}
```

系统自动处理：URL匹配 `.m3u8` 时添加 `#isVideo=true#`，headers传递给播放器。

**返回对象（多线路）：**

```javascript
return {
    urls: ["url1", "url2"],
    names: ["线路1", "线路2"],
    headers: [{ Referer: "..." }, { Referer: "..." }]
};
```

也可用 `createPlaylist(urls, names, headers)` 辅助函数生成。

## 四、方法别名

中文方法名与英文方法名等价，框架自动映射：

| 中文 | 英文 |
|------|------|
| 搜索 | search |
| 二级 | detail |
| 主页 | home |
| 解析 | parse |
| 分类 | category |
| 地址 | host |

## 五、运行时全局变量

框架在沙箱中预注入以下变量：

| 变量 | 说明 |
|------|------|
| MY_URL | 当前页面URL |
| MY_PAGE | 当前页码（整数） |
| KEY | 搜索关键词 |
| HOST | 网站根地址（等于MY_URL） |
| MY_RULE | 规则信息对象 `{title: "..."}` |
| PC_UA | PC端User-Agent |
| MOBILE_UA | 移动端User-Agent |
| UC_UA | UC浏览器UA |
| IOS_UA | iOS端UA |

## 六、运行时全局函数

### HTTP请求

| 函数 | 说明 |
|------|------|
| `fetch(url, opts)` | HTTP请求，opts含headers/method/body/timeout |
| `request(url, opts)` | fetch别名 |
| `batchFetch(tasks)` | 批量请求，tasks为`[{url, options}]`数组 |
| `getCookie(url)` | 获取指定URL的Cookie |

### 选择器

| 函数 | 说明 |
|------|------|
| `pdfa(html, selector)` | 提取匹配列表 |
| `pdfh(html, selector)` | 提取文本 |
| `pd(html, selector)` | 提取属性值 |

选择器语法：
- `&&` 级联：`.box&&a&&title`
- `||` 或：`img\|\|.lazy&&data-original`
- `Text` 取文本：`a&&Text`
- `href`/`src` 取属性：`a&&href`
- `:eq(n)` 第n个：`.item:eq(0)`

### 加密/编码

| 函数 | 说明 |
|------|------|
| `md5(text)` | MD5哈希 |
| `base64Encode(str)` / `base64Decode(str)` | Base64 |
| `aesEncode(text, key, iv)` / `aesDecode(...)` | AES加解密 |
| `rsaEncrypt(text, pubKey)` / `rsaDecrypt(...)` | RSA加解密 |
| `CryptoJS` | CryptoJS完整对象 |

### 工具函数

| 函数 | 说明 |
|------|------|
| `createDetailResult()` | 创建二级返回对象 |
| `createPlaylist(urls, names, headers)` | 创建多线路播放JSON |
| `urljoin(base, relative)` | URL拼接 |
| `getHome(url)` | 提取根域名 |
| `getMyVar(key, default)` | 读取持久变量 |
| `putMyVar(key, value)` | 写入持久变量 |
| `clearMyVar(key)` | 清除持久变量 |
| `log(msg)` | 日志输出 |
| `QD` | 框架工具对象 |

## 七、常用 col_type

| 值 | 说明 |
|----|------|
| movie_3 | 三列海报（默认） |
| movie_2 | 两列横图 |
| movie_1_vertical | 单列竖图 |
| card_pic_1 | 轮播卡片（desc设为"0"） |
| text_center_1 | 居中文本 |
| text_1 | 左对齐文本 |
| rich_text | 富文本 |
| avatar | 头像样式 |
| pic_1 | 单列大图 |

## 八、富文本

富文本用 `''''`（即 `\u2018\u2018\u2019\u2019`）包裹，用于detail1/detail2/desc等需要样式的文本字段：

```javascript
result.detail1 = "''''<font color='#006699'>2024</font> / 中国 / 电影";
```

## 九、完整示例

### 主页源（HTML解析）

```javascript
var Rule = {
    名称: "示例影视",
    作者: "青豆",
    版本: "1.0",
    类型: "主页源",
    host: "https://www.example.com",
    UA: PC_UA,
    timeout: 15000,

    分类: { class_name: "电影&电视剧", class_url: "1&2" },

    _abs: function(u) {
        if (!u) return "";
        if (u.indexOf("//") === 0) return "https:" + u;
        if (u.charAt(0) === "/") return this.host + u;
        return u;
    },

    _fetch: function(url) {
        try {
            return fetch(this._abs(url), {
                headers: { "User-Agent": this.UA, "Referer": this.host + "/" },
                timeout: this.timeout
            }) || "";
        } catch(e) { return ""; }
    },

    推荐: function() {
        var html = this._fetch("/");
        var items = pdfa(html, ".vod-list&&li");
        var list = [];
        for (var i = 0; i < items.length; i++) {
            list.push({
                title: pdfh(items[i], "a&&title"),
                pic_url: this._abs(pd(items[i], "img&&src")),
                url: this._abs(pd(items[i], "a&&href")),
                desc: pdfh(items[i], ".remarks&&Text")
            });
        }
        return list;
    },

    主页: function(page, categoryId) {
        var html = this._fetch("/list/" + categoryId + "-" + page + ".html");
        var items = pdfa(html, ".vod-list&&li");
        var list = [];
        for (var i = 0; i < items.length; i++) {
            list.push({
                vod_name: pdfh(items[i], "a&&title"),
                vod_pic: this._abs(pd(items[i], "img&&data-original")),
                vod_id: this._abs(pd(items[i], "a&&href")),
                vod_remarks: pdfh(items[i], ".remarks&&Text")
            });
        }
        return list;
    },

    搜索: function(keyword, page) {
        var html = this._fetch("/search?q=" + encodeURIComponent(keyword) + "&p=" + page);
        var items = pdfa(html, ".search-list&&li");
        var list = [];
        for (var i = 0; i < items.length; i++) {
            list.push({
                vod_name: pdfh(items[i], "a&&title"),
                vod_pic: this._abs(pd(items[i], "img&&src")),
                vod_id: this._abs(pd(items[i], "a&&href"))
            });
        }
        return list;
    },

    二级: function(url) {
        var result = createDetailResult();
        var html = this._fetch(url);
        if (!html) return result;
        result.img = this._abs(pd(html, ".poster&&img&&src"));
        result.desc = pdfh(html, ".content&&Text");
        result.detail1 = pdfh(html, ".info&&Text");
        result.detail2 = pdfh(html, ".cast&&Text");
        var lines = pdfa(html, ".play-list&&.playlist");
        for (var i = 0; i < lines.length; i++) {
            result.line.push(pdfh(lines[i], "h3&&Text"));
            var eps = pdfa(lines[i], "li");
            var epList = [];
            for (var j = 0; j < eps.length; j++) {
                epList.push({
                    title: pdfh(eps[j], "a&&Text"),
                    url: this._abs(pd(eps[j], "a&&href"))
                });
            }
            result.list.push(epList);
        }
        return result;
    },

    解析: function(url) {
        try {
            var html = this._fetch(url);
            var m = html.match(/var\s+player_.*?=\s*({[\s\S]*?})/);
            if (m) {
                var player = JSON.parse(m[1]);
                var playUrl = player.url || "";
                if (player.encrypt == "1") playUrl = unescape(playUrl);
                if (player.encrypt == "2") playUrl = base64Decode(playUrl);
                if (/\.m3u8|\.mp4/i.test(playUrl)) {
                    return {
                        urls: [playUrl],
                        headers: [{ "Referer": this.host + "/", "User-Agent": this.UA }]
                    };
                }
            }
        } catch(e) {}
        return url + "#isVideo=true#";
    }
};
```

### 搜索源（API+网盘）

```javascript
var Rule = {
    名称: "网盘搜索",
    作者: "青豆",
    版本: "1.0",
    类型: "搜索源",
    host: "https://api.example.com",
    UA: PC_UA,

    搜索: function(keyword, page) {
        return [{
            vod_name: keyword,
            vod_pic: "",
            vod_id: keyword,
            vod_remarks: "网盘"
        }];
    },

    二级: function(keyword) {
        var result = createDetailResult();
        var resp = fetch(this.host + "/search?q=" + encodeURIComponent(keyword));
        var data = JSON.parse(resp || "{}");
        var groups = {};
        for (var i = 0; i < (data.list || []).length; i++) {
            var item = data.list[i];
            var panType = /pan\.quark\.cn/.test(item.url) ? "夸克" : "百度";
            if (!groups[panType]) {
                groups[panType] = [];
                result.line.push(panType);
            }
            groups[panType].push({ title: item.title, url: item.url });
        }
        for (var k = 0; k < result.line.length; k++) {
            result.list.push(groups[result.line[k]]);
        }
        return result;
    },

    解析: ""
};
```

## 十、注意事项

1. 使用 `var` 声明，不用 let/const
2. 所有URL通过 `this._abs()` 或 `urljoin()` 补全
3. 二级 `line` 和 `list` 长度必须一致
4. 每个方法内部用 try/catch 包裹，失败时返回空数组/空对象
5. m3u8需要Referer时，解析返回对象带headers
6. 图片防盗链时URL后加 `@Referer=`
7. pd() 在沙箱中可能返回海阔页面URL，建议用正则提取href/src
8. 三级&&选择器不支持，用两步pdfa
9. HTML片段上不能用 body&& 前缀
10. `createDetailResult()` 返回的对象没有 `title` 字段，标题来自列表页的 `vod_name`/`title`
11. ★ 返回结果用 `return`（本框架风格），**不要调用 `setResult(d)`**——框架会自动提交函数返回值；
    若把本规则代码移植成原生 `js:` 格式（find_rule 直接写代码），结尾则必须改成 `setResult(d)` 提交，`return` 无效

## 十一、示例参考

详见 `custom_rules/` 目录下的规则文件：
- `黄豆短剧.js` — 正则解析HTML的完整示例
- `泥视频_*.js` — 标准影视站解析
- `原牛_*.js` — 搜索源+网盘示例
- `爱奇艺[官]_*.js` — 官方API源
