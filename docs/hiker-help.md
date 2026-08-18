# 海阔视界官方帮助手册（App 内置开发者手册整合）

> 来源：海阔视界 App 内置「开发者手册」的全部帮助文件（help_api / help_auto_import /
> help_col_type / help_film_list_rules / help_js / help_link / help_rules / help_skill /
> help_tag / help_web_bridge），官方权威原样整理。
>
> **文档定位**：通用写源标准文档之一。配合《写源模板手册》（blueprint，教怎么写）与
> hiker.d.ts（类型声明）使用。本文档就是"官方标准"本身——App 行为以此为准。

---

## 1. 返回结果数据（setResult 系列）

```js
setResult([{ title: "标题", url: "资源地址或下一个页面的链接", pic_url: "图片地址（也可用 img 属性）", col_type: "显示样式", desc: "描述", extra: {} }]);
```

- 所有解析规则（搜索、二级、最新章节）都用 `setResult` 返回数组
- **搜索解析**结果项可额外带 `content` 属性（详情）
- **最新章节解析**只能返回字符串：`setResult('十一')`
- **动态多次返回**：不支持多次调用 setResult；可先 `setPreResult()` 返回优先显示的部分，
  继续发网络请求，最后 `setResult()` 追加显示——两者必须成对出现、先后顺序不能变
  （常用于顶部固定按钮秒开 + 底部网络结果，常配合 `MY_PAGE == 1` 判断只在首页首屏用）
- `setHomeResult` / `setSearchResult` 与 setResult 等效、可混用（软件自动识别回调类型）
- `setError('msg')` 输出错误信息/调试

## 2. JS API 速查

### 2.1 请求
| API | 说明 |
|-----|------|
| `fetch(url, opts)` | 默认 UA=MOBILE_UA；opts：`body`（对象自动变 JSON+Content-Type）、`method`、`headers`、`timeout`(ms，默认10000)、`withHeaders:true`（返回`{body,headers}`JSON字符串，headers 的 key 对应数组）、`withStatusCode:true`（返回含 statusCode）、`onlyHeaders:true`、`redirect:false`、`toHex:true`（byte[]→hex）、`inputStream:true`（用后必须 `closeMe(stream)`）、`dns`（DoH 地址或多个IP空格分隔）、`rejectCoding:true`（禁止 okhttp 自动 URL 编码） |
| `post(url, opts)` | 同 fetch，默认 POST；body 对象自动 `a=xx&b=1` 表单 |
| `fetchPC/postPC` | 使用 PC 端 UA |
| `http.fetch(url,opts).headers({}).success(fn).error(fn).start()` | 链式请求；JSON 自动解析成对象 |
| `batchFetch([{url, options}])`（缩写 `bf`） | 批量请求，返回字符串数组；>16 个自动分批 |
| `fetchCookie(url, opts)` | 只拿 cookie，返回数组字符串 `['a=b','c=d']`；要同拿响应用 withHeaders |
| `request(url, opts)` | fetch 别名；默认 UA=MOBILE_UA |
| `registerDNS(map)` / `ipping(ip, timeout)` / `findReachableIP(ips, timeout)` | DNS/可用 IP |
| `fetchCodeByWebView(url, opts)` | WebView 加载后取源码；opts 含 headers/blockRules/timeout(默认30000)/checkJs（$.toString 回调，返回非 null 才取源码）；链接前缀也可 `webview://` |

### 2.2 存储
| API | 说明 |
|-----|------|
| `putVar(k,v)` / `getVar(k,d)` / `clearVar(k)` | 全局变量，仅字符串，重启失效 |
| `putMyVar/getMyVar/clearMyVar/listMyVarKeys` | 规则内隔离，仅字符串 |
| `globalMap0.putVar/getVar/clearVar/hasVar`、`globalMap0.putMyVar/getMyVar` | **可存对象/数组/数值等任意类型** |
| `storage0.putMyVar/getMyVar/putVar/getVar/setItem/getItem/putPublicItem/getPublicItem` | **存 JSON 对象**（自动 JSON 序列化） |
| `setItem/getItem/clearItem` | 私有化存储（仅字符串），规则删除会丢 |
| `setPublicItem/getPublicItem/clearPublicItem` | 公开存储，所有规则可见 |
| `saveFile(name, content, 0)` / `readFile(name, 0)` / `deleteFile(name)` / `fileExist(name)` | 私有文件（规则目录内，自动加密） |
| `writeFile(path, content)` | 旧接口，写任意路径（files/rules 目录才参与备份） |
| `getPath('hiker://files/a.txt')` | 取绝对路径 |
| `getPastes()` / `sharePaste(content, paste)` / `parsePaste(url)` | 云剪贴板 |
| `getHomeSub()` / `hasHomeSub(url)` / `getLastRules(count)` / `getRuleCount()` | 订阅/历史规则 |

