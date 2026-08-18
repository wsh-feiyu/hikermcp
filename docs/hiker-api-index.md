# 海阔视界 API 速查索引

> 由 docs/hiker.d.ts（2425 行）自动生成，共 180 个 API。
> **用法**：先读本索引定位 API 名，再用 `get_rule_docs({ doc: 'hiker-dts', keyword: '函数名' })` 精准提取声明，不要一次读全文。
> 重新生成：`node scripts/gen-api-index.mjs`

## 编解码 & 加解密

- `base64Encode(str: string): string` — base64 编码
- `base64Decode(b64: string): string` — base64 解码
- `hexToBase64(hexStr: string): string`
- `window0`
- `aesEncode(key: string, str: string): string` — aes 加密
- `aesDecode(key: string, str: string): string` — aes 解密
- `encodeStr(str: string, enc: 'GBK' | 'UTF-8'): string` — 字符编码
- `decodeStr(str: string, enc: 'GBK' | 'UTF-8'): string` — 字符解码
- `rsaEncrypt(data: string, key: string, options?: rsaOptions): string` — rsa 加密
- `rsaDecrypt(encryptBase64Data: string, key: string, options?: rsaOptions): string` — rsa 解密
- `md5(text: string): string` — 文本MD5
- `md5(path: string): string` — 取文件MD5
- `rc4`
- `convertBase64Image(url: string): string`
- `_base64`
- `getCryptoJS(): string`

## JS 域内变量

- `MY_NAME`
- `MY_URL` — 当前网络请求地址
- `MY_HOME`
- `MY_RULE`
- `getRule(): string` — 获取当前规则，注意返回的是字符串
- `getHome(url: string): string` — 获取主页地址
- `MOBILE_UA`
- `PC_UA`
- `MY_PAGE`
- `MY_TYPE`
- `MY_PARAMS`

## JS 解析文档方法

- `parseDom(context: string, selector: string, url?: string): string`
- `pd`
- `parseDomForHtml(context: string, selector: string): string`
- `pdfh`
- `parseDomForArray(context: string, selector: string): string[]` — 解析文档获取列表内容，可简写 pdfa
- `pdfa`
- `xpath(context: string, selector: string): string`
- `xpath(context: string, selector: string): string[]`
- `xpa`

## JS 方法

- `getIP(): string` — 获取手机IP
- `toast(text: string): undefined` — 消息提示
- `getAppVersion(): number` — 获取应用的版本号
- `getColTypes(): col_type[]` — 获取所有可选首页样式
- `getRuleCount(): string` — 获取小程序数量，注意返回的是字符串
- `copy(text: string): undefined` — 复制文本信息到剪贴板，禁止频繁调用，正常使用 copy://text 的路由放在链接里面即可
- `getLastRules(count?: number): rule[]` — 获取常用历史规则
- `getPageTitle(): string` — 获取当前页面标题
- `setPageTitle(title: string): undefined` — 新页面代码里面动态修改页面标题
- `setPagePicUrl(url: string): undefined` — 修改页面图片地址
- `setPageParams(params: object): undefined` — 修改页面附加参数
- `setLastChapterRule(rule: string): undefined`
- `addListener(type: 'onRefresh' | 'onClose', listener: string): undefined`
- `getPastes(): string[]` — 获取可以使用的云剪贴板
- `sharePaste(content: string, paste?: string): string` — 分享到云剪贴板
- `parsePaste(url: string): string` — 解析云剪贴板
- `getCpuAbi(): 'arm64-v8a' | 'armeabi-v7a'`
- `getSearchMode(): 0 | 1` — 获取搜索模式
- `setSearchMode(flag: 0 | 1): void` — 1 代表精准搜索模式
- `searchContains(text: string, key: string, flags?: boolean): undefined`
- `registerTask(id: string | null, time: number, func: string): undefined`
- `unRegisterTask(id: string): undefined` — 手动删除任务
- `startProxyServer(func: string): string`

## JS 常用方法

