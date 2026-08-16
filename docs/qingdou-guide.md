
var d = [];
d.push({
    title: `<h1>青豆剧场 规则编辑指南</h1>

<h2>一、标准规则格式</h2>

<p>所有规则文件必须导出 <font color="#C678DD"><b>var parse = { ... }</b></font> 或 <font color="#C678DD"><b>var Rule = { ... }</b></font> 对象。</p>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">var Rule = {<br>
&nbsp;&nbsp;&nbsp;&nbsp;名称: "示例影视",<br>
&nbsp;&nbsp;&nbsp;&nbsp;作者: "xxx",<br>
&nbsp;&nbsp;&nbsp;&nbsp;版本: "1.0",<br>
&nbsp;&nbsp;&nbsp;&nbsp;类型: "主页源",<br>
<br>
&nbsp;&nbsp;&nbsp;&nbsp;host: "https://www.example.com",<br>
&nbsp;&nbsp;&nbsp;&nbsp;UA: "Mozilla/5.0 ...",<br>
<br>
&nbsp;&nbsp;&nbsp;&nbsp;分类: {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;class_name: "电影&电视剧&综艺&动漫&短剧",<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;class_url: "1&2&3&4&5",<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;url: "https://xxx/vodshow/id/fyclass/page/fypage.html"<br>
&nbsp;&nbsp;&nbsp;&nbsp;},<br>
<br>
&nbsp;&nbsp;&nbsp;&nbsp;主页: function(page, categoryId) { ... },<br>
&nbsp;&nbsp;&nbsp;&nbsp;搜索: function(keyword, page) { ... },<br>
&nbsp;&nbsp;&nbsp;&nbsp;二级: function(url) { ... },<br>
&nbsp;&nbsp;&nbsp;&nbsp;解析: function(url) { ... }<br>
};</font></small></p>

<hr>

<h2>二、元信息</h2>

<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;">
<tr style="background:#f0f0f0;"><td><b>字段</b></td><td><b>类型</b></td><td><b>必填</b></td><td><b>说明</b></td></tr>
<tr><td>名称</td><td>string</td><td>是</td><td>规则显示名称</td></tr>
<tr><td>作者</td><td>string</td><td>否</td><td>作者标识</td></tr>
<tr><td>版本</td><td>string</td><td>否</td><td>版本号</td></tr>
<tr><td>类型</td><td>string</td><td>是</td><td><font color="#C678DD"><b>主页源</b></font>、<font color="#C678DD"><b>搜索源</b></font> 或 <font color="#C678DD"><b>直播源</b></font></td></tr>
<tr><td>playType</td><td>string</td><td>否</td><td>播放类型，设为 <font color="#C678DD"><b>"live"</b></font> 标记为直播规则</td></tr>
</table>

<hr>

<h2>三、站点配置</h2>

<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;">
<tr style="background:#f0f0f0;"><td><b>字段</b></td><td><b>类型</b></td><td><b>必填</b></td><td><b>说明</b></td></tr>
<tr><td>host</td><td>string</td><td>是</td><td>站点根地址</td></tr>
<tr><td>UA</td><td>string</td><td>否</td><td>请求User-Agent，自动注入到fetchHtml</td></tr>
</table>

<hr>

<h2>四、分类</h2>

<p>统一使用 <font color="#C678DD"><b>分类</b></font> 字段，框架自动识别静态/动态模式：</p>

<h3>静态模式（class_name存在时）</h3>

<p>分类固定不变，适用于大多数站点：</p>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">分类: {<br>
&nbsp;&nbsp;&nbsp;&nbsp;class_name: "电影&电视剧&综艺&动漫&短剧",<br>
&nbsp;&nbsp;&nbsp;&nbsp;class_url: "1&2&3&4&5",<br>
&nbsp;&nbsp;&nbsp;&nbsp;url: "https://xxx/vodshow/id/fyclass/page/fypage.html"<br>
}</font></small></p>

<p>URL模板占位符：</p>
<ul>
<li><font color="#C678DD"><b>fyclass</b></font> → 替换为分类ID</li>
<li><font color="#C678DD"><b>fypage</b></font> → 替换为页码</li>
</ul>

<h3>动态模式（cate1存在时）</h3>

<p>从页面自动提取分类，适用于分类可变的站点：</p>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">分类: {<br>
&nbsp;&nbsp;&nbsp;&nbsp;cate1: "body&&.nav-menu",<br>
&nbsp;&nbsp;&nbsp;&nbsp;cate2: "body&&.filter-group",<br>
&nbsp;&nbsp;&nbsp;&nbsp;filter: "首页|今日|APP"<br>
}</font></small></p>

<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;">
<tr style="background:#f0f0f0;"><td><b>字段</b></td><td><b>说明</b></td></tr>
<tr><td>cate1</td><td>一级分类容器选择器</td></tr>
<tr><td>cate2</td><td>二级筛选选择器（可选）</td></tr>
<tr><td>filter</td><td>需排除的菜单关键词，<font color="#C678DD"><b>|</b></font>分隔</td></tr>
</table>

<p>设为 <font color="#C678DD"><b>null</b></font> 或不设置则无分类。</p>

<hr>

<h2>五、核心方法</h2>

<h3>主页(page, categoryId)</h3>

<p>返回首页内容列表。别名：<font color="#C678DD"><b>一级</b></font>、<font color="#C678DD"><b>home</b></font>、<font color="#C678DD"><b>category</b></font>。</p>

<p><b>参数：</b></p>
<ul>
<li><font color="#C678DD"><b>page</b></font> — 页码，从1开始</li>
<li><font color="#C678DD"><b>categoryId</b></font> — 当前分类ID</li>
</ul>

<h3>推荐()</h3>

<p>返回首页推荐内容列表（轮播+精选）。无参数，返回格式同主页。可选方法，不实现时框架自动调用主页第一页。</p>

<p><b>返回：</b> 数组，每项结构：</p>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">{<br>
&nbsp;&nbsp;&nbsp;&nbsp;vod_name: "影片名",<br>
&nbsp;&nbsp;&nbsp;&nbsp;vod_pic: "图片URL",<br>
&nbsp;&nbsp;&nbsp;&nbsp;vod_id: "详情页URL或ID",<br>
&nbsp;&nbsp;&nbsp;&nbsp;vod_remarks: "更新信息"<br>
}</font></small></p>

<p>或使用标准格式：</p>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">{<br>
&nbsp;&nbsp;&nbsp;&nbsp;title: "影片名",<br>
&nbsp;&nbsp;&nbsp;&nbsp;desc: "更新信息",<br>
&nbsp;&nbsp;&nbsp;&nbsp;img: "图片URL",<br>
&nbsp;&nbsp;&nbsp;&nbsp;url: "详情页URL",<br>
&nbsp;&nbsp;&nbsp;&nbsp;col_type: "movie_3",<br>
&nbsp;&nbsp;&nbsp;&nbsp;extra: { name: "影片名" }<br>
}</font></small></p>

<p><b>常用 col_type：</b></p>
<ul>
<li><font color="#C678DD"><b>movie_3</b></font> — 三列海报</li>
<li><font color="#C678DD"><b>movie_3_marquee</b></font> — 三列海报+标题滚动</li>
<li><font color="#C678DD"><b>movie_2</b></font> — 两列横图（直播源默认）</li>
<li><font color="#C678DD"><b>movie_1_vertical_pic</b></font> — 单列竖图</li>
<li><font color="#C678DD"><b>card_pic_1</b></font> — 轮播卡片（desc设为<font color="#C678DD"><b>"0"</b></font>）</li>
</ul>

<p><b>轮播写在主页内：</b></p>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">主页: function(page, categoryId) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;var d = [];<br>
&nbsp;&nbsp;&nbsp;&nbsp;if (page == 1) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;var html = this.fetchHtml(this.host);<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;var blist = pdfa(html, ".swiper-wrapper&&.swiper-slide");<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;for (var i = 0; i < blist.length; i++) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;d.push({<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;title: pdfh(blist[i], "a&&title") || "",<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;img: this.fixUrl(pd(blist[i], "img&&data-original") || ""),<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;url: this.fixUrl(pd(blist[i], "a&&href") || ""),<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;desc: "0",<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;col_type: "card_pic_1"<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;});<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>
&nbsp;&nbsp;&nbsp;&nbsp;}<br>
&nbsp;&nbsp;&nbsp;&nbsp;return d;<br>
}</font></small></p>

<h3>搜索(keyword, page)</h3>

<p>返回搜索结果列表，结构与主页相同。</p>

<h3>二级(url)</h3>

<p>返回影片详情。别名：<font color="#C678DD"><b>detail</b></font>。</p>

<p><b>createDetailResult()：</b>全局函数，创建标准详情结果对象，所有字段预置为空，直接赋值即可：</p>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">二级: function(url) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;var result = createDetailResult();<br>
&nbsp;&nbsp;&nbsp;&nbsp;result.title = "影片名";<br>
&nbsp;&nbsp;&nbsp;&nbsp;result.img = "海报URL";<br>
&nbsp;&nbsp;&nbsp;&nbsp;result.desc = "简介";<br>
&nbsp;&nbsp;&nbsp;&nbsp;result.detail1 = "''''导演/主演";<br>
&nbsp;&nbsp;&nbsp;&nbsp;result.detail2 = "''''类型/年份";<br>
&nbsp;&nbsp;&nbsp;&nbsp;result.line.push("线路1");<br>
&nbsp;&nbsp;&nbsp;&nbsp;result.list.push([{ title: "第1集", url: "playUrl" }]);<br>
&nbsp;&nbsp;&nbsp;&nbsp;return result;<br>
}</font></small></p>

<p><b>返回对象结构：</b></p>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">{<br>
&nbsp;&nbsp;&nbsp;&nbsp;img: "海报URL",<br>
&nbsp;&nbsp;&nbsp;&nbsp;desc: "简介",<br>
&nbsp;&nbsp;&nbsp;&nbsp;detail1: "''''导演/主演信息",<br>
&nbsp;&nbsp;&nbsp;&nbsp;detail2: "''''类型/地区/年份",<br>
&nbsp;&nbsp;&nbsp;&nbsp;line: ["线路1", "线路2"],<br>
&nbsp;&nbsp;&nbsp;&nbsp;list: [<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[{ title: "第1集", url: "播放URL" }, ...],<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[{ title: "第1集", url: "播放URL" }, ...]<br>
&nbsp;&nbsp;&nbsp;&nbsp;]<br>
}</font></small></p>

<p><b>富文本：</b> 用 <font color="#C678DD"><b>\u2018\u2018\u2019\u2019</b></font>（即''''）包裹：</p>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">result.detail1 = "\u2018\u2018\u2019\u2019&lt;font color=\"#006699\"&gt;导演：xxx&lt;/font&gt;";</font></small></p>

<p><b>line 和 list 长度必须一致</b>，不足补空数组。</p>

<p><b>直播源二级：</b> 每个播放源构建为独立线路，每条线路含1个选集：</p>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">二级: function(url) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;var result = createDetailResult();<br>
&nbsp;&nbsp;&nbsp;&nbsp;var resolved = this._resolvePlayUrls(url);<br>
&nbsp;&nbsp;&nbsp;&nbsp;if (resolved.urls.length > 0) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;for (var i = 0; i < resolved.urls.length; i++) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;result.line.push(resolved.names[i] || ("线路" + (i + 1)));<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;result.list.push([{ title: "播放", url: resolved.urls[i] }]);<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>
&nbsp;&nbsp;&nbsp;&nbsp;}<br>
&nbsp;&nbsp;&nbsp;&nbsp;return result;<br>
}</font></small></p>

<h3>解析(url)</h3>

<p>将播放页URL解析为可播放地址。</p>

<p><b>返回字符串：</b></p>
<ul>
<li>直链：<font color="#C678DD"><b>"video://https://xxx.m3u8"</b></font></li>
<li>嗅探：<font color="#C678DD"><b>"x5Rule://..."</b></font></li>
<li>原链接：<font color="#C678DD"><b>url + "#isVideo=true#"</b></font></li>
<li>失败：空字符串</li>
</ul>

<p><b>返回对象（带headers）：</b>当m3u8/TS分段需要Referer等请求头时，必须返回对象：</p>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">解析: function(url) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;var playHeaders = { "Referer": this.host + "/", "User-Agent": this.UA };<br>
&nbsp;&nbsp;&nbsp;&nbsp;return { urls: [m3u8Url], headers: [playHeaders] };<br>
}</font></small></p>

<p>系统自动处理：URL匹配<font color="#C678DD"><b>.m3u8</b></font>时添加<font color="#C678DD"><b>#isVideo=true#</b></font>，headers传递给播放器用于m3u8和TS分段请求。</p>

<hr>

<h2>六、框架自动注入</h2>

<p>含 <font color="#C678DD"><b>host</b></font> 的规则自动注入以下方法（已自定义则不覆盖）：</p>

<h3>this.fixUrl(url)</h3>

<p>URL补全：</p>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">this.fixUrl("/vod/123.html")<br>
// → "https://www.example.com/vod/123.html"<br>
<br>
this.fixUrl("//img.xxx.com/pic.jpg")<br>
// → "https://img.xxx.com/pic.jpg"</font></small></p>

<h3>this.fetchHtml(url)</h3>

<p>带UA和Referer的请求，支持海阔原生请求参数：</p>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">var html = this.fetchHtml("https://www.example.com/vod/123.html");<br>
<br>
var html = this.fetchHtml(url, { "User-Agent": PC_UA });<br>
<br>
var resp = this.fetchHtml(url, { withHeaders: true });<br>
var r = JSON.parse(resp);<br>
var body = r.body;<br>
var headers = r.headers;  // 每个key对应array<br>
<br>
var resp = this.fetchHtml(url, { onlyHeaders: true });<br>
<br>
var resp = this.fetchHtml(url, { withStatusCode: true });<br>
var r = JSON.parse(resp);<br>
var statusCode = r.statusCode;</font></small></p>

<h3>运行时全局变量</h3>

<p>规则代码执行时自动注入以下全局变量和函数，可直接使用：</p>

<p><b>请求相关：</b></p>

<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;">
<tr style="background:#f0f0f0;"><td><b>变量/函数</b></td><td><b>说明</b></td></tr>
<tr><td><font color="#C678DD"><b>fetch(url, opts)</b></font></td><td>海阔原生请求，opts支持 headers/body/method/timeout/withHeaders/withStatusCode/onlyHeaders/webView</td></tr>
<tr><td><font color="#C678DD"><b>request(url, opts)</b></font></td><td>等同于 <font color="#C678DD"><b>fetch(url, opts)</b></font></td></tr>
<tr><td><font color="#C678DD"><b>post(url, opts)</b></font></td><td>POST 请求，自动设置 method</td></tr>
<tr><td><font color="#C678DD"><b>req(url, opts)</b></font></td><td>增强请求，支持 <font color="#C678DD"><b>withHeaders</b></font>、<font color="#C678DD"><b>withStatusCode</b></font>、<font color="#C678DD"><b>data→body</b></font> 转换，返回 <font color="#C678DD"><b>{content, headers, statusCode?}</b></font></td></tr>
<tr><td><font color="#C678DD"><b>MOBILE_UA / PC_UA</b></font></td><td>海阔原生内置 User-Agent 常量，规则中直接引用不要硬编码</td></tr>
<tr><td><font color="#C678DD"><b>UC_UA / IOS_UA</b></font></td><td>框架shim注入 User-Agent 常量</td></tr>
<tr><td><font color="#C678DD"><b>fetchPC(url, opts) / postPC(url, opts)</b></font></td><td>使用 PC_UA 发起请求（等同于海阔原生 fetchPC/postPC）</td></tr>
<tr><td><font color="#C678DD"><b>buildUrl(url, params)</b></font></td><td>GET 参数拼接</td></tr>
<tr><td><font color="#C678DD"><b>fetchCookie(url, opts)</b></font></td><td>获取响应 Set-Cookie（内部使用withHeaders）</td></tr>
<tr><td><font color="#C678DD"><b>getCookie(url)</b></font></td><td>获取指定 URL 的 Cookie（海阔原生兼容，内部使用withHeaders）</td></tr>
<tr><td><font color="#C678DD"><b>batchFetch(tasks)</b></font></td><td>批量请求（海阔原生为并发，兼容环境为顺序）</td></tr>
</table>

<p><b>海阔原生fetch参数：</b></p>

<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;">
<tr style="background:#f0f0f0;"><td><b>参数</b></td><td><b>说明</b></td><td><b>示例</b></td></tr>
<tr><td><font color="#C678DD"><b>withHeaders:true</b></font></td><td>获取响应header，返回JSON字符串 <font color="#C678DD"><b>{body, headers}</b></font>，headers中每个key对应array</td><td><font color="#C678DD"><b>var r = JSON.parse(fetch(url, {withHeaders:true})); r.body; r.headers['Set-Cookie']</b></font></td></tr>
<tr><td><font color="#C678DD"><b>onlyHeaders:true</b></font></td><td>只获取header不获取body</td><td><font color="#C678DD"><b>fetch(url, {onlyHeaders:true})</b></font></td></tr>
<tr><td><font color="#C678DD"><b>withStatusCode:true</b></font></td><td>获取状态码，返回 <font color="#C678DD"><b>{body, headers, statusCode}</b></font></td><td><font color="#C678DD"><b>var r = JSON.parse(fetch(url, {withStatusCode:true})); r.statusCode</b></font></td></tr>
<tr><td><font color="#C678DD"><b>webView:true</b></font></td><td>使用WebView加载页面</td><td><font color="#C678DD"><b>fetch(url, {webView:true})</b></font></td></tr>
</table>

<p><b>URL 处理：</b></p>

<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;">
<tr style="background:#f0f0f0;"><td><b>函数</b></td><td><b>说明</b></td></tr>
<tr><td><font color="#C678DD"><b>urljoin(from, to)</b></font> / <font color="#C678DD"><b>urljoin2</b></font></td><td>智能相对路径拼接，支持同级目录</td></tr>
<tr><td><font color="#C678DD"><b>getHome(url)</b></font></td><td>提取根域名，如 <font color="#C678DD"><b>https://xxx.com</b></font></td></tr>
<tr><td><font color="#C678DD"><b>getQuery(url)</b></font></td><td>解析 URL query 为对象</td></tr>
<tr><td><font color="#C678DD"><b>getParam(key, default)</b></font></td><td>获取当前页面 MY_URL 中的参数值</td></tr>
<tr><td><font color="#C678DD"><b>urlencode(str)</b></font></td><td>URL 编码（<font color="#C678DD"><b>+</b></font> 替换空格）</td></tr>
</table>

<p><b>数据解析：</b></p>

<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;">
<tr style="background:#f0f0f0;"><td><b>函数</b></td><td><b>说明</b></td></tr>
<tr><td><font color="#C678DD"><b>dealJson(html)</b></font></td><td>从脏 HTML 中提取并解析 JSON</td></tr>
<tr><td><font color="#C678DD"><b>base64Encode(text) / base64Decode(text)</b></font></td><td>Base64 编解码</td></tr>
<tr><td><font color="#C678DD"><b>md5(text)</b></font></td><td>MD5 哈希</td></tr>
<tr><td><font color="#C678DD"><b>aesEncode(key, text) / aesDecode(key, text)</b></font></td><td>AES-CBC 加解密</td></tr>
<tr><td><font color="#C678DD"><b>aesEncodeJava(key, text) / aesDecodeJava(key, text)</b></font></td><td>Java 层 AES-CBC 加解密（PKCS7Padding）</td></tr>
<tr><td><font color="#C678DD"><b>rsaEncrypt(data, key, options)</b></font></td><td>RSA 加密（海阔原生），type=1 公钥加密，type=2 私钥加密</td></tr>
<tr><td><font color="#C678DD"><b>rsaDecrypt(data, key, options)</b></font></td><td>RSA 解密（海阔原生），type=1 私钥解密，type=2 公钥解密</td></tr>
<tr><td><font color="#C678DD"><b>getCryptoJS()</b></font></td><td>加载 CryptoJS（空实现兼容）</td></tr>
</table>

<p><b>高级工具函数：</b></p>

<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;">
<tr style="background:#f0f0f0;"><td><b>函数</b></td><td><b>说明</b></td></tr>
<tr><td><font color="#C678DD"><b>aesEncrypt(key, text)</b></font></td><td>AES-CBC 加密（Base64输出），key 为 UTF8 编码，IV = key</td></tr>
<tr><td><font color="#C678DD"><b>aesDecrypt(key, text)</b></font></td><td>AES-CBC 解密（Base64输入），key 为 UTF8 编码，IV = key</td></tr>
<tr><td><font color="#C678DD"><b>fetchJson(url, opts)</b></font></td><td>请求并解析 JSON，失败返回 null</td></tr>
<tr><td><font color="#C678DD"><b>fetchPost(url, body, opts)</b></font></td><td>POST 请求，body 为对象时自动 JSON.stringify</td></tr>
<tr><td><font color="#C678DD"><b>detectHost(url, id)</b></font></td><td>自动检测 API 地址：url 为 .json/.txt 时自动请求获取真实 host，结果缓存</td></tr>
<tr><td><font color="#C678DD"><b>themeColor(type, content)</b></font></td><td>主题色工具：type="background" 透明背景色，type="strong" 高亮加粗，其他为加粗</td></tr>
</table>

<p><b>规则配置字段：</b></p>

<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;">
<tr style="background:#f0f0f0;"><td><b>字段</b></td><td><b>说明</b></td></tr>
<tr><td><font color="#C678DD"><b>配置</b></font></td><td>配置对象，支持 host（自动检测 .json/.txt）、de_key（加密密钥）、headers 等。框架自动处理 host 检测和密钥注入</td></tr>
<tr><td><font color="#C678DD"><b>init()</b></font></td><td>初始化钩子函数，loadParse 编译成功后自动调用，用于预计算、变量初始化等</td></tr>
<tr><td><font color="#C678DD"><b>频道</b></font></td><td>频道/标签配置，格式同聚閲模板</td></tr>
<tr><td><font color="#C678DD"><b>页码</b></font></td><td>页码配置</td></tr>
<tr><td><font color="#C678DD"><b>界面</b></font></td><td>UI 配置</td></tr>
</table>

<p><b>验证与认证：</b></p>

<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;">
<tr style="background:#f0f0f0;"><td><b>函数</b></td><td><b>说明</b></td></tr>
<tr><td><font color="#C678DD"><b>generateUUID()</b></font></td><td>生成随机 UUID（v4 格式）</td></tr>
<tr><td><font color="#C678DD"><b>getFastestUrl(urls, timeout)</b></font></td><td>多域名测速，返回最快 URL</td></tr>
<tr><td><font color="#C678DD"><b>fetchWithCaptcha(url, opts, captchaCfg)</b></font></td><td>带验证码自动 OCR 识别重试的请求</td></tr>
<tr><td><font color="#C678DD"><b>authToken(cfg)</b></font></td><td>获取/缓存认证 Token</td></tr>
<tr><td><font color="#C678DD"><b>fetchWithAuth(url, opts, authCfg)</b></font></td><td>带 Token 自动附加的请求</td></tr>
<tr><td><font color="#C678DD"><b>isCFChallenge(html)</b></font></td><td>检测是否为 Cloudflare 验证页面</td></tr>
<tr><td><font color="#C678DD"><b>isVerifyPage(html)</b></font></td><td>统一验证页检测（CF + 安全验证 + 防火墙）</td></tr>
<tr><td><font color="#C678DD"><b>fetchCF(url, opts)</b></font></td><td>自动过 CF 验证（Cookie缓存→X5 WebView）</td></tr>
<tr><td><font color="#C678DD"><b>fetchHtmlCF(url, opts)</b></font></td><td>fetchHtml 增强（等同于 fetchHtml，已内置验证检测）</td></tr>
<tr><td><font color="#C678DD"><b>getCFCookie(host, opts)</b></font></td><td>获取缓存的 CF Cookie</td></tr>
<tr><td><font color="#C678DD"><b>setCFCookie(host, cookie)</b></font></td><td>手动设置 CF Cookie 缓存</td></tr>
</table>

<p><b>存储：</b></p>

<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;">
<tr style="background:#f0f0f0;"><td><b>函数</b></td><td><b>说明</b></td></tr>
<tr><td><font color="#C678DD"><b>local.set(rk, k, v) / local.get(rk, k, v) / local.delete(rk, k)</b></font></td><td>规则级隔离存储</td></tr>
<tr><td><font color="#C678DD"><b>getItem(k, v) / setItem(k, v) / clearItem(k)</b></font></td><td>全局存储</td></tr>
<tr><td><font color="#C678DD"><b>storage0.putMyVar(k, v) / storage0.getMyVar(k, dv)</b></font></td><td>支持 JSON 对象的存储</td></tr>
</table>

<p><b>播放相关：</b></p>

<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;">
<tr style="background:#f0f0f0;"><td><b>函数</b></td><td><b>说明</b></td></tr>
<tr><td><font color="#C678DD"><b>fixAdM3u8(text, url, adRemove)</b></font></td><td>m3u8 广告切片去除，<font color="#C678DD"><b>adRemove</b></font> 支持 <font color="#C678DD"><b>reg:</b></font> 和 <font color="#C678DD"><b>js:</b></font> 前缀</td></tr>
<tr><td><font color="#C678DD"><b>forceOrder(lists, key, option)</b></font></td><td>强制正序排列选集列表</td></tr>
<tr><td><font color="#C678DD"><b>isDirectVideo(url)</b></font></td><td>检测是否为直链视频（.m3u8/.flv/.mp4）</td></tr>
<tr><td><font color="#C678DD"><b>createPlaylist(urls, names, headers)</b></font></td><td>构建多线路播放JSON（兼容海阔原生 <font color="#C678DD"><b>{urls,names,headers}</b></font> 格式）</td></tr>
</table>

<p><b>UI 相关：</b></p>

<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;">
<tr style="background:#f0f0f0;"><td><b>函数</b></td><td><b>说明</b></td></tr>
<tr><td><font color="#C678DD"><b>randomColor()</b></font></td><td>生成随机十六进制颜色值</td></tr>
<tr><td><font color="#C678DD"><b>buildCompositeCard(data, layout)</b></font></td><td>通过布局配置生成复合卡片</td></tr>
</table>

<p><b>兼容变量：</b></p>

<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;">
<tr style="background:#f0f0f0;"><td><b>变量</b></td><td><b>说明</b></td></tr>
<tr><td><font color="#C678DD"><b>MY_URL</b></font></td><td>当前请求地址</td></tr>
<tr><td><font color="#C678DD"><b>MY_PAGE / page</b></font></td><td>当前页码</td></tr>
<tr><td><font color="#C678DD"><b>KEY / RKEY</b></font></td><td>规则标识</td></tr>
<tr><td><font color="#C678DD"><b>HOST</b></font></td><td>等同于 MY_URL</td></tr>
<tr><td><font color="#C678DD"><b>MY_RULE</b></font></td><td>当前规则对象</td></tr>
<tr><td><font color="#C678DD"><b>VODS / VOD / TABS / LISTS</b></font></td><td>标准全局变量</td></tr>
<tr><td><font color="#C678DD"><b>setResult(d) / setHomeResult(d) / setSearchResult(d) / setResult2(res)</b></font></td><td>结果返回函数</td></tr>
</table>

<p><b>Polyfill（自动补丁）：</b></p>

<p><font color="#C678DD"><b>Object.assign</b></font>、<font color="#C678DD"><b>String.prototype.includes</b></font>、<font color="#C678DD"><b>Array.prototype.includes</b></font>、<font color="#C678DD"><b>String.prototype.startsWith</b></font>、<font color="#C678DD"><b>String.prototype.endsWith</b></font>、<font color="#C678DD"><b>String.prototype.trim</b></font></p>

<h3>QD 框架工具函数</h3>

<p>规则代码中可通过 <font color="#C678DD"><b>QD.xxx</b></font> 调用：</p>

<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;">
<tr style="background:#f0f0f0;"><td><b>函数</b></td><td><b>说明</b></td></tr>
<tr><td><font color="#C678DD"><b>QD.MOBILE_UA / QD.PC_UA / QD.UC_UA / QD.IOS_UA</b></font></td><td>UA 常量</td></tr>
<tr><td><font color="#C678DD"><b>QD.getHome(url)</b></font></td><td>提取根域名</td></tr>
<tr><td><font color="#C678DD"><b>QD.urljoin(from, to)</b></font></td><td>智能路径拼接</td></tr>
<tr><td><font color="#C678DD"><b>QD.getQuery(url)</b></font></td><td>URL 参数解析为对象</td></tr>
<tr><td><font color="#C678DD"><b>QD.dealJson(html)</b></font></td><td>脏 JSON 提取解析</td></tr>
<tr><td><font color="#C678DD"><b>QD.buildUrl(url, params)</b></font></td><td>URL 参数拼接</td></tr>
<tr><td><font color="#C678DD"><b>QD.getParam(url, key, default)</b></font></td><td>从 URL 提取参数</td></tr>
<tr><td><font color="#C678DD"><b>QD.safeParse(str, fallback)</b></font></td><td>安全 JSON 解析</td></tr>
<tr><td><font color="#C678DD"><b>QD.safeStringify(obj)</b></font></td><td>安全 JSON 序列化</td></tr>
<tr><td><font color="#C678DD"><b>QD.urlencode(str)</b></font></td><td>URL 编码</td></tr>
<tr><td><font color="#C678DD"><b>QD.forceOrder(lists, key, option)</b></font></td><td>强制正序</td></tr>
<tr><td><font color="#C678DD"><b>QD.fixAdM3u8(text, url, adRemove)</b></font></td><td>m3u8 去广告</td></tr>
<tr><td><font color="#C678DD"><b>QD.batchFetch(tasks)</b></font></td><td>批量请求</td></tr>
<tr><td><font color="#C678DD"><b>QD.fetchCookie(url, opts)</b></font></td><td>获取 Cookie</td></tr>
<tr><td><font color="#C678DD"><b>QD.safePdfa(html, selector)</b></font></td><td>安全 pdfa（异常返回空数组）</td></tr>
<tr><td><font color="#C678DD"><b>QD.safePdfh(html, selector)</b></font></td><td>安全 pdfh（异常返回空字符串）</td></tr>
<tr><td><font color="#C678DD"><b>QD.safePd(html, selector, host)</b></font></td><td>安全 pd（异常返回空字符串）</td></tr>
<tr><td><font color="#C678DD"><b>QD.isDirectVideo(url)</b></font></td><td>检测是否为直链视频</td></tr>
<tr><td><font color="#C678DD"><b>QD.randomColor()</b></font></td><td>生成随机颜色</td></tr>
<tr><td><font color="#C678DD"><b>QD.playWithFeedback(cardId, tempTitle, originalTitle, delay)</b></font></td><td>播放点击反馈：临时更新标题→定时恢复</td></tr>
<tr><td><font color="#C678DD"><b>QD.buildCompositeCard(data, layout)</b></font></td><td>通过布局配置生成复合卡片</td></tr>
<tr><td><font color="#C678DD"><b>QD.createPlaylist(urls, names, headers)</b></font></td><td>构建多线路播放JSON（兼容海阔原生格式，支持 headers）</td></tr>
<tr><td><font color="#C678DD"><b>QD.generateUUID()</b></font></td><td>生成随机 UUID（v4 格式），用于验证码等场景</td></tr>
<tr><td><font color="#C678DD"><b>QD.getFastestUrl(urls, timeout)</b></font></td><td>多域名测速，返回响应最快的 URL；<font color="#C678DD"><b>timeout</b></font> 默认 2000ms</td></tr>
<tr><td><font color="#C678DD"><b>QD.fetchWithCaptcha(url, opts, captchaCfg)</b></font></td><td>带验证码自动识别的请求，详见下方说明</td></tr>
<tr><td><font color="#C678DD"><b>QD.authToken(cfg)</b></font></td><td>获取/缓存认证 Token，详见下方说明</td></tr>
<tr><td><font color="#C678DD"><b>QD.fetchWithAuth(url, opts, authCfg)</b></font></td><td>带 Token 自动附加的请求，详见下方说明</td></tr>
<tr><td><font color="#C678DD"><b>QD.aesEncodeJava(key, plaintext)</b></font></td><td>Java 层 AES-CBC 加密（PKCS7Padding），性能优于 CryptoJS 版</td></tr>
<tr><td><font color="#C678DD"><b>QD.aesDecodeJava(key, ciphertext)</b></font></td><td>Java 层 AES-CBC 解密（PKCS7Padding）</td></tr>
<tr><td><font color="#C678DD"><b>QD.isCFChallenge(html)</b></font></td><td>检测是否为 Cloudflare 验证页面</td></tr>
<tr><td><font color="#C678DD"><b>QD.isVerifyPage(html)</b></font></td><td>统一验证页检测（CF + 安全验证 + 防火墙拦截）</td></tr>
<tr><td><font color="#C678DD"><b>QD.fetchCF(url, opts)</b></font></td><td>自动过 CF 验证，详见下方说明</td></tr>
<tr><td><font color="#C678DD"><b>QD.fetchHtmlCF(url, opts)</b></font></td><td>fetchHtml 增强，遇 CF 自动切换 fetchCF</td></tr>
<tr><td><font color="#C678DD"><b>QD.getCFCookie(host, opts)</b></font></td><td>获取缓存的 CF Cookie</td></tr>
<tr><td><font color="#C678DD"><b>QD.setCFCookie(host, cookie)</b></font></td><td>手动设置 CF Cookie 缓存</td></tr>
</table>

<h3>验证码自动识别（fetchWithCaptcha）</h3>

<p>当请求返回验证码拦截时，自动 OCR 识别并重试。支持加密请求体自动解密→注入验证码→重新加密。</p>

<p><b>captchaCfg 参数：</b></p>

<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;">
<tr style="background:#f0f0f0;"><td><b>字段</b></td><td><b>类型</b></td><td><b>默认值</b></td><td><b>说明</b></td></tr>
<tr><td>triggerPattern</td><td>RegExp | string</td><td><font color="#999">/验证码不正确|验证码错误/i</font></td><td>触发验证码重试的匹配模式</td></tr>
<tr><td>verifyPath</td><td>string</td><td>''</td><td>验证码图片路径模板，<font color="#C678DD"><b>{key}</b></font> 替换为 UUID；留空则自动推断</td></tr>
<tr><td>host</td><td>string</td><td>自动提取</td><td>站点根地址</td></tr>
<tr><td>aesKey</td><td>string</td><td>''</td><td>加密请求体时使用的 AES 密钥</td></tr>
</table>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">var html = QD.fetchWithCaptcha(url, { body: "data=" + encryptedBody }, {<br>
&nbsp;&nbsp;&nbsp;&nbsp;triggerPattern: "验证码不正确",<br>
&nbsp;&nbsp;&nbsp;&nbsp;verifyPath: "/api.php/app.verify/create?key={key}",<br>
&nbsp;&nbsp;&nbsp;&nbsp;aesKey: "myAesKey12345678"<br>
});</font></small></p>

<p><b>自动验证检测：</b><font color="#C678DD"><b>fetchHtml</b></font> 已内置自动验证检测，无需配置 <font color="#C678DD"><b>isVerify</b></font>。当请求返回 CF 验证页、安全验证页或防火墙拦截页时，框架自动调用 <font color="#C678DD"><b>fetchCF</b></font> 重试。若规则配置了 <font color="#C678DD"><b>captchaCfg</b></font>，API 验证码也会自动调用 <font color="#C678DD"><b>fetchWithCaptcha</b></font> 处理。</p>

<p><b>isVerifyPage(html)：</b>统一验证页检测函数，自动识别以下类型：</p>
<ul>
<li>Cloudflare 验证（Just a moment / Checking your browser）</li>
<li>安全验证 / 人机验证页面</li>
<li>API 验证码拦截（验证码不正确 / 验证码错误）</li>
<li>防火墙/拦截页面（blocked / denied / forbidden）</li>
</ul>

<h3>Token 认证（authToken / fetchWithAuth）</h3>

<p>自动登录获取 Token 并缓存，后续请求自动附加到 Header。</p>

<p><b>authCfg 参数：</b></p>

<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;">
<tr style="background:#f0f0f0;"><td><b>字段</b></td><td><b>类型</b></td><td><b>默认值</b></td><td><b>说明</b></td></tr>
<tr><td>storeKey</td><td>string</td><td>''</td><td>缓存键名，设置后 Token 自动持久化</td></tr>
<tr><td>loginUrl</td><td>string</td><td>''</td><td>登录接口路径（相对或绝对）</td></tr>
<tr><td>username</td><td>string</td><td>''</td><td>用户名</td></tr>
<tr><td>password</td><td>string</td><td>''</td><td>密码</td></tr>
<tr><td>host</td><td>string</td><td>''</td><td>站点根地址</td></tr>
<tr><td>usernameField</td><td>string</td><td>'user_name'</td><td>登录请求体中用户名字段名</td></tr>
<tr><td>passwordField</td><td>string</td><td>'password'</td><td>登录请求体中密码字段名</td></tr>
<tr><td>tokenField</td><td>string</td><td>'auth_token'</td><td>响应中 Token 字段路径</td></tr>
<tr><td>tokenHeader</td><td>string</td><td>'app-user-token'</td><td>请求头中 Token 字段名</td></tr>
<tr><td>headers</td><td>object</td><td>{}</td><td>登录请求额外 Header</td></tr>
<tr><td>loginBody</td><td>object</td><td>{}</td><td>登录请求体额外字段</td></tr>
</table>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">var html = QD.fetchWithAuth(url, { method: "POST", body: body }, {<br>
&nbsp;&nbsp;&nbsp;&nbsp;storeKey: "mySource",<br>
&nbsp;&nbsp;&nbsp;&nbsp;loginUrl: "/api.php/app.index/appLogin",<br>
&nbsp;&nbsp;&nbsp;&nbsp;username: "user1",<br>
&nbsp;&nbsp;&nbsp;&nbsp;password: "pass1",<br>
&nbsp;&nbsp;&nbsp;&nbsp;host: "https://example.com"<br>
});</font></small></p>

<h3>多域名测速（getFastestUrl）</h3>

<p>从多个备选域名中测速选出响应最快的，适用于多线路源自动切换。</p>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">var urls = ["https://a.example.com", "https://b.example.com", "https://c.example.com"];<br>
var best = QD.getFastestUrl(urls, 3000);</font></small></p>

<h3>Java 层 AES 加解密</h3>

<p>通过 <font color="#C678DD"><b>crypto-java.js</b></font> 使用 Java 原生加密，比 CryptoJS 性能更好。接口与 <font color="#C678DD"><b>aesEncode / aesDecode</b></font> 一致，key 同时作为 IV。</p>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">var encrypted = QD.aesEncodeJava("1234567890abcdef", "明文内容");<br>
var decrypted = QD.aesDecodeJava("1234567890abcdef", encrypted);</font></small></p>

<h3>Cloudflare 验证自动过（fetchCF）</h3>

<p>许多视频网站使用 Cloudflare 防护，首次访问会弹出"Just a moment..."验证页。<font color="#C678DD"><b>fetchCF</b></font> 自动处理此流程：</p>

<p><b>处理策略（按优先级）：</b></p>
<ol>
<li><b>Cookie 缓存</b>：优先使用已缓存的 <font color="#C678DD"><b>cf_clearance</b></font> Cookie（默认缓存 30 分钟）</li>
<li><b>withHeaders 请求</b>：尝试直接请求并提取 Set-Cookie</li>
<li><b>X5 WebView</b>：加载页面等待 CF JS 挑战自动完成，提取 Cookie + 页面内容</li>
<li><b>webView 降级</b>：X5 失败时尝试 webView 模式</li>
</ol>

<p><b>opts 参数：</b></p>

<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;">
<tr style="background:#f0f0f0;"><td><b>字段</b></td><td><b>类型</b></td><td><b>默认值</b></td><td><b>说明</b></td></tr>
<tr><td>cfTimeout</td><td>number</td><td>15000</td><td>X5 WebView 等待 CF 验证超时时间（ms）</td></tr>
<tr><td>ttl</td><td>number</td><td>1800000</td><td>Cookie 缓存有效期（ms），默认 30 分钟</td></tr>
<tr><td>headers</td><td>object</td><td>{}</td><td>请求头，可指定 UA</td></tr>
</table>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">var html = QD.fetchCF("https://cf-protected-site.com", {<br>
&nbsp;&nbsp;&nbsp;&nbsp;cfTimeout: 20000,<br>
&nbsp;&nbsp;&nbsp;&nbsp;headers: { "User-Agent": QD.PC_UA }<br>
});<br><br>
var html = QD.fetchHtmlCF("https://cf-protected-site.com");</font></small></p>

<p><b>自动验证检测：</b><font color="#C678DD"><b>fetchHtml</b></font> 已内置 CF 验证自动检测，遇到验证页自动调用 <font color="#C678DD"><b>fetchCF</b></font> 重试，无需手动配置。</p>

<p><b>手动 Cookie 管理：</b></p>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">QD.setCFCookie("https://example.com", "cf_clearance=xxx; key=yyy");<br>
var cookie = QD.getCFCookie("https://example.com");</font></small></p>

<h3>方法名自动映射</h3>

<p>如果规则使用标准方法名（<font color="#C678DD"><b>home</b></font>/<font color="#C678DD"><b>category</b></font>/<font color="#C678DD"><b>detail</b></font>/<font color="#C678DD"><b>play</b></font>/<font color="#C678DD"><b>search</b></font>）而非青豆接口名（<font color="#C678DD"><b>主页</b></font>/<font color="#C678DD"><b>分类</b></font>/<font color="#C678DD"><b>二级</b></font>/<font color="#C678DD"><b>解析</b></font>/<font color="#C678DD"><b>搜索</b></font>），框架会自动映射，无需手动转换。也支持 <font color="#C678DD"><b>__jsEvalReturn()</b></font> 导出模式。</p>

<h3>返回结果：return list（青豆框架） vs setResult(d)（海阔原生 js: 格式）</h3>

<p>★ <b>这是 AI 写源最容易踩的坑：</b>两种写法只能二选一，混用会导致「列表不出数据」。
规则最终都要把 <font color="#C678DD"><b>{title, url, img/pic_url, desc}</b></font> 数组交给 App 渲染，
但提交方式取决于你用的是哪种框架：</p>

<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;">
<tr style="background:#f0f0f0;"><td><b>写法</b></td><td><b>适用格式</b></td><td><b>首页/列表</b></td><td><b>搜索</b></td><td><b>二级详情</b></td></tr>
<tr><td><font color="#C678DD"><b>return list</b></font></td><td><font color="#C678DD"><b>var Rule = {…}</b></font> 青豆/DrPy 框架（本指南主推）</td><td><font color="#C678DD"><b>主页/分类</b></font> 函数 <font color="#C678DD"><b>return d</b></font></td><td><font color="#C678DD"><b>搜索</b></font> 函数 <font color="#C678DD"><b>return d</b></font></td><td><font color="#C678DD"><b>二级</b></font> 函数 <font color="#C678DD"><b>return result</b></font></td></tr>
<tr><td><font color="#C678DD"><b>setResult(d)</b></font></td><td><font color="#C678DD"><b>js:</b></font> 开头的海阔原生 find_rule / searchfind</td><td>代码末尾 <font color="#C678DD"><b>setResult(d)</b></font></td><td>代码末尾 <font color="#C678DD"><b>setResult(d)</b></font></td><td><font color="#C678DD"><b>setResult(result)</b></font>（或由列表项 extra 规则驱动）</td></tr>
</table>

<p><b>规则一（框架风格）：</b>用 <font color="#C678DD"><b>var Rule = { 主页: function(){…} }</b></font> 写源时，
方法体内 <font color="#C678DD"><b>直接 return 数组</b></font>，<font color="red"><b>不要调用 setResult(d)</b></font>——框架会自动把返回值提交给 App，调用 setResult 反而冲突。</p>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">var Rule = {<br>
&nbsp;&nbsp;&nbsp;&nbsp;主页: function(page, categoryId) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;var d = [];<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;d.push({ title: "片名", url: "https://…/1.html", img: "https://…/1.jpg", desc: "更新至10集" });<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return d; &nbsp;// ★ 框架风格：return 即可，不调 setResult<br>
&nbsp;&nbsp;&nbsp;&nbsp;}<br>
};</font></small></p>

<p><b>规则二（原生 js: 风格）：</b>在 <font color="#C678DD"><b>find_rule</b></font>/<font color="#C678DD"><b>searchfind</b></font> 里直接写
<font color="#C678DD"><b>js:</b></font> 开头的代码时，结尾<b>必须</b>调用 <font color="#C678DD"><b>setResult(d)</b></font> 提交结果，
<font color="red"><b>写 return d 无效</b></font>（整段代码是被 eval 执行的，return 不会把数据交给 App）。</p>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">// 原生格式（海阔视界 App 的 find_rule 直接存这类代码）<br>
js: var d = [];<br>
d.push({ title: "片名", url: "https://…/1.html", img: "https://…/1.jpg", desc: "更新至10集", col_type: "movie_3" });<br>
setResult(d); &nbsp;// ★ 原生格式：必须 setResult 提交，return 无效</font></small></p>

<p><b>规则三（分页/首页无刷新翻页）：</b>原生 <font color="#C678DD"><b>js:</b></font> 格式带分页时，
URL 里要有 <font color="#C678DD"><b>fypage</b></font> 参数，并可用 <font color="#C678DD"><b>setResult({data: d})</b></font> 包裹结果
（<font color="#C678DD"><b>data</b></font> 键装数组），App 会自动处理下拉翻页。
旧接口 <font color="#C678DD"><b>setHomeResult(d) / setSearchResult(d)</b></font> 已被弃用，新代码统一用
<font color="#C678DD"><b>setResult(d)</b></font>（首页/搜索/二级通用）。</p>

<p><b>规则四（真实源实证）：</b>对 361 条真实规则统计分析，
<font color="#C678DD"><b>74 条</b></font> 的 find_rule/searchfind 以 <font color="#C678DD"><b>setResult(d)</b></font> 结尾提交结果。
风格选择建议：</p>

<ul>
<li>写 <b>单条完整规则</b>（主页+搜索+二级+解析全能）→ 用 <font color="#C678DD"><b>var Rule</b></font> 框架，方法体 <font color="#C678DD"><b>return d</b></font></li>
<li>写 <b>轻量 js: 入口</b>（极简源、让子页面模块 <font color="#C678DD"><b>$.require</b></font> 干活）→ 用 <font color="#C678DD"><b>js:</b></font> + <font color="#C678DD"><b>setResult(d)</b></font></li>
<li>两种风格都要求列表项字段：<font color="#C678DD"><b>title</b></font>（标题）、<font color="#C678DD"><b>url</b></font>（详情页/播放地址）、<font color="#C678DD"><b>img/pic_url</b></font>（封面）、<font color="#C678DD"><b>desc</b></font>（备注），缺 url 的项不会产生点击跳转</li>
</ul>

<hr>

<h2>七、规则类型</h2>

<h3>主页源</h3>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">var Rule = {<br>
&nbsp;&nbsp;&nbsp;&nbsp;名称: "示例影视",<br>
&nbsp;&nbsp;&nbsp;&nbsp;类型: "主页源",<br>
&nbsp;&nbsp;&nbsp;&nbsp;host: "https://www.example.com",<br>
&nbsp;&nbsp;&nbsp;&nbsp;分类: { class_name: "电影&电视剧", class_url: "1&2", url: "..." },<br>
&nbsp;&nbsp;&nbsp;&nbsp;主页: function(page, categoryId) { ... },<br>
&nbsp;&nbsp;&nbsp;&nbsp;搜索: function(keyword, page) { ... },<br>
&nbsp;&nbsp;&nbsp;&nbsp;二级: function(url) { ... },<br>
&nbsp;&nbsp;&nbsp;&nbsp;解析: function(url) { ... }<br>
};</font></small></p>

<h3>搜索源</h3>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">var Rule = {<br>
&nbsp;&nbsp;&nbsp;&nbsp;名称: "盘搜",<br>
&nbsp;&nbsp;&nbsp;&nbsp;类型: "搜索源",<br>
&nbsp;&nbsp;&nbsp;&nbsp;主页: "",<br>
&nbsp;&nbsp;&nbsp;&nbsp;搜索: function(keyword, page) { ... },<br>
&nbsp;&nbsp;&nbsp;&nbsp;二级: function(url) { ... },<br>
&nbsp;&nbsp;&nbsp;&nbsp;解析: "",<br>
&nbsp;&nbsp;&nbsp;&nbsp;分类: ""<br>
};</font></small></p>

<h3>直播源</h3>

<p>直播源类型 <font color="#C678DD"><b>类型: "直播源"</b></font> 或 <font color="#C678DD"><b>playType: "live"</b></font>，框架自动优化：</p>

<ul>
<li>列表页 <font color="#C678DD"><b>col_type</b></font> 自动设为 <font color="#C678DD"><b>movie_2</b></font></li>
<li>点击直接播放，不进入二级详情页</li>
<li>多线路自动构建为 <font color="#C678DD"><b>{urls:[...],names:[...]}#isVideo=true#</b></font> 格式</li>
</ul>

<p><b>模式一：列表阶段已知播放链接</b></p>

<p>主页返回时附带 <font color="#C678DD"><b>playUrls</b></font>/<font color="#C678DD"><b>playNames</b></font>，框架自动构建直接播放URL：</p>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">var Rule = {<br>
&nbsp;&nbsp;&nbsp;&nbsp;名称: "咖啡直播",<br>
&nbsp;&nbsp;&nbsp;&nbsp;类型: "直播源",<br>
&nbsp;&nbsp;&nbsp;&nbsp;playType: "live",<br>
&nbsp;&nbsp;&nbsp;&nbsp;host: "https://kafeizhibo.com/api/v1/",<br>
&nbsp;&nbsp;&nbsp;&nbsp;分类: { class_name: "全部&足球&篮球", class_url: "all&1&2" },<br>
&nbsp;&nbsp;&nbsp;&nbsp;主页: function(page, categoryId) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;var d = [];<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;d.push({<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;vod_name: "比赛名称",<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;vod_pic: "",<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;vod_id: "123",<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;vod_remarks: "直播",<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;playUrls: ["https://xxx/live.m3u8"],<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;playNames: ["高清"]<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;});<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return d;<br>
&nbsp;&nbsp;&nbsp;&nbsp;},<br>
&nbsp;&nbsp;&nbsp;&nbsp;二级: function(url) { ... },<br>
&nbsp;&nbsp;&nbsp;&nbsp;解析: function(url) { return url; }<br>
};</font></small></p>

<p><b>模式二：列表阶段未知播放链接</b></p>

<p>主页返回标准格式，点击时框架自动调用 <font color="#C678DD"><b>二级</b></font>+<font color="#C678DD"><b>解析</b></font> 获取播放链接：</p>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">var Rule = {<br>
&nbsp;&nbsp;&nbsp;&nbsp;名称: "91电视",<br>
&nbsp;&nbsp;&nbsp;&nbsp;类型: "直播源",<br>
&nbsp;&nbsp;&nbsp;&nbsp;playType: "live",<br>
&nbsp;&nbsp;&nbsp;&nbsp;host: "http://sj.91kds.cn",<br>
&nbsp;&nbsp;&nbsp;&nbsp;分类: { class_name: "央视&卫视", class_url: "央视&卫视" },<br>
&nbsp;&nbsp;&nbsp;&nbsp;主页: function(page, categoryId) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;var d = [];<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;d.push({<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;vod_name: "CCTV-1",<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;vod_pic: "",<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;vod_id: "cctv1",<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;vod_remarks: "直播"<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;});<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return d;<br>
&nbsp;&nbsp;&nbsp;&nbsp;},<br>
&nbsp;&nbsp;&nbsp;&nbsp;二级: function(url) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;var result = createDetailResult();<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;var resolved = this._resolvePlayUrls(url);<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if (resolved.urls.length > 0) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;for (var i = 0; i < resolved.urls.length; i++) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;result.line.push(resolved.names[i] || ("线路" + (i + 1)));<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;result.list.push([{ title: "播放", url: resolved.urls[i] }]);<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return result;<br>
&nbsp;&nbsp;&nbsp;&nbsp;},<br>
&nbsp;&nbsp;&nbsp;&nbsp;解析: function(url) { return url; }<br>
};</font></small></p>

<p><b>多线路播放JSON格式：</b></p>

<p>视频链接使用JSON格式，框架和播放器自动识别：</p>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">JSON.stringify({urls:['http://xxx/1.mp4#isVideo=true#','http://xxx/2.mp4#isVideo=true#'],names:['超清','高清']})</font></small></p>

<hr>

<h2>八、选择器语法</h2>

<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;">
<tr style="background:#f0f0f0;"><td><b>语法</b></td><td><b>说明</b></td><td><b>示例</b></td></tr>
<tr><td><font color="#C678DD"><b>&&</b></font></td><td>级联</td><td><font color="#C678DD"><b>.box&&a&&title</b></font></td></tr>
<tr><td><font color="#C678DD"><b>||</b></font></td><td>或</td><td><font color="#C678DD"><b>img||.lazy&&data-original</b></font></td></tr>
<tr><td><font color="#C678DD"><b>:eq(n)</b></font></td><td>第n个</td><td><font color="#C678DD"><b>.item:eq(0)</b></font></td></tr>
<tr><td><font color="#C678DD"><b>:contains(文本)</b></font></td><td>包含文本</td><td><font color="#C678DD"><b>li:contains(导演)</b></font></td></tr>
<tr><td><font color="#C678DD"><b>Text</b></font></td><td>取文本</td><td><font color="#C678DD"><b>a&&Text</b></font></td></tr>
<tr><td><font color="#C678DD"><b>href / src</b></font></td><td>取属性</td><td><font color="#C678DD"><b>a&&href</b></font></td></tr>
<tr><td><font color="#C678DD"><b>data-xxx</b></font></td><td>取data属性</td><td><font color="#C678DD"><b>img&&data-original</b></font></td></tr>
</table>

<hr>

<h2>九、常见解析模式</h2>

<h3>player_变量</h3>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">var match = html.match(/var player_\\s*=\\s*(\\{[^;]+\\})/);<br>
if (match) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;var playerObj = JSON.parse(match[1]);<br>
&nbsp;&nbsp;&nbsp;&nbsp;var vUrl = playerObj.url || "";<br>
}</font></small></p>

<h3>加密解密</h3>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">if (playerObj.encrypt == '1') vUrl = unescape(vUrl);<br>
else if (playerObj.encrypt == '2') vUrl = unescape(base64Decode(vUrl));</font></small></p>

<h3>x5嗅探</h3>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">return 'x5Rule://' + url + '@' + $.toString(function() {<br>
&nbsp;&nbsp;&nbsp;&nbsp;var urls = _getUrls();<br>
&nbsp;&nbsp;&nbsp;&nbsp;for (var i in urls) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if (urls[i].match(/\\.mp4|\\.m3u8/)) return urls[i];<br>
&nbsp;&nbsp;&nbsp;&nbsp;}<br>
});</font></small></p>

<h3>多线路播放构建</h3>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">var urls = ['https://xxx/hd.m3u8', 'https://xxx/sd.m3u8'];<br>
var names = ['高清', '标清'];<br>
var playUrl = createPlaylist(urls, names);</font></small></p>

<h3>复合卡片布局</h3>

<p style="background:#f5f5f5;padding:8px;border-radius:4px;"><small><font face="monospace">var cards = buildCompositeCard(data, [<br>
&nbsp;&nbsp;&nbsp;&nbsp;{ col_type: 'text_center_1', titleKey: 'leagueName' },<br>
&nbsp;&nbsp;&nbsp;&nbsp;{ col_type: 'icon_4', titleKey: 'homeTeam', imgKey: 'homeLogo' },<br>
&nbsp;&nbsp;&nbsp;&nbsp;{ col_type: 'text_2', titleKey: 'score' },<br>
&nbsp;&nbsp;&nbsp;&nbsp;{ col_type: 'icon_4', titleKey: 'awayTeam', imgKey: 'awayLogo' }<br>
]);</font></small></p>

<hr>

<h2>十、注意事项</h2>

<ol>
<li>使用 <font color="#C678DD"><b>var</b></font> 声明，不用 <font color="#C678DD"><b>let</b></font>/<font color="#C678DD"><b>const</b></font></li>
<li><font color="#C678DD"><b>fixUrl</b></font>/<font color="#C678DD"><b>fetchHtml</b></font> 自动注入，无需手动定义</li>
<li>轮播图 <font color="#C678DD"><b>col_type</b></font> 为 <font color="#C678DD"><b>card_pic_1</b></font>，<font color="#C678DD"><b>desc</b></font> 为 <font color="#C678DD"><b>"0"</b></font></li>
<li>二级 <font color="#C678DD"><b>line</b></font> 和 <font color="#C678DD"><b>list</b></font> 长度必须一致</li>
<li>富文本用 <font color="#C678DD"><b>\u2018\u2018\u2019\u2019</b></font> 包裹</li>
<li>每个方法内部用 try/catch 包裹</li>
<li>所有URL通过 <font color="#C678DD"><b>this.fixUrl()</b></font> 补全</li>
<li>运行时已注入 <font color="#C678DD"><b>urljoin</b></font>/<font color="#C678DD"><b>getHome</b></font>/<font color="#C678DD"><b>dealJson</b></font>/<font color="#C678DD"><b>base64Encode</b></font>/<font color="#C678DD"><b>md5</b></font> 等工具函数，无需重复定义</li>
<li>支持 <font color="#C678DD"><b>home</b></font>/<font color="#C678DD"><b>category</b></font>/<font color="#C678DD"><b>detail</b></font>/<font color="#C678DD"><b>play</b></font>/<font color="#C678DD"><b>search</b></font> 标准方法名，框架自动映射为青豆接口</li>
<li><font color="#C678DD"><b>QD.safePdfa</b></font>/<font color="#C678DD"><b>QD.safePdfh</b></font>/<font color="#C678DD"><b>QD.safePd</b></font> 在选择器可能异常时推荐使用，避免整个方法因解析错误而失败</li>
<li>直播源设置 <font color="#C678DD"><b>类型: "直播源"</b></font> 或 <font color="#C678DD"><b>playType: "live"</b></font>，框架自动优化播放流程</li>
<li>直播源二级中每个播放源应构建为独立线路（每线路1个选集），而非同一线路多个选集</li>
<li><font color="#C678DD"><b>createPlaylist</b></font> 可快速构建多线路播放JSON，<font color="#C678DD"><b>isDirectVideo</b></font> 可检测直链视频</li>
</ol>

<hr>

<h2>十一、沙箱陷阱与踩坑经验</h2>

<p style="background:#FFF3CD;padding:10px;border-radius:4px;border-left:4px solid #FFC107;"><b>⚠ 以下为实际写源中踩过的坑，务必注意避免！</b></p>

<h3>1. <font color="red">pd(element, "a&&href") 返回海阔页面URL</font></h3>

<p>在沙箱环境中，<font color="#C678DD"><b>pd(element, "a&&href")</b></font> 会将相对URL解析为当前海阔页面URL（如 <code>hiker://page/bocaiHome</code>），而非HTML中的属性值。</p>

<p><b>错误：</b></p>
<p style="background:#ffe0e0;padding:8px;border-radius:4px;"><small><font face="monospace">var url = pd(items[i], "a&&href");<br>
// 返回 "https://seeduck.cc/hiker://page/bocaiHome?page=1" 而非 "/movies/123"</font></small></p>

<p><b>正确 — 用正则提取：</b></p>
<p style="background:#e0ffe0;padding:8px;border-radius:4px;"><small><font face="monospace">var m = items[i].match(/href="([^"]+)"/);<br>
var url = m ? m[1] : "";</font></small></p>

<h3>2. <font color="red">pd(element, "img&&src") / pd(element, "img&&data-original") 同样有问题</font></h3>

<p>与 href 相同，<font color="#C678DD"><b>pd</b></font> 提取图片属性时也会将相对路径解析为海阔页面URL。</p>

<p><b>正确 — 用正则提取：</b></p>
<p style="background:#e0ffe0;padding:8px;border-radius:4px;"><small><font face="monospace">var m = items[i].match(/data-original="([^"]+)"/);<br>
var pic = m ? m[1] : "";<br>
<br>
var m2 = items[i].match(/src="([^"]+)"/);<br>
var pic2 = m2 ? m2[1] : "";</font></small></p>

<h3>3. 三级 && 选择器不被支持</h3>

<p><font color="#C678DD"><b>pdfa(html, "body&&.seeds&&li")</b></font> 等三级级联选择器返回空数组，必须用两步法：</p>

<p style="background:#e0ffe0;padding:8px;border-radius:4px;"><small><font face="monospace">var seedConts = pdfa(html, 'body&&.seeds');<br>
if (seedConts.length > 0) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;var items = pdfa(seedConts[0], 'a');<br>
}</font></small></p>

<h3>4. HTML片段上不能用 body&& 前缀</h3>

<p>对已提取的HTML片段使用 <font color="#C678DD"><b>pdfa(fragment, 'body&&a')</b></font> 返回空，应直接用 <font color="#C678DD"><b>pdfa(fragment, 'a')</b></font>。<font color="#C678DD"><b>body&&</b></font> 仅用于完整HTML文档。</p>

<h3>5. dlog 函数不存在</h3>

<p>沙箱环境中没有 <font color="#C678DD"><b>dlog</b></font> 函数，调用会抛出 <font color="red">ReferenceError</font> 导致整个方法失败。只能使用 <font color="#C678DD"><b>log</b></font>，且仅用于错误日志。</p>

<h3>6. pdfh 与 pd 的区别</h3>

<p><font color="#C678DD"><b>pdfh</b></font> 提取<b>文本内容</b>，<font color="#C678DD"><b>pd</b></font> 提取<b>HTML属性值</b>。<font color="#C678DD"><b>data-link</b></font>、<font color="#C678DD"><b>data-original</b></font> 等是属性，必须用 <font color="#C678DD"><b>pd</b></font>。</p>

<p style="background:#ffe0e0;padding:8px;border-radius:4px;"><small><font face="monospace">pdfh(items[i], "a&&data-link")&nbsp;&nbsp;// ❌ 返回空<br>
pd(items[i], "a&&data-link")&nbsp;&nbsp;&nbsp;&nbsp;// ✅ 返回属性值</font></small></p>

<h3>7. data-link 可能只是域名标识</h3>

<p>某些网站 <font color="#C678DD"><b>data-link</b></font> 属性只是域名标识（如 <code>drive.uc.cn</code>），不是完整URL，不能直接用作选集URL。应使用 <font color="#C678DD"><b>href</b></font>（跳转链接）作为选集URL，在 <font color="#C678DD"><b>解析</b></font> 方法中二次请求获取真实网盘URL。</p>

<h3>8. 网盘链接需经解析方法获取真实URL</h3>

<p>网盘类资源的选集URL通常是站内跳转链接（如 <code>/link_start/?redirect_to=pan_id_xxx</code>），需在 <font color="#C678DD"><b>解析</b></font> 方法中请求跳转链接获取真实网盘URL。框架（bocaiDetail）在 <font color="#C678DD"><b>executeLazy</b></font> 后会再次检查 <font color="#C678DD"><b>getPanType</b></font>，识别为网盘则调用 <font color="#C678DD"><b>openPanUrl</b></font> 打开网盘。</p>

<p><b>解析方法返回真实网盘URL（不带 web:// 前缀）：</b></p>
<p style="background:#e0ffe0;padding:8px;border-radius:4px;"><small><font face="monospace">解析: function(url) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;var realUrl = url;<br>
&nbsp;&nbsp;&nbsp;&nbsp;try {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if (url.indexOf('/link_start/') !== -1) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;var html = this.fetchHtml(url);<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;var m = html.match(/https?:\/\/drive\.(uc|quark)\.cn\/[^\s"']+/);<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if (m) realUrl = m[0];<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>
&nbsp;&nbsp;&nbsp;&nbsp;} catch(e) {}<br>
&nbsp;&nbsp;&nbsp;&nbsp;return realUrl;<br>
}</font></small></p>

<h3>9. 一级/搜索返回格式优先 vod_name</h3>

<p>一级和搜索方法返回数组时，优先使用 <font color="#C678DD"><b>vod_name</b></font>/<font color="#C678DD"><b>vod_pic</b></font>/<font color="#C678DD"><b>vod_id</b></font>/<font color="#C678DD"><b>vod_remarks</b></font> 格式（框架通过 <font color="#C678DD"><b>_convertVodData</b></font> 标准转换），而非 <font color="#C678DD"><b>title</b></font>/<font color="#C678DD"><b>img</b></font>/<font color="#C678DD"><b>url</b></font>/<font color="#C678DD"><b>desc</b></font> 格式。</p>

<h3>10. 二级空结果不应缓存</h3>

<p>二级方法返回空结果（line为空数组）时不应缓存，否则修复代码后30分钟内仍返回旧缓存。判断条件：<font color="#C678DD"><b>detail && detail.line && detail.line.length > 0</b></font> 才缓存。</p>

<h3>11. 图片防盗链</h3>

<p>某些网站图片有防盗链，需在图片URL后添加 <font color="#C678DD"><b>@Referer=</b></font>：</p>
<p style="background:#e0ffe0;padding:8px;border-radius:4px;"><small><font face="monospace">vod_pic: this.fixUrl(pic) + "@Referer="</font></small></p>

<h3>12. 自定义PHP人机验证</h3>

<p>部分网站使用自定义PHP验证（非Cloudflare），需逆向 <font color="#C678DD"><b>encrypt()</b></font> 函数 + POST <font color="#C678DD"><b>/robot.php</b></font> 绕过。海阔自动Cookie管理：<font color="#C678DD"><b>fetch</b></font> 自动存储Set-Cookie，验证通过后后续请求自动携带。</p>
`,
    col_type: 'rich_text',
    extra: { lineVisible: false, backgroundColor: '#10FFA94D', textSize: 16 }
});
setResult(d);