### 2.3 解析/选择器（见第 7 节完整语法）
`parseDom`(缩写 `pd`)、`parseDomForHtml`(`pdfh`)、`parseDomForArray`(`pdfa`)、`xpath`(`xpa`)、
`xpathArray` —— pd 会自动补域名前缀，pdfh 完全返回原文，pdfa 返回数组。

### 2.4 编解码/加解密
`base64Encode/base64Decode`、`encodeStr/decodeStr(str, 'GBK'|'UTF-8')`、
`aesEncode('key', str)`/`aesDecode`、`rsaEncrypt(data, key, options)`/`rsaDecrypt`
（options: `{config:'RSA/ECB/PKCS1Padding', type:1|2, long:1|2, block:true|false}`，
rsaEncrypt type=1 公钥、type=2 私钥），`md5(text|path)`、`rc4.encode/decode(text,key,enc)`、
`window0.btoa/atob`（字节范围 \u0000-\u00ff）、`_base64.encode/decode/encodeToString(...)`、
`hexToBase64`、`hexToBytes`、`writeHexFile(path, hex)`、`convertBase64Image(url)`、
`getCryptoJS()` → `eval(getCryptoJS())` 后可用 `CryptoJS.enc.Utf8.parse(...)`。

> ⚠️ fetch 默认按 UTF-8 解码返回内容；若响应本身非 UTF-8 已乱码，再 decodeStr 无法还原，
> 必须用 fetch 的 content-type charset 或 `;gbk` 链接参数控制解码。

### 2.5 播放/媒体
| API | 说明 |
|-----|------|
| `cacheM3u8(url, opts, fileName)` | 缓存 m3u8 索引，返回本地地址`##`原地址；`.mp4` 链接加 `#m3u8` 强制，`#isM3u8#` 忽略 header 校验 |
| `batchCacheM3u8([...])`（缩写 `bcm`） | 批量多线程缓存 |
| `fixM3u8(url, content)` | 修正 m3u8 内 ts 相对路径 |
| `clearM3u8AdLazy(url, opts, rules)` | 生成去广告 lazyRule；`clearM3u8Ad(url, {}, rules)` 立即缓存并返回 |
| `cacheM3u8WithPngProxy(url, opts, fileName)` / `convertM3u8WithPngProxy(content, opts)` | png 分段 m3u8 转 ts 代理播放 |
| `startProxyServer(jsStr)` | 本地代理；js 里可用 MY_PARAMS 取参数；可返回 `JSON.stringify({body, headers, statusCode})`；返回 InputStream/byte[] 亦可 |
| `refreshVideoUrl(url, restart)` | 刷新播放地址，支持多线路对象 |
| `executeWebRule(url, jsStr, opts)` | 同步打开 WebView 执行 JS（对应 webRule://），opts: ua/blockRules/timeout(默认30000)/checkTime(默认250ms) |
| `isVideoOrMusic(url)` | 判断链接是否音视频 |
| `loadReadContentPage(url, opts)` / `getReadContentData(url, opts)` | 小说正文智能加载（Readability 提取正文+下一页自动追加） |