- `getResCode(): string` — 获取 html
- `log(data: any): undefined`
- `getParam(key: string, defaultValue?: string): string`
- `setError(err: string): void` — 显示内容到界面上或者输出错误信息，推荐使用 log 进行调试
- `setHomeResult(layouts: layout[]): void` — 用于设置首页结果
- `setSearchResult(layouts: layout[]): void` — 用于设置搜索结果
- `setResult(layouts: layout[]): void` — 用于设置结果
- `refreshPage(flag?: boolean): undefined`
- `back(flag?: boolean): undefined`
- `getHomeSub(): rule[]` — 获取我的规则订阅
- `hasHomeSub(url: string): boolean` — 判断是否已经订阅某个地址
- `refreshX5WebView(url: string): undefined` — 刷新X5链接或者内容
- `refreshX5Desc(desc: string): undefined` — 该方法只会刷新高度等信息，不会刷新网页
- `showLoading(text: string): undefined` — 显示 Loading 弹窗
- `hideLoading(): undefined` — 隐藏 Loading 弹窗
- `confirm(option: { title: string`
- `updateItem(id: string, layout: layout): undefined`
- `deleteItem(id: string): undefined`
- `deleteItem(ids: string[]): undefined`
- `deleteItemByCls(cls: string): undefined`
- `addItemAfter(id: string, layout: layout): undefined`
- `addItemBefore(id: string, layout: layout): undefined`
- `addItemAfter(id: string, layouts: layout[]): undefined`
- `addItemBefore(id: string, layouts: layout[]): undefined`
- `findItem(id: string): layout | null`
- `findItemsByCls(cls: string): layout[] | null`

## 存储和读取

- `getPath(path: string): string`
- `fileExist(path: string): boolean` — 检测文件是否存在
- `saveImage(url: string, path: string): undefined`
- `writeFile(filePath: string, content: string): undefined`
- `saveFile(fileName: string, content: string, flag?: 0): undefined`
- `readFile(fileName: string, flag?: 0): string` — 私有文件写入
- `deleteFile(fileName: string): undefined` — 私有文件删除
- `setPublicItem(key: string, value: string): undefined`
- `getPublicItem(key: string, defaultValue?: string): string` — 公开读取
- `clearPublicItem(key: string): undefined` — 公开移除
- `putVar(key: string, value: string): undefined`
- `getVar(key: string, defaultValue?: string): string` — 读取全局变量
- `clearVar(key: string): undefined` — 清除全局变量
- `putMyVar(key: string, value: string): undefined`
- `getMyVar(key: string, defaultValue?: string): string` — 读取规则内全局变量
- `listMyVarKeys(): string[]` — 列出规则内所有key
- `clearMyVar(key: string): undefined` — 清除规则内全局变量
- `setItem(key: string, value: string): undefined` — 设置私有化存储，关闭应用不会失效，更新规则数据不会改变，但规则删除会丢失，重新导入也没用
- `getItem(key: string, defaultValue?: string): string` — 获取私有化存储
- `clearItem(key: string): undefined` — 清除私有化存储
- `storage0`

## 请求相关

- `closeMe(stream: object): undefined` — 关闭流
- `buildUrl(url: string, obj: object): string`
- `fetch(url: string, options?: fetchOptions): string` — 发送请求，默认 UA 为 MOBILE_UA
- `request`
- `fetchPC(url: string, options?: fetchOptions): string` — 发送请求，默认 UA 为 PC_UA，其他与 fetch 相同
- `post(url: string, options?: postOptions): string`
- `postPC(url: string, options?: postOptions): string`
- `http`
- `fetchCookie(url: string, options?: fetchOptions): string` — 获取 Cookie
- `getCookie(url: string): string` — 获取cookie
- `registerDNS(dns: object): undefined`
- `ipping(ip: string, timeout?: number): boolean`
- `findReachableIP(ips: string[], timeout?: number): string | null`
- `batchFetch(fetchArr: { url: string`
- `bf`
- `hexToBytes(hexString: string): Uint16Array` — 将16进制字符串转成Uint8Array，可以搭配 fetch(url, {toHex: true}) 使用
- `writeHexFile(filePath: string, hexString: string): undefined`
- `cacheM3u8(url: string, options?: fetchOptions, fileName?: string): string`
- `batchCacheM3u8(fetthArr: { url: string` — 批量多线程缓存，可简写 bcm
- `bcm`
- `fixM3u8(url: string, fixContent: string): string`
- `clearM3u8AdLazy(url: string, options?: fetchOptions): string`
- `clearM3u8Ad(url: string, options?: fetchOptions): string` — 移除M3U8广告片段并立即缓存m3u8到本地
- `cacheM3u8WithPngProxy(url: string, options?: fetchOptions, fileName?: string): string`
- `convertM3u8WithPngProxy(content: string, options?: fetchOptions): string`
- `initConfig(config: onject): undefined`
- `evalPrivateJS(code: string): string`
- `require(url: string, options?: fetchOptions, version?: number): undefined`
- `requireCache(url: string, time: number): undefined`
- `deleteCache(url?: string): undefined`
- `requirejs(url?: string): undefined`
- `downloadFile(url: string, filePath: string, headers?: headers): undefined`
- `requireDownload(url: string, filePath: string): undefined`
- `batchExecute(tasks: task[], listener?: listener, successCount?: number): undefined`
- `be`
- `syncExecute(param: { func: (obj: object) => any`
- `loadJavaClass(dexPath: string, package: string, path: string): object`
- `fetchCodeByWebView(url: string, options?: fetchCodeByWebViewOptions)` — 使用WebView获取源码