### 2.6 页面交互
`setPageTitle/setPagePicUrl/setPageParams/getPageTitle`、`refreshPage(flag)`、`back(flag)`
（仅二级）、`backToHome()`、`toast(msg)`、`showLoading/hideLoading`、
`confirm({title, content, confirm, cancel})`（$.toString 回调，方法内不能引用外部变量）、
`showSelectOptions({title, options, col, js, selectedIndex, bottom})`（js 里可用 MY_INDEX）、
`addItemAfter/Before(id, layout|layouts)`、`deleteItem(id|ids)`、`deleteItemByCls(cls)`、
`updateItem(id, layout)`、`findItem(id)`、`findItemsByCls(cls)`、
`setLastChapterRule(rule)`（js 写法需在 $.toString 里重新 getResCode/fetch，不可传选集列表）、
`addListener('onRefresh'|'onClose', jsStr)`（方法内不能引用外部变量）、
`setPageReverse(true|false)` / `isPageReversed()`、`registerTask(id, timeMs, jsStr)` / `unRegisterTask(id)`、
`copy(text)`、`getIP()`、`getAppVersion()`、`getColTypes()`、`getSearchMode()/setSearchMode(0|1)`、
`searchContains(text, key, ignoreCase)`（空格分词精准匹配）、`getCpuAbi()`（高风险）、
`createQRCode(text, showInput)` / `createQRCodeToFile(text)` / `startQRScanPage()`、
`openAppIntent(pkg, activity, {intentData})`、`shareDirectory(path, name)`、
`publishRule(rule)`（提交云仓库，需用户同意）。

### 2.7 文件/下载
`downloadFile(url, path, headers)`、`requireDownload(url, path)`（仅下载一次）、
`saveImage('url1||url2', path)`、`getResCode()`（当前页面源码）、`getParam(key, default)`、
`getPath`、`fileExist`。

### 2.8 模块引用
| API | 说明 |
|-----|------|
| `require(url, headers, version)` | 远程代码块 eval 执行；本地文件 `require('hiker://files/a.js')` 也可；md5 缓存 |
| `requireCache(url, hours)`（缩写 `rc`） | 缓存 N 小时再重新下载；`fetchCache`(缩写 `fc`) 只缓存不 eval；`deleteCache(url)` 强制更新 |
| `requirejs('a')` | CommonJS 模块（加载 libs/a.js，全局生效一次）；远程也可 |
| `$.require(path, importParam)` | 获取子页面/模块的 `$.exports`（见第 9 节 $ 工具） |

### 2.9 高级
`batchExecute(tasks, listener, successCount)`（缩写 `be`，多线程≤16，任务内不能引用外部变量，
listener 内 return 'break' 可中断）、`syncExecute({func, param})`（线程同步，多任务读写变量用）、
`loadJavaClass(dexPath, className, soDir)` / `findJavaClass(...)`（需授权）、
`getPrivateJS(code)` / `evalPrivateJS(code)`（加密代码，不要引用非顶层变量）、
`initChaquopy(apkPath)`（Python 支持）、`getEpubChapters(path)` / `getEpubContent(path, url)` /
`getEpubMetadata(path)`（EPUB 开放接口，正文用 rich_text 加载）、
`buildWebDav(url, user, pass)`（webdav.list/download/upload/delete/makeDir；子文件夹用子元素 url 再 build）。
`config`：预处理里 `initConfig({pako: 'https://cdn.com/v3.5.js'})`，之后 `config.pako` 读取。

### 2.10 JS 域内变量
`MY_URL`（当前请求地址）、`MY_HOME`（由 MY_URL 算出的根地址）、`MY_PAGE`（页码从 1 开始）、
`MY_TYPE`（home/search）、`MY_KEYWORD`（搜索关键词，仅搜索页）、`MY_CLASS_NAME/MY_CLASS_URL`、
`MY_YEAR_NAME/MY_YEAR_URL`、`MY_AREA_NAME/MY_AREA_URL`、`MY_SORT_NAME/MY_SORT_URL`（首页分类替换词）、
`MY_PARAMS`（上级页面点击项 extra 对象）、`MY_RULE`（当前规则对象）、`MY_NAME`（应用名）、
`MOBILE_UA/PC_UA`、`getHome(url)`（动态取主页地址）、`getRule()`（规则字符串）。

## 3. 链接协议大全

| 协议 | 作用 |
|------|------|
| `hiker://home` | 展开显示全部小程序；`hiker://home@规则名` 跳转指定小程序（仅小程序内） |
| `hiker://bookmark` / `hiker://download` / `hiker://history`(`?rule=x`) / `hiker://collection`(`?group=`/`?rule=`) | 跳转书签/下载/历史/收藏 |
| `hiker://search?s=kw` | 打开搜索弹窗；`&group=分组` 自动切分组；`&rule=规则名` 直达搜索结果；`&simple=false` 可切换并自动搜索 |
| `hiker://empty` | 空页面；`hiker://empty#http://a.com@rule=js:fetch(MY_URL.split('#')[1],{})` 用于"进入二级后再请求" |
| `hiker://js` / `hiker://adUrl` / `hiker://adRule` / `hiker://setting` / `hiker://settingMore` / `hiker://webRule` / `hiker://debug`(`?url=x`) / `hiker://webdav` | 跳转对应管理页（部分仅小程序内） |
| `hiker://explore`(`?path=`) / `hiker://localMedia` / `hiker://webSearch` | 文件管理/本地媒体/网页搜索 |
| `rule://base64口令` | 点击导入规则（口令=海阔视界开头 base64） |
| `海阔视界...` | 任何"海阔视界"开头的链接识别为口令 |
| `pics://url1&&url2` | 多图模式（漫画），下拉自动下一章 |
| `toast://文本` | 提示 |
| `input://{"value":"默认","js":"'toast://'+input","hint":"提示"}` | 弹输入框；`{"value":"{{clipboard}}"}` 取剪贴板 |
| `confirm://提示.js:'动作'` | 确认框 |
| `copy://文本.js:'跳转'` | 复制文本（可跟跳转） |
| `select://{"title","options","col","js","selectedIndex","bottom","attachView"}` | 下拉选择框 |
| `editFile://路径`(`@js=`) / `openFile://路径` / `download://url` / `share://路径` / `fileSelect://js` | 文件类操作（fileSelect 里 input=拷贝后的路径，MY_PATH=原始路径） |
| `javascript:代码` | 彩蛋模式，浏览器执行 JS |
| `x5://url` | X5 全屏网页 |
| `x5WebView://url` | 刷新当前 X5 链接 |
| `web://url` | 强制跳网页（忽略二级解析规则） |
| `x5Play://url` | X5 播放器播放 |
| `video://https://xxx.html` | 自动提取视频并播放；extra 支持 blockRules/js/videoRules/videoExcludeRules/cacheM3u8 |
| `x5Rule://url@JS`（X5 内核嗅探）/ `webRule://url@JS`（系统内核嗅探） | 见第 10 节 |
| `webview://url;get;UTF-8;{}` | WebView 加载链接取源码 |
| `hiker://page/xxx?url=&rule=` | 子页面跳转（extra 传参数用 MY_PARAMS，url 参数中文?& 用 ？？ 和 ＆＆ 代替） |

## 4. URL 链接增强语法（search_url/首页链接/图片 header）

完整格式：`地址;请求方式;编码;{header}`

```
https://movie.dban.com/j/search?q=**;POST;gbk;{User-Agent@Windows&&Cookie@id}
```

- `;` 后依次：请求方式（get/post）、编码（GBK/UTF-8）、`{}` 内 header（`key@value` 用 `&&` 分隔；
  header 值里的英文分号用两个中文分号代替）
- keyword 占位符：`**`（冲突时用 `%%`）
- POST 传参：GET 参数照样写，自动转 body；URL 里问号用 `？？` 代替转正；JSON 用参数 `JsonBody={"key1":"**"}`
- 值可用 JS 处理：`a&&href.js:'https://xxx?id='+input`；header 值也可：`Timestamp@.js:new Date().getTime()`
- 链接本身也可 JS 处理：`http://a.com.js:input+'/'?a=b.js:input+'a'`
- **图片自定义 header**：`http://a.jpg@headers={"User-Agent":"Windows","Cookie":"111"}`；
  旧式 `@Referer=http://x/@User-Agent=Windows@Cookie=111`（@Cookie 必须在 @Referer、@User-Agent 后）
- 图片解密：`pic_url: 'http://1.jpg@js=input'`（input 为 InputStream，返回也应为 InputStream）；
  `@js=` 必须放链接最后；失败占位图：`@js=if(input==null){fetch('http://x/error.png',{inputStream:true})}else input`
- 视频播放 header：`https://a.baid.com/2.mp4;{Cookie@aaa&&Referer@a.baid.com}`

## 5. 首页链接占位符