## $工具（LoyDglk大佬提供）

- `$` — $工具（LoyDglk大佬提供）
- `$(param1?: string, param2?: string, param3?: string): $$`

## 官方帮助手册补充 API（来自 App 内置开发者手册 help_*.json）

- `setPreResult(layouts: layout[]): void` — 常用于顶部固定按钮秒开 + 底部网络请求结果
- `globalMap0` — 存储全局对象（任意类型：字符串/数值/对象/数组）
- `executeWebRule(url: string, js: string, options?: object): string` — 后台执行 webRule 的代码（同步阻塞，对应 webRule://url@JS）
- `loadReadContentPage(url?: string, options?: object): undefined` — 子页面正文规则写 js: loadReadContentPage(MY_PARAMS.u) 即可
- `getReadContentData(url?: string, options?: object): { content: string` — 获取当前页面正文内容和下一页地址（被 loadReadContentPage 使用，Readability 提取）
- `refreshVideoUrl(url: string | object, restart: boolean): undefined` — 刷新播放地址（立即生效）
- `cacheCode(code: string | (() => any)): undefined` — 自动缓存页面（配合 #autoCache# 标识）；从缓存渲染页面之前执行：
- `fetchCache(url: string, hours: number): string` — 缓存远程文件 N 小时，只缓存不执行 eval
- `fc`
- `getEpubChapters(path: string): { title: string` — EPUB 开放接口：解析章节目录
- `getEpubContent(path: string, chapterUrl: string): string` — EPUB 开放接口：获取章节正文（图片自动识别；正文用 rich_text 加载，可配 #readTheme#/#aut
- `getEpubMetadata(path: string): object` — EPUB 开放接口：获取更多元信息
- `buildWebDav(url: string, user: string, password: string): {` — WebDav 开放接口
- `getPrivateJS(code: string): string` — 加密代码不要引用非顶层作用域的变量；用 evalPrivateJS(code) 运行
- `showSelectOptions(options: { title?: string` — 带图标后只能两列；bottom 显示在底部；js 里可用 MY_INDEX 获取点击索引
- `openAppIntent(pkg: string, activity: string, params?: object): undefined` — 打开第三方软件
- `createQRCode(text: string, showInput?: boolean): undefined` — 生成二维码（true=展示输入框允许修改）
- `createQRCodeToFile(text: string): string` — 生成二维码到文件，返回文件路径（可放图片属性显示）
- `startQRScanPage(): undefined` — 跳转二维码扫描界面
- `shareDirectory(path: string, name?: string): undefined` — 第二参数不传默认文件名为文件夹名称.hk合集.zip
- `publishRule(rule: object | object[]): undefined` — 提交规则到云仓库（会弹窗征求用户同意）
- `initChaquopy(apkPath: string): undefined` — 初始化 Python（chaquopy）支持，参数为 chaquopy 框架 assets 打包的 apk 路径
- `isVideoOrMusic(url: string): boolean` — 判断链接地址是不是音视频（关键词匹配 + 用户嗅探规则）
- `backToHome(): undefined` — 关闭当前窗口所有页面直到回到首页
- `MY_KEYWORD` — 当前搜索关键词（仅搜索页面可用）
- `MY_CLASS_NAME` — 当前分类名称/替换词（仅首页且规则写了替换词时可用）
- `MY_CLASS_URL`
- `MY_YEAR_NAME` — 当前年代名称/替换词
- `MY_YEAR_URL`
- `MY_AREA_NAME` — 当前地区名称/替换词
- `MY_AREA_URL`
- `MY_SORT_NAME` — 当前排序名称/替换词
- `MY_SORT_URL`
- `request00(url: string, options?: object): string` — 同步请求（网页桥接 fy_bridge_app 内；页面加载完成后才可用，立即使用用 request00）

---
*索引为名称速查，详细签名/参数/示例见 hiker.d.ts 原文。*