| 占位符 | 替换内容 |
|--------|---------|
| `fyclass` | 分类替换词 |
| `fyarea` | 地区替换词 |
| `fyyear` | 年代替换词 |
| `fysort` | 排序替换词 |
| `fyAll` | 同时替换分类/地区/年代（用了 fyAll 就不能再用别的替换词） |
| `fypage` | 页码 1,2,3… |
| `fypage@-1@*20@` | 偏移页：0,20,40…（@起始@*步长@） |
| `[firstPage=http://a.com/]` | 第一页用指定地址，第二页起正常 fypage |

注意：页数规则不可放链接最末尾（必要时加 `?_t=0` 无效串）。

## 6. 链接标识 #（请求时自动删除，仅做标记）

`#noLoading#` 不显示弹窗 ｜ `#noHistory#` 不记足迹 ｜ `#noRecordHistory#` 不记历史 ｜
`#noRefresh#` 禁止下拉刷新 ｜ `#immersiveTheme#` 沉浸式（仅二级/子页） ｜ `#fullTheme#` 全屏 ｜
`#readTheme#` 阅读模式（点击/音量翻页） ｜ `#gameTheme#` 游戏全屏 ｜
`#autoPage#` 自动加载下一章（小说章节项加此标识，勿含 fypage） ｜
`#autoCache#` 自动缓存页（秒开，勿用于正文页）；`#cacheOnly#` 只用缓存 ｜
`cacheCode($.toString(fn))` 缓存渲染前执行 ｜
`#isVideo=true#` 强制视频 ｜ `#ignoreVideo=true#` 强制非视频 ｜ `#isMusic=true#` / `#ignoreMusic=true#` ｜
`#ignoreImg=true#` 强制非图片 ｜ `#ignoreM3U8#` 不识别为 m3u8 ｜
`#background#` 后台播放音频保活 ｜ `#pre#` 强制保留预加载 ｜ `#noPre#` 不要预加载 ｜
`#originalSize#` 图片原尺寸 ｜ `#memoryPage#` 记忆翻页页数 ｜
`#concat#` 连接分段视频（多个地址用 #concat# 连接） ｜
`#fastPlayMode#` 极速播放（多线程边下边播） ｜ `#threads=10#` 配合 fastPlayMode 设线程数(3-32) ｜
`#checkMetadata=false#` 音频不禁用自动取封面等元数据 ｜
`#noCookie#`（header Cookie 值写 `#noCookie#` 时强制无 Cookie）。

## 7. 选择器完整语法

**规则格式**（非 js 时）：`列表;标题;图片;描述;链接;显示样式`
（搜索：`列表;标题;链接;描述;详情;图片`，前三必选，其余可用 `*` 省略）

- `&&` 级联取子元素；`--` 排除（如 `body--a&&a&&href` 排除第一个 a 后取下一个）；`||` 或
- `#id`、`.class`、`tag` 直接写（querySelector 风格）；支持 jsoup 原生语法（`img[src$=.png]`）
- 索引：`body&&a,1` 取第二个（`,` 加索引，负数倒取 `a,-1`）
- `Text` 取文字、`Html` 取带标签文本，其余默认识别为属性（href/src/data-*）
- 多选择器拼接：`a,0&&title+'--'+a,1&&title`（`+` 连接，字符串用单引号包裹，JS 处理用中文＋）
- 值 JS 处理：`a&&href.js:'https://xxx?id='+input`
- 完整 JS 规则：以 `js:` 开头写任意 JS（`pdfh/pdfa/pd` 可用，见第 2.3 节）

## 8. col_type 官方字典（节选+要点）

**影视类**：`movie_3`（默认三列圆角卡）、`movie_3_marquee`（标题跑马灯）、`movie_2`（两列）、
`movie_1`（单列）、`movie_1_left_pic`（图左文右）、`icon_1_left_pic`（小图）、
`movie_1_vertical_pic`（竖图）、`movie_1_vertical_pic_blur`（高斯模糊背景，extra.gradient 渐变）

**文本类**：`text_1~text_5`（单列~五列；textAlign 左对齐；**text_1 支持红橙混排**
`"““小棉袄””‘‘真帅’’啊"`）、`text_center_1`、`long_text`、`rich_text`
（富文本，extra.textSize/lineSpacing；图片加 `#originalSize#` 防横向放大）

**图片类**：`pic_1`/`pic_1_full`/`pic_1_center`、`pic_2`/`pic_2_card`、`pic_3`/`pic_3_square`

**图标类**：`icon_2`/`icon_2_round`、`icon_3_round_fill`/`icon_3_fill`、`icon_4`/`icon_4_card`/
`icon_small_3`/`icon_small_4`/`icon_round_4`/`icon_round_small_4`、`icon_5`/`icon_5_no_crop`

**布局/组件**：`line`/`line_blank`/`blank_block`/`avatar`/`text_icon`、`flex_button`（流式，连续 push 自动聚合）、
`scroll_button`（滚动，同上）、`card_pic_1`/`card_pic_2`/`card_pic_2_2(_left)`/`card_pic_3(_center)`、
`input`（输入框，extra.onChange/titleVisible/defaultValue/type:textarea|password|number/highlight）、
`icon_1_search`、`x5_webview_single`（X5 组件，一页只能一个；desc 支持 `240`/`float&&100%`/`video`/`screen-100`/`top`；
extra: canBack/ua/js/jsLoadingInject/blockRules/referer/urlInterceptor/floatVideo/showProgress/autoPlay/addWebProxyRule）、
`video`（视频组件，基于 X5 不能共存，仅直链，extra 可带 Referer）

**混用**：js 规则里可对每个结果单独设 col_type；非 js 解析不支持混用。

## 9. 二级列表 / 深层嵌套 / 动态解析

- 二级列表（detail_find_rule）规则格式同首页：`列表;标题;图片;描述;链接;显示样式`，可嵌套
- **深层嵌套**：`级1==>级2==>级3`；`*` 表示链接继承上一级；`fyIndex` 占位符替换为点击位置
- **链接继承示例**：`body&&.pannel&&li;a&&Text;*;*;*==>body&&.playlist,fyIndex&&li;a&&Text;*;*;a&&href;text_3`
- JS 规则的嵌套：链接加 `@rule=列表;标题;图片;描述;链接;样式` 或 `@rule=js:规则`，支持多个 @rule=
- **动态解析**：链接加 `@lazyRule=规则`（&& 用中文 ＆＆＆＆ 代替；不能嵌套，只能最后一级）；
  `#noLoading#@lazyRule=...` 不显示弹窗；纯 JS：`@lazyRule=.js:input`
- 搜索二级与首页相同可写 `*` 继承首页二级规则

**$ 工具（=动态解析/嵌套的便捷写法）**：
```js
$(url).lazyRule(()=>{...})          // 生成 url@lazyRule=.js:(function(){})()
$(url).rule(()=>{...})              // 生成 url@rule=.js:(function(){})()（二级嵌套）
$('url@lazyRule=规则').input((input)=>{...})  // 输入框
$(hint).confirm(()=>{...})          // 确认框
$(url).x5Rule(()=>{...})            // x5 嗅探弹窗（需有 x5 组件）
$.toString(()=>{...})               // 函数转字符串（含外部变量需用参数传入）：$.toString((obj)=>{...}, obj)
$.exports={...}  /  $.require('path'|'hiker://page/x'|file|http, importParam)  // 模块导出/引用
// 参数传递到下一层：$(url).lazyRule((obj)=>{...}, {word:'23'})，obj 在下一页可用
```

**子页面**：`hiker://page/标识` 跳子页面；url 参数 `?type=mp4&source=...` 用 `getParam` 读取；
extra 传参用 `MY_PARAMS`（一个参数也必须是对象）；跨规则子页面加 `?rule=xxx`；
加载别的链接 `hiker://page/index.html?url=http://www.baidu.com`（冲突字符 ？？ ＆＆）。

## 10. 视频播放

**多线路 JSON**（url 字段写 JSON 字符串）：
```js
JSON.stringify({
  urls:   ['http://x/1.mp4', 'http://x/2.mp4'],           // 必选
  names:  ['超清', '高清'],                                // 可选线路名
  headers:[{'Referer':'xxx'}, {'Referer':'yyy'}],         // 可选（header 里的分号用；；代替）
  subtitle:'http://x/1.srt',                              // 外挂字幕 srt/vtt/ass
  danmu:  'http://x/1.xml' | 'http://x/1.json' | 'web://hiker://files/1.html',  // 弹幕
  lyric:  'http://x/1.lrc',                               // 歌词
});
```

**音频分离**（音视频不同地址）：`{url: JSON.stringify({urls:[url], audioUrls:[audio]}), col_type:'text_3'}`
（audioUrls 数组长度与 urls 一致，单元素则复用）

**播放进度记忆**：列表项 `extra:{id:'全局唯一ID'}`；不想要记忆拼接 `&memoryPosition=full`

**嗅探**：`x5Rule://链接@JS` / `webRule://链接@JS`——JS 每 250ms 执行一次，返回非空即取到资源；
JS 里 `fy_bridge_app.getUrls()`（字符串）/`window._getUrls()`（数组）获取已加载资源，
`fba.getHeaderUrl(url)` 取带 header 的地址，extra 可设 ua/referer/blockRules；30s 超时自动销毁。

## 11. 网页桥接 fy_bridge_app（网页/X5 内可用，可简写 fba）

`fba.setAppBarColor('#fff')` 状态栏 ｜ `fba.playVideo(url)` / `fba.playVideos(JSON.stringify([{title,url,use,codeAndHeader,originalUrl}]))` 播放 ｜
`fba.showPic(url)` ｜ `fba.setWebTitle(title)` / `fba.setWebUa(ua)` ｜ `fba.importRule('口令')` ｜
`fba.writeFile(path, content)` ｜ `request(url,opts)` / `requestAsync(url,param,key,callback)`（页面加载完才能用；javascript: 模式先 `eval(fba.getInternalJs())`）｜
`fba.putVar/getVar/clearVar`（与规则 JS 互通）｜ `fba.getCookie(url)`（域名需一致，http-only 也能拿）｜
`fba.refreshPage(true)`（仅 X5 组件内）｜ `fba.parseDomForHtml/parseDomForArray`（后者返回数组字符串需 JSON.parse）｜
`fba.refreshX5Desc` ｜ `fba.saveImage(urls, path)` ｜
`fba.open(JSON.stringify({rule,title,url,group,col_type,findRule,preRule,extra}))` 跳二级（新推荐；旧 toDetailPage 已废弃）｜
`fba.newPage(title, url)` X5 内新开页面 ｜ `fba.parseLazyRule(url)` / `fba.parseLazyRuleAsync(url, jsStr)` ｜
`fba.parsePaste(url)` ｜ `fba.getHeaderUrl(url)` / `getRequestHeaders(url)` ｜ `fba.getUa()` ｜
`fba.openThirdApp('legado://…')` ｜ `fba.clearM3u8Ad(url)` ｜ `fba.isVideoOrMusic(url)` ｜
`fy_bridge_app.getUrls()` / `fy_bridge_app.log(msg)`（嗅探 JS 内调试）。

## 12. 自动导入口令（分享/订阅格式）

统一格式：`海阔视界，标识￥名称￥内容`（示例：`海阔视界，小程序规则￥home_rule￥{'title':'VIP'}`）

| 标识 | 内容 |
|------|------|
| `home_rule_url` | 小程序合集/单规则 JSON 网址 |
| `home_rule` | 单条小程序规则 JSON |
| `search_engine_url` / `search_engine_v2` | 搜索引擎合集/单条 |
| `js_url` | 网页插件：`插件名@网址`（global_ 前缀=全局，域名前缀=指定站，按名称排序加载） |
| `ad_url_rule` / `ad_subscribe_url` | 广告拦截（订阅格式 `{"urlV2":"…","domBlockRuleUrl":"…"}`） |
| `bookmark` / `bookmark_url` | 书签 |
| `file_url` | 本地文件：`hiker://files/a.txt@网址` |
| `fast_play_urls` / `xt_dialog_rules` | 极速播放白名单/嗅探弹窗黑名单 |
| `home_sub` | 合集规则订阅地址（检测更新可写 `@js=` JS 规则） |
| `publish_account` | 云仓库账号@密码 |
| `require_url` | 更新依赖 JS |
| `@import=js:` | 云口令自定义导入：`网址@import=js:writeFile('hiker://files/cache/test.js', fetch(input))` |
| `web-proxy` | 浏览器代理规则 JSON |

## 13. 高级开放接口

- **投屏**：`/playUrl`（当前播放地址，`?enhance=true` 带 header/片头片尾 `{title,url,headers,jumpStartDuration,jumpEndDuration}`）、
  `/getPlayList`、`/playMe?index=&title=`、`/playNext`；网页投屏链接加 `/redirectPlayUrl` 用电脑播放器
- **EPUB**：`getEpubChapters(path)` → `getEpubContent(path, chapter.url)`（正文 rich_text 加载，配 `#readTheme#`/`#autoPage#`）、`getEpubMetadata(path)`
- **WebDav**：`buildWebDav(url, user, pass)`；`.list()/.download(name, path)/.upload(name, path)/.delete(name)/.makeDir(name)`；子文件夹用子元素的 url 再 build
- **弹幕搜索子页面**：子页面标识 `danmu#开头`，返回 `[{title, url}]`（input=片名，url 可带 @lazyRule= 多层）
- **外部唤起 JS**：子页面标识 `intent#js#`，第三方打开 js 文件时提示调用（input=文件路径）
- **小程序包**：`.hk小程序.zip`（rule.json + libs.zip + data.zip + data2.zip + require.json）；合集包 `.hk合集.zip`/`.hkpkg`（含 .hkshell 脚本：`COPY a.txt hiker://files/cache/` 或 `js: copyFiles('a.txt','hiker://files/cache/')`，MY_DIR 当前文件夹）
- **Python**：下载 chaquopy 依赖 apk，规则里 `initChaquopy(path)` 后运行 Python
- **小程序订阅**：直链返回规则数组；或 `网址@js=JS`（input 注入，返回规则网址/空/toast）
- **代理 proxy（顶层字段）**：一行一个 `原地址=>新地址`，对 fetch/request/require/首页链接/搜索链接都生效
- **JS 预处理 (preRule)**：首页/搜索解析前执行（无需 js: 前缀，可用 MY_RULE）；常用于获取 cookie

---

## 14. 外部 JS 源加载模式

大量社区规则把实际解析逻辑放在**外部 JS 文件**，数据库规则只保留加载入口。三种常见框架：

### 14.1 drpy / hipy_t3 格式（TVBox 风格，兼容）
每个源是独立 JS 文件，导出 `parse`（列表/首页）与 `play`（详情/播放）：

```js
var rule = {
  title: '源名称', host: 'https://example.com',
  url: '/vodshow/fyclass-fyid-fypage.html',
  searchUrl: '/vodsearch/**/fypage.html',
  searchable: 2, quickSearch: 0, filterable: 0,
  class_name: '电影&电视剧', class_url: '1&2',
  headers: { 'User-Agent': 'MOBILE_UA' }, timeout: 5000,
  parse: function (html) {           // 首页/列表：pdfa/pdfh/pd 解析
    var list = pdfa(html, 'body&&.module-item'); var result = [];
    list.forEach(function (item) {
      result.push({ title: pdfh(item, 'img&&alt'), desc: pdfh(item, '.module-item-text&&Text'),
        pic_url: pd(item, '.lazy&&data-src'), url: pd(item, 'a&&href') });
    });
    return result;
  },
  play: function (html) { return pd(html, 'iframe&&src'); }  // 详情/播放
};
```

### 14.2 TyrantG 外部 JS 模式
JS 文件存放于 `hiker://files/rules/` 目录，数据库规则只剩加载入口：

```js
// 数据库 find_rule
js:
eval(fetch("hiker://files/rules/TyrantG/LIVE/douyu.js"));
baseParse();
// 外部文件示例: hiker://files/rules/TyrantG/LIVE/douyu.js
```

### 14.3 远程依赖加载模式（大型聚合规则）
通过 `preRule` 动态加载远程 JS 库（配合 `require` / 版本号缓存 / `initConfig`）：

```js
// prerule 示例：GitHub 远程库 + 代理
let ghproxy = $.require('ghproxy').getproxy();
for (let i = 0; i < ghproxy.length; i++) {
  try { require(ghproxy[i] + 'https://raw.githubusercontent.com/xxx/hk/master/JyRequire.js'); break; }
  catch (e) { }
}
initConfig({ 依赖: srcHome });
```

> 注意：远程文件更新时，同一地址软件不会重新下载——给链接加 `?v=1` 版本号强制刷新；
> 修改版本号会无视缓存时间直接更新（见 2.8 模块引用）。

---

> 文档整理基于 App 内置开发者手册（version 1），实际行为以 App 为准。
> 配套阅读：《写源模板手册》(doc: blueprint)——怎么组织规则；本手册——官方 API/协议标准。