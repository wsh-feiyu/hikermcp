//#region 编解码 & 加解密
/**
 * base64 编码
 */
declare function base64Encode(str: string): string;
/**
 * base64 解码
 */
declare function base64Decode(b64: string): string;
/**
 * 16进制字符串转base64编码
 ```
 // 可以和fetch联用
 hexToBase64(fetch(url, { toHex: true }))
 ```
 */
declare function hexToBase64(hexStr: string): string;
declare namespace window0 {
  /**
   * base64 编码
   ```
   对标浏览器的 window.btoa 方法
   注：只能编码 \u0000-\u00ff 范围的字符
   ```
   */
  function btoa(input: string): string;
  /**
   * base64 解码
   ```
   对标浏览器的 window.atob 方法
   ```
   */
  function atob(input: string): string;
}
/**
 * aes 加密
 */
declare function aesEncode(key: string, str: string): string;
/**
 * aes 解密
 */
declare function aesDecode(key: string, str: string): string;

/**
 * 字符编码
 */
declare function encodeStr(str: string, enc: 'GBK' | 'UTF-8'): string;
/**
 * 字符解码
 */
declare function decodeStr(str: string, enc: 'GBK' | 'UTF-8'): string;

type rsaOptions = {
  /**
   * 加密配置 'RSA/模式/填充'
   */
  config?: 'RSA/ECB/PKCS1Padding';
  /**
   * 类型
   ```
   rsaEncrypt: type为1时key填公钥，type为2则key填私钥
   rsaDecrypt: 与rsaEncrypt相反，type为1时key填私钥，type为2则key填公钥
   ```
   */
  type?: 1 | 2;
  /**
   * 加密方式
   ```
   1 普通 默认
   2 分段
   ```
   */
  long?: 1 | 2;
  /**
   * 分段长度
   ```
   true 自动 默认
   false 固定117
   ```
   */
  block?: true | false;
};
/**
 * rsa 加密
 */
declare function rsaEncrypt(data: string, key: string, options?: rsaOptions): string;
/**
 * rsa 解密
 */
declare function rsaDecrypt(encryptBase64Data: string, key: string, options?: rsaOptions): string;
/**
 * 文本MD5
 */
declare function md5(text: string): string;
/**
 * 取文件MD5
 */
declare function md5(path: string): string;

declare namespace rc4 {
  /**
   * RC4 加密
   * @param text 要加密的内容
   * @param key 密钥
   * @param enc 编码
   */
  function encode(text: string, key: string, enc?: 'UTF-8' | 'GBK'): string;
  /**
   * RC4 解密
   * @param text 要解密的内容
   * @param key 密钥
   * @param enc 编码
   */
  function decode(text: string, key: string, enc?: 'UTF-8' | 'GBK'): string;
}
/**
 * 图片转 base64 编码格式
 * @param url 图片的网络地址
 ```
 let a = convertBase64Image(url)
 // 返回格式：data:image/jpeg;base64,xxxxxx
 
 log(convertBase64Image.toString()) 
 // 查看实现原理
 ```
 */
declare function convertBase64Image(url: string): string;
declare enum _base64 {
  /** 编码器/解码器标志的默认值 */
  DEFAULT = 0,
  /** 编码器标志位在输出结束时省略填充'='字符（如果有的话） */
  NO_PADDING = 1,
  /** 编码器标志位省略所有行终止符（即，输出将位于一条长线上） */
  NO_WRAP = 2,
  /** 使用CR LF这一对作为一行的结尾而不是Unix风格的LF */
  CRLF = 4,
  /** 编码器/解码器标志位指示使用Base64的“URL和文件名安全”变体，其中使用 -和 _代替 +和 / */
  URL_SAFE = 8,
  /** 传递给 Base64OutputStream标志表明它不应该关闭当它自己关闭时正在包装的输出流 */
  NO_CLOSE = 16,
}
declare namespace _base64 {
  /**
   * 对给定数据进行Base64编码并返回一个新分配的字节[]和结果
   * @param input 要进行Base64编码内容
   * @param flags 编码方式，如：_base64.NO_WRAP
   */
  function encode(input: number[], flags: _base64): number[];
  /**
   * 将要解码Base64编码的数据并将数据返回到新的字节数组中
   * @param input Base64编码的数据
   * @param flags 编码方式，如：_base64.NO_WRAP
   */
  function decode(input: string | number[], flags: _base64): number[];
  /**
   * Base64对给定的数据进行编码并返回一个新分配的字符串和结果。
   * @param input 要进行Base64编码内容
   * @param flags 编码方式，如：_base64.NO_WRAP
   */
  function encodeToString(input: number[], flags: _base64): string;
  /**
   * 在输入中解码Base64编码的数据并将数据返回一个新分配的字符串和结果
   * @param input 要解码的内容
   * @param flags 编码方式，如：_base64.NO_WRAP
   */
  function decodeToString(input: string | number[], flags: _base64): string;
}
declare function getCryptoJS(): string;
//#endregion

//#region JS 域内变量

/**
 * 应用名
 ```
 在海阔视界它的值为 '海阔视界'，
 在嗅觉浏览器它的值为 '嗅觉浏览器'
 ```
 */
declare const MY_NAME: string;

/**
 * 当前网络请求地址
 */
declare const MY_URL: string;

/**
 * 主页地址
 ```
 该值由 MY_URL 计算而来
 比如 MY_URL 为 https://a.com/xxx/html，
 那么 MY_HOME 为 https://a.com
 ```
 */
declare const MY_HOME: string;

// 用于将 数组 转换
type TYPE<T> = T extends Array<infer U> ? U : never;
type type = TYPE<['all', 'video', 'music', 'live', 'cartoon', 'read', 'picture', 'news', 'tool', 'other']>;
type col_type = TYPE<
  [
    'text_1',
    'text_2',
    'text_3',
    'text_4',
    'text_5',
    'text_center_1',
    'movie_1',
    'movie_2',
    'movie_3',
    'movie_1_left_pic',
    'movie_1_vertical_pic',
    'movie_1_vertical_pic_blur',
    'movie_3_marquee',
    'pic_1',
    'pic_2',
    'pic_3',
    'pic_1_full',
    'pic_3_square',
    'pic_1_card',
    'pic_2_card',
    'icon_1_search',
    'icon_2',
    'icon_2_round',
    'icon_4',
    'icon_4_card',
    'icon_small_3',
    'icon_small_4',
    'icon_round_4',
    'icon_round_small_4',
    'icon_5',
    'long_text',
    'rich_text',
    'avatar',
    'text_icon',
    'x5_webview_single',
    'line',
    'line_blank',
    'blank_block',
    'big_blank_block',
    'flex_button',
    'scroll_button',
    'card_pic_2',
    'card_pic_3',
    'card_pic_1',
    'card_pic_2_2',
    'card_pic_2_2_left',
    'input',
    'big_big_blank_block'
  ]
>;
type page = {
  col_type: col_type;
  name: string;
  path: string;
  rule: string;
};
type rule = {
  /** 名称 */
  title: string;
  /** 类别 */
  type: type;
  /** 作者 */
  author: string;
  /** 版本 */
  version: number;
  /** 分组 */
  group: string;
  /** 图标 */
  icon: string;
  ua: 'mobile' | 'auto' | 'pc';
  /** 请求代理 */
  proxy: string;
  /** JS 预处理 */
  preRule: string;
  /** 最新章节 */
  last_chapter_rule: string;
  url: string;
  class_name: string;
  class_url: string;
  area_name: string;
  area_url: string;
  year_name: string;
  year_url: string;
  sort_name: string;
  sort_url: string;
  /** 首页样式 */
  col_type: col_type;
  /** 首页解析 */
  find_rule: string;
  /** 二级样式 */
  detail_col_type: col_type;
  /** 二级解析 */
  detail_find_rule: string;
  search_url: string;
  searchFind: string;
  sdetail_col_type: col_type;
  sdetail_find_rule: string;
  pageList: page[];
  pages: page[];
};

/**
 * 获取当前规则，返回的是一个对象
 * @see {@link getRule()} 这个方法返回的是当前规则字符串
 ```
 动态获取主页地址，示例：js: log(getHome(MY_RULE.url))
 注：如果不传值则自动传入 MY_URL，适用于 MY_URL 会在 JS 里面修改的情况，比如轻合集

 获取当前规则标题，示例：js: log(MY_RULE.title)
 ```
 */
declare const MY_RULE: rule;

/**
 * 获取当前规则，注意返回的是字符串
 * @see {@link MY_RULE} 这个常量是当前规则对象
 */
declare function getRule(): string;

/**
 * 获取主页地址
 * @param url 默认值为 MY_URL
 */
declare function getHome(url: string): string;

/**
 * 移动端UA
 ```
 如：Mozilla/5.0 (Linux; Android 12; M2004J7AC Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/103.0.5060.129 Mobile Safari/537.36
 注：这个不同手机会有差异
 ```
 */
declare const MOBILE_UA: string;

/**
 * 电脑端UA
 ```
 如：Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36
 注：这个好像是固定的
 ```
 */
declare const PC_UA: string;

/**
 * 当前页数
 ```
 第一页为1，第二页为2
 注：url 上必须要有 fypage 才能产生下拉翻页效果
 ```
 */
declare const MY_PAGE: number;

/**
 * 获取页面类型
 ```
 首页将打印 home，搜索为 search
 ```
 */
declare const MY_TYPE: string;

/**
 * 获取上一级页面传过来的参数
 ```
 上级页面点击元素的 extra 对象
 ```
 */
declare const MY_PARAMS: object;

//#endregion

//#region JS 解析文档方法

/**
 * 解析文档获取网页内容，可简写 pd
 ```
 注：如果返回的是 url 地址，会自动加上域名和 http 前缀
 ```
 * @param context html 文档字符串
 * @param selector 选择器
 * @param url 默认为 MY_URL，用于自动补全链接用到的地址
 */
declare function parseDom(context: string, selector: string, url?: string): string;
declare const pd = parseDom;

/**
 * 解析文档获取网页内容，可简写 pdfh
 ```
 和 parseDom 功能一致，但是 parseDomForHtml 不会对结果进行处理
 不会自动加上域名和 http 前缀，完全返回解析到的内容
 ```
 * @param context html 文档字符串
 * @param selector 选择器
 */
declare function parseDomForHtml(context: string, selector: string): string;
declare const pdfh = parseDomForHtml;

/**
 * 解析文档获取列表内容，可简写 pdfa
 * @param context html 文档字符串
 * @param selector 选择器
 */
declare function parseDomForArray(context: string, selector: string): string[];
declare const pdfa = parseDomForArray;
/**
 * 执行XPath规则
 * @param context html 文档字符串
 * @param selector 选择器
 ```
 let href = xpath(getResCode(), '//div[@id=root]/a[1]/@href');
 log(href)
 ```
 */
declare function xpath(context: string, selector: string): string;
/**
 * 执行XPath规则，可简写 xpa
 * @param context html 文档字符串
 * @param selector 选择器
 ```
 let urls = xpathArray(getResCode(), '//div/a/@href');
 log(urls)
 // 返回字符串数组，可简写 xpa
 ```
 */
declare function xpath(context: string, selector: string): string[];
declare const xpa = xpathArray;
//#endregion

//#region JS 方法

/**
 * 获取手机IP
 */
declare function getIP(): string;

/**
 * 消息提示
 */
declare function toast(text: string): undefined;

/**
 * 获取应用的版本号
 */
declare function getAppVersion(): number;

/**
 * 获取所有可选首页样式
 */
declare function getColTypes(): col_type[];
/**
 * 获取小程序数量，注意返回的是字符串
 */
declare function getRuleCount(): string;

/**
 * 复制文本信息到剪贴板，禁止频繁调用，正常使用 copy://text 的路由放在链接里面即可
 */
declare function copy(text: string): undefined;

/**
 * 获取常用历史规则
 */
declare function getLastRules(count?: number): rule[];
/**
 * 获取当前页面标题
 * @see {@link https://docs.189.tyrantg.com/docs/hikerview/help_js.html#%E4%BF%AE%E6%94%B9%E9%A1%B5%E9%9D%A2%E6%A0%87%E9%A2%98}
 */
declare function getPageTitle(): string;
/**
 * 新页面代码里面动态修改页面标题
 * @see {@link https://docs.189.tyrantg.com/docs/hikerview/help_js.html#%E4%BF%AE%E6%94%B9%E9%A1%B5%E9%9D%A2%E6%A0%87%E9%A2%98}
 */
declare function setPageTitle(title: string): undefined;
/**
 * 修改页面图片地址
 */
declare function setPagePicUrl(url: string): undefined;
/**
 * 修改页面附加参数
 */
declare function setPageParams(params: object): undefined;
/**
 * 二级列表动态设置最新章节规则
 ```
 // 注意：传入的参数是个字符串，支持 js
 setLastChapterRule('.myui-content__list&&a&&Text')
 setLastChapterRule('js:' + $.toString(()=>{ setResult('我是最新章节') }))

 // 注：js 写法不可以将选集列表进行传参，只能在 $.toString 里重新获取，否则会导致收藏永远无法获取最新章节！！！
 ```
 */
declare function setLastChapterRule(rule: string): undefined;

/**
 * 页面生命周期监听（事件）
 * @param type 监听类型
 * @param listener 事件处理，$.toString(()=>{})
 ```
 // 注：目前只在首页和二级页面有效，搜索结果页面无效，且传递的方法内不能引用该函数外的变量

 // 监听刷新事件（下一页和切换分类不算）
 addListener('onRefresh', $.toString(() => { log('refresh') }))
 // 监听页面关闭事件
 addListener('onClose', $.toString(() => { log('clock') }))
 ```
 */
declare function addListener(type: 'onRefresh' | 'onClose', listener: string): undefined;
/**
 * 获取可以使用的云剪贴板
 * @returns 返回数组，形如 ['云剪贴板1', '云剪贴板2']
 */
declare function getPastes(): string[];
/**
 * 分享到云剪贴板
 * @param content 分享的内容
 * @param paste 剪贴板名称，为空则自动使用第一个可用的剪贴板
 * @returns 返回云剪贴板地址
 */
declare function sharePaste(content: string, paste?: string): string;
/**
 * 解析云剪贴板
 * @param url
 */
declare function parsePaste(url: string): string;
/**
 * 获取手机ABI
 ```
 注意：该方法为高危险方法，需征得用户授权才能执行
 ```
 */
declare function getCpuAbi(): 'arm64-v8a' | 'armeabi-v7a';
/**
 * 获取搜索模式
 * @returns 0 为默认模式  1 代表精准搜索模式
 */
declare function getSearchMode(): 0 | 1;
/**
 * 设置搜索模式
 * @param flag
 * 0 为默认模式
 * 1 代表精准搜索模式
 */
declare function setSearchMode(flag: 0 | 1): void;
/**
 * 精准匹配封装
 * @param text 
 * @param key 关键词
 * @param flags 是否忽略大小写，默认为 false，也就是不忽略
 ```
 // 相比直接includes该方法会使用空格分词匹配，如文本“2022梦醒了”能匹配“22 梦醒”，但不匹配“梦2022”、“梦 2022”
 if(searchContains(text, key, false)){//精准匹配}
 ```
 */
declare function searchContains(text: string, key: string, flags?: boolean): undefined;
/**
 * 执行定时周期性任务
 * @param id 可传null，软件会自动生成uuid作为任务id
 * @param time 执行间隔，单位毫秒，最小值 500
 * @param func 执行的JS代码字符串
 ```
 // 任务会自动绑定当前显示页面，离开页面时软件会自动删除任务，也可以手动删除任务：unRegisterTask(id)
 let id = 'abc';
 let time = 10000;
 let obj = {};
 registerTask(id, time, $.toString((obj)=> { log('执行了') } , obj))
 // 注意事项1：定时任务间隔不一定完全准确，最大有500毫秒误差
 // 注意事项2：任务执行耗时不要超过间隔时间，否则会延时执行，间隔时间误差增大
 ```
 */
declare function registerTask(id: string | null, time: number, func: string): undefined;
/**
 * 手动删除任务
 * @param id registerTask 启动的id
 */
declare function unRegisterTask(id: string): undefined;
/**
 * 启动代理服务器
 * @param func 接受到请求时执行的JS代码字符串，需返回请求内容
 * @returns func 方法返回的字符串
 ```
 let url = startProxyServer($.toString(() => { return MY_PARAMS.a })) + '?a=b';

 let url = startProxyServer($.toString(() => { return fetch(base64Decode(MY_PARAMS.u)) }));
 url = url + '?u=' + base64Encode('http://1.com')

 // 扩展：在JS代码中支持返回状态码和Header
 startProxyServer($.toString(() => {
    return JSON.stringify({
      body:'aa',
      headers:{'Content-Type': 'text/html', 'Location': 'http://b.com'},
      statusCode: 302
    });
 }))
 // 注意：如果未使用扩展自定义请求头，那么Content-Type固定为application/vnd.apple.mpegurl，也就是m3u8格式
 // 注意：将代理地址传给播放器要在链接加参数来让地址唯一，否则可能播放进度会串，如果是m3u8要有m3u8字样，否则可能无法被播放器识别为m3u8格式
 ```
 */
declare function startProxyServer(func: string): string;
//#endregion

//#region JS 常用方法

/**
 * 获取 html
 */
declare function getResCode(): string;

/**
 * 记录日志，只支持一个参数
 * @param data 该参数类型可以为字符串、对象、数组等
 ```
 打开显示：设置->开发手册与模式->记录并显示日志
 ```
 */
declare function log(data: any): undefined;
/**
 * 获取页面链接(MY_URL)里面的参数
 ```
 // 如 MY_URL 为 http://1.com?type=mp4
 getParam('type', 'mp3') // 该值为 mp4
 ```
 */
declare function getParam(key: string, defaultValue?: string): string;

/**
 * 显示内容到界面上或者输出错误信息，推荐使用 log 进行调试
 * @param err 错误信息
 */
declare function setError(err: string): void;
type urls = {
  urls: string[];
  audioUrls?: string[];
  names?: string[];
  /**
   * 带header时如果header里面有英文分号;的需用两个中文分号；；代替
   */
  headers?: headers[];
  /**
   * 外挂字幕（支持srt、vtt、ass几种格式）
   ```
   {urls:['http://xxx/1.mp4'], subtitle:'http://xxx/1.srt'}
   ```
   */
  subtitle?: string;
  /**
   * 弹幕
   ```
   // 弹幕（B站的xml格式）
   {urls:['http://xxx/1.mp4'], danmu:'http://xxx/1.xml'}
   // 弹幕（JSON格式），链接必须包含.json，内容格式：[{"text":"弹幕", "time": 5.23}]
   {urls:['http://xxx/1.mp4'], danmu:'http://xxx/1.json'}
   // 弹幕（webSocket等格式），即软件会加载一个webview到播放器上，web://后面为加载的网址
   {urls:['http://xxx/1.mp4'], danmu:'web://hiker://files/1.html'}
   ```
   */
  danmu?: string;
  /**
   * 音乐播放也支持弹幕，歌词（lyric）
   ```
   {urls:['http://xxx/1.mp3'], lyric:'http://xxx/1.lrc'}
   ```
   */
  lyric?: string;
};
declare type layout = {
  /** 标题 */
  title?: any;
  /** 链接 */
  url?: string | urls;
  /** 图片地址(优先级比 pic_url 高) */
  img?: string;
  /** 图片地址 */
  pic_url?: string;
  /** 详情，仅搜索页可用 */
  content?: string;
  /** 
   * 描述信息 
   ```
   当 col_type 为 card_pic_2_2 时
   desc 可以填入数字，表示组件高度，如80，那么组件高度就会自动变成120
   默认不设置的情况下整个组件高度和宽度一致，两个card_pic_2_2则单个为宽度的一半

   当 col_type 为 card_pic_2 时
   desc可以设置数字，0-25之间，默认为15，0代表不需要模糊
   ```
   @see {@link https://docs.189.tyrantg.com/docs/hikerview/help_col_type.html#x5-webview-single}
   */
  desc?: string | number;
  /** 显示类型 */
  col_type?: col_type;
  /**
   * 额外数据
   * @see {@link https://docs.189.tyrantg.com/docs/hikerview/help_col_type.html}
   */
  extra?: {
    id?: string;
    cls?: string;
    /** 
     * col_type 为 input 时，用于监听输入框变化 
     ```
     {url:"'toast://你输入的是' + input", col_type:'input', title:'搜索', extra: {onChange: "putVar('my-search',input)"}}
     ```
     */
    onChange?: string;
    /** 
     * col_type 为 input 时，用于隐藏确定按钮
     ```
     {col_type:'input', extra: {titleVisible: false}}
     ```
     */
    titleVisible?: boolean;
    /** 
     * col_type 为 input 时，用于设置默认值
     ```
     {col_type:'input', extra: {defaultValue: 'test'}}
     ```
     */
    defaultValue?: string;
    /** 
     * col_type 为 input 时，用于设置输入类型
     ```
     {col_type:'input', extra: {type: 'textarea'}}
     ```
     */
    type?: 'textarea' | 'password' | 'number';
    /** 
     * col_type 为 input 时，用于设置高度 
     ```
     {col_type:'input', extra: {type: 'textarea',height: -1}}
     // 可选值：-1和正整数，这里高度为倍数，-1代表自适应，整数代表单行输入框的高度的倍速，默认为3
     ```
     */
    height?: number;
    /**
     * col_type 为 input 时，用于高亮编辑
     ```
     {col_type:'input', extra: {type: 'textarea',highlight: true}}
     // 注意此模式下 title 和 url 属性不生效
     ```
     */
    highlight?: true;
    /**
     * col_type 为 rich_text | long_text 时，用于设置字体大小
     ```
     {col_type:'rich_text', extra: {textSize: 18}}
     // 默认值16
     {col_type:'long_text', extra: {textSize: 18}}
     // 默认值16.5（但是大家用的时候必须为整数）
     ```
     */
    textSize?: number;
    /**
     * col_type 为 rich_text 时，用于设置行间距
     ```
     {col_type:'rich_text', extra: {lineSpacing: 10}}
     // 阅读模式下以用户设置为准
     ```
     */
    lineSpacing?: number;
    /**
     * col_type 为 text_[2|3|4|5] 时，用于文本左对齐
     ```
     {col_type:'text_2', extra: {textAlign: 'left'}}
     // 默认为 center 居中
     ```
     */
    textAlign?: 'left' | 'center';
    /**
     * col_type 为 text_center_1 | text_1 | movie_1_vertical_pic | movie_1_left_pic | movie_1 时，用于隐藏底部分界线
     ```
     {col_type: 'text_center_1',extra: {lineVisible: false}}
     ```
     */
    lineVisible?: boolean;
    /**
     * col_type 为 movie_1_vertical_pic_blur 时，用于背景渐变
     ```
     {col_type: 'movie_1_vertical_pic_blur',extra: {gradient: true}}
     ```
     */
    gradient?: boolean;

    /**
     * 自定义长按操作
     ```
     d.push({title: 'test', extra: { longClick: [{title: '操作1', js: $.toString(()=>{ return 'toast://点击了'})}] } })
     // 按钮数量无限制，js代码支持返回子页面地址等逻辑，input为按钮名称title的值
     ```
     */
    longClick?: { title: string; js: string }[];
    /**
     * 定制下一页页面标题
     ```
     {extra: {pageTitle: 'xxx简介'}}
     // 默认软件会以当前页面标题加按钮 title 属性作为下一页的标题
     ```
     */
    pageTitle?: string;
    /**
     * 不继承页面标题（默认当前页面标题加按钮 title）
     ```
     {extra: {inheritTitle: false}}
     // 可用于不单独定制 pageTitle，但又不希望使用当前页面标题
     ```
     */
    inheritTitle?: boolean;
    /**
     * 页面单独窗口显示
     ```
     {col_type:'text_1', title:'打开新窗口', url:'x5://http://1.cn', extra:{newWindow: true, windowId: MY_RULE.title}}
     // windowId 为其标识，再次点击按钮时会回到相同 windowId 的窗口
     // 新开的页面如何隐藏到后台：按钮 url 使用 func://background 即可
     // 注意：新开窗口打开的页面内不支持 back(true)，即退出当前页面同时刷新前一个页面
     ```
     */
    newWindow?: boolean;
    /**
     * 页面单独窗口显示时作为标识
     */
    windowId?: string;
    /**
     * 代理规则列表
     ```
     {col_type: 'input', url: "'hiker://search?s=' + input", extra: {rules: "fetch('hiker://files/rules.json')"}}
     // 注意：rules为一段JS代码，并非规则列表，rules代码里面最后返回一个规则列表的数组字符串即可
     // 注意点1：rules字段为js代码，并非规则文件地址
     // 注意点2：需要返回数组字符串，并非数组，比如可以JSON.stringify(data)
     // 注意点3：软件自带搜索解析规则不能使用此功能，该功能仅能用于首页，但不限于输入样式
     ```
     */
    rules?: string;
  };
};
/**
 * 用于设置首页结果
 * @param layouts
 * @deprecated
 */
declare function setHomeResult(layouts: layout[]): void;
/**
 * 用于设置搜索结果
 * @param layouts
 * @deprecated
 */
declare function setSearchResult(layouts: layout[]): void;
/**
 * 用于设置结果
 * @param layouts
 */
declare function setResult(layouts: layout[]): void;

/**
 * 刷新页面
 * @param flag true(自动滚动到顶部，默认) false(刷新页面不滚动到顶部)
 ```
 可以和动态解析、toast://结合
 比如：@lazyRule=.js:putVar('settingMode', '1')；；refreshPage()；；'toast://已设置为简洁模式'

 即可以用 js 执行一些操作，然后想要立即生效，那就刷新页面，返回'toast://已设置为简洁模式'来提示用户

 如何刷新页面不滚动到顶部？refreshPage(false)，默认会自动滚动到顶部
 ```
 */
declare function refreshPage(flag?: boolean): undefined;
/**
 * 关闭页面并刷新前一个页面
 * @param flag true(关闭页面并刷新前一个页面，默认) false(只关闭页面)
 ```
 注意：该函数限制只能在二级页面使用，一级页面已屏蔽该函数调用
 ```
 */
declare function back(flag?: boolean): undefined;
/**
 * 获取我的规则订阅
 * @returns 返回一个规则对象数组
 */
declare function getHomeSub(): rule[];
/**
 * 判断是否已经订阅某个地址
 */
declare function hasHomeSub(url: string): boolean;
/**
 * 刷新X5链接或者内容
 */
declare function refreshX5WebView(url: string): undefined;
/**
 * 该方法只会刷新高度等信息，不会刷新网页
 */
declare function refreshX5Desc(desc: string): undefined;
/**
 * 显示 Loading 弹窗
 * @param text
 */
declare function showLoading(text: string): undefined;
/**
 * 隐藏 Loading 弹窗
 */
declare function hideLoading(): undefined;
/**
 * 显示确认弹窗
 * @param option 选项
 ```
 // 特点：不用点击即可显示，比如一进入规则执行js过程中需要立即显示弹窗，那么可以使用此方法
 confirm({
   title: '更新提示', // 弹窗标题
   content: '检测到你的规则版本小于服务器版本，是否立即更新？', // 弹窗内容
   confirm: $.toString(() => { log('确定') }),  // 确定后执行
   cancel: $.toString(() => { log('取消') }),   // 取消后执行
 })
 // 注意：该代码无法直接引用当前 js 内的变量和方法
 ```
 */
declare function confirm(option: { title: string; content: string; confirm?: string; cancel?: string }): undefined;

/**
 * 动态更新
 * @param id 要更新的id
 * @param layout 支持刷新所有属性包含url、title、desc等，可以一起刷新，也可以只刷新某一项
 ```
 updateItem('test_id1', {url:'hiker://files/cache/t.dex', extra: {id: 'test_id1'}});
 // 注意：extra中的id必须全局唯一，如果多个页面有重复的，那么所有页面都会刷新，如果某个页面中有多行有重复ID，那么只会更新第一个
 ```
 */
declare function updateItem(id: string, layout: layout): undefined;
/**
 * 动态删除
 * @param id 要删除的 id
 ```
 deleteItem('test_id2');
 ```
 */
declare function deleteItem(id: string): undefined;
/**
 * 批量删除
 * @param ids 要删除的 id 数组
 ```
 deleteItem(['test_id2', 'test_id3'])
 ```
 */
declare function deleteItem(ids: string[]): undefined;
/**
 * 按cls删除
 * @param cls 要删除的 cls
 ```
 deleteItemByCls('box123')
 // 即删除extra:{cls: 'box123'}的所有元素，推荐cls相同的连续，不要有多段相同cls的元素，否则删除时没有动画和input组件失焦
 ```
 */
declare function deleteItemByCls(cls: string): undefined;
/**
 * 动态新增
 * @param id
 * @param layout 新增的 layout
 ```
 addItemAfter('test_id1', {url:'hiker://files/cache/t.dex', extra: {id: 'test_id2'}});
 ```
 */
declare function addItemAfter(id: string, layout: layout): undefined;
/**
 * 动态新增在前面
 * @param id
 * @param layout 新增的 layout
 ```
 addItemBefore('test_id1', {url:'hiker://files/cache/t.dex', extra: {id: 'test_id2'}});
 ```
 */
declare function addItemBefore(id: string, layout: layout): undefined;
/**
 * 批量新增
 * @param id
 * @param layouts 新增的 layout 数组
 ```
 addItemAfter('test_id1', [{url:'xxx', extra: {id: 'test_id2'}}]);
 ```
 */
declare function addItemAfter(id: string, layouts: layout[]): undefined;
/**
 * 批量新增在前面
 * @param id
 * @param layouts 新增的 layout 数组
 ```
 addItemBefore('test_id1', [{url:'xxx', extra: {id: 'test_id2'}}]);
 ```
 */
declare function addItemBefore(id: string, layouts: layout[]): undefined;
/**
 * 查询界面元素信息
 * @param id id
 ```
 let obj = findItem('test_id1'); log(obj.title)
 ```
 */
declare function findItem(id: string): layout | null;
/**
 * 根据cls查询界面元素信息
 * @param cls cls
 ```
 let arr = findItemsByCls('test_cls');
 log(arr)
 // cls支持多个，多个用空格分隔，比如cls: 'tab sel'，那么findItemsByCls('sel')也会查询到
 ```
 */
declare function findItemsByCls(cls: string): layout[] | null;
//#endregion

//#region 存储和读取

/**
 * 获取文件绝对路径
 ```
 示例：getPath('hiker://files/a.txt')
 返回：file:///storage/emulated/0/Android/data/com.example.hikerview/files/Documents/a.txt
 推荐不要在规则里面直接把路径写为 file:///storage/emulated/0/xxx，避免分身应用等情况下不可用
 ```
 */
declare function getPath(path: string): string;
/**
 * 检测文件是否存在
 */
declare function fileExist(path: string): boolean;
/**
 * 图片保存
 ```
 saveImage('http://x.com/1.png||http://x.com/2.png','hiker://files/1.png')
 // 会先下载 1.png，如果下载失败会尝试下载第二个图片地址
 fileExist('hiker://files/1.png')
 // 检测图片是否存在: 
 ```
 */
declare function saveImage(url: string, path: string): undefined;
/**
 * 写入文件（后面会废弃，请用后面的saveFile和readFile，当前接口不支持写files目录）
 * @param filePath 文件路径
 ```
 filePath 可以为 'hiker://files/a.txt' 或者文件绝对路径
 'hiker://files/a.txt' 等效为软件根路径下的 Documents 文件夹下的 a.txt
 注意只有 'hiker://files/rules' 目录下的文件才会被备份和恢复备份，所以重要文件可放到 rules 目录，不重要的文件没必要放此目录。如果是私密内容请用 setItem
 ```
 * @param content 要写入的内容
 * @deprecated
 */
declare function writeFile(filePath: string, content: string): undefined;

/**
 * 私有文件写入
 * @param fileName 文件名，形如 a.txt，最终文件路径为软件根路径下的Documents/rules/files/${规则名}/a.txt
 * @param content 要写入的内容
 * @param flag 设置为 0，则写入时不加密
 ```
 注：规则删除时会自动删除这些文件，如果规则改名文件相当于不存在
 ```
 */
declare function saveFile(fileName: string, content: string, flag?: 0): undefined;
/**
 * 私有文件写入
 * @param fileName 文件名，形如 a.txt
 * @param flag 设置为 0，读取未加密文件
 * @returns 未找到会返回空字符串
 */
declare function readFile(fileName: string, flag?: 0): string;
/**
 * 私有文件删除
 * @param fileName 文件名，形如 a.txt
 */
declare function deleteFile(fileName: string): undefined;

/**
 * 公开存储
 * @param key 
 * @param value 值
 ```
 注：该系列接口对所有规则公开，且不会随着规则删除而删除，请勿存储私密内容
 ```
 */
declare function setPublicItem(key: string, value: string): undefined;
/**
 * 公开读取
 * @param key
 * @param defaultValue 找不到时的默认值
 * @returns 未找到会返回空字符串
 */
declare function getPublicItem(key: string, defaultValue?: string): string;
/**
 * 公开移除
 * @param key
 */
declare function clearPublicItem(key: string): undefined;
/**
 * 存储全局变量，重启软件后失效
 * @param key 
 * @param value 值
 ```
 该变量和插件里面的全局变量是一致的，重启软件后失效，如需长期有效，见文件存取
 ```
 */
declare function putVar(key: string, value: string): undefined;
/**
 * 读取全局变量
 * @param key
 * @param defaultValue
 * @returns 未找到 key，返回 defaultValue，如果没有 defaultValue，则返回空字符串
 */
declare function getVar(key: string, defaultValue?: string): string;
/**
 * 清除全局变量
 * @param key
 */
declare function clearVar(key: string): undefined;

/**
 * 存储规则内全局变量，重启软件后失效
 * @param key 
 * @param value 值
 ```
 该变量和插件里面的全局变量是一致的，重启软件后失效，如需长期有效，见文件存取
 ```
 */
declare function putMyVar(key: string, value: string): undefined;
/**
 * 读取规则内全局变量
 * @param key
 * @param defaultValue
 * @returns 未找到 key，返回 defaultValue，如果没有 defaultValue，则返回空字符串
 */
declare function getMyVar(key: string, defaultValue?: string): string;
/**
 *  列出规则内所有key
 */
declare function listMyVarKeys(): string[];
/**
 * 清除规则内全局变量
 * @param key
 */
declare function clearMyVar(key: string): undefined;
/**
 * 设置私有化存储，关闭应用不会失效，更新规则数据不会改变，但规则删除会丢失，重新导入也没用
 * @param key
 * @param value
 */
declare function setItem(key: string, value: string): undefined;

/**
 * 获取私有化存储
 * @param key
 * @param defaultValue 找不到时的默认值
 * @returns 未找到 key，返回 defaultValue，如果没有 defaultValue，则返回 'undefined' 字符串
 */
declare function getItem(key: string, defaultValue?: string): string;
/**
 * 清除私有化存储
 * @param key
 */
declare function clearItem(key: string): undefined;
/**
 ```
 全局变量接口优化，支持存储JSON对象
 本质上还是使用 getItem、setItem、getPublicItem、setPublicItem、getVar、putVar、getMyVar、putMyVar 等方法
 只不过在保存和读取上对值进行了 JSON 解析和序列化
 比如：
 storage0.putVar('data', { name: 'aa', arr: [1, 2, 3] })  // 存储 data 值
 getVar('data') // 返回 {"name":"aa","arr":[1,2,3]} 字符串
 storage0.getVar('data') // 返回 {"name":"aa","arr":[1,2,3]} 这个对象
 // 可以直接 storage0.getVar('data').name 获取储存 data 中 name 的值
 ```
 */
declare namespace storage0 {
  /**
   * 存储全局变量，重启软件后失效
   * @param key 
   * @param value 值
   ```
   该变量和插件里面的全局变量是一致的，重启软件后失效，如需长期有效，见文件存取
   ```
   */
  function putVar(key: string, value: any): undefined;
  /**
   * 读取全局变量
   * @param key
   * @param defaultValue
   * @returns 未找到 key，返回 defaultValue，如果没有 defaultValue，则返回空字符串
   */
  function getVar(key: string, defaultValue?: any): any;
  /**
   * 存储规则内全局变量，重启软件后失效
   * @param key 
   * @param value 值
   ```
   该变量和插件里面的全局变量是一致的，重启软件后失效，如需长期有效，见文件存取
   ```
   */
  function putMyVar(key: string, value: any): undefined;
  /**
   * 读取规则内全局变量
   * @param key
   * @param defaultValue
   * @returns 未找到 key，返回 defaultValue，如果没有 defaultValue，则返回空字符串
   */
  function getMyVar(key: string, defaultValue?: any): any;
  /**
   * 设置私有化存储，关闭应用不会失效，更新规则数据不会改变，但规则删除会丢失，重新导入也没用
   * @param key
   * @param value
   */
  function setItem(key: string, value: any): undefined;

  /**
   * 获取私有化存储
   * @param key
   * @param defaultValue 找不到时的默认值
   * @returns 未找到 key，返回 defaultValue，如果没有 defaultValue，则返回空字符串
   */
  function getItem(key: string, defaultValue?: any): any;
  /**
   * 公开存储
   * @param key 
   * @param value 值
   ```
   注：该系列接口对所有规则公开，且不会随着规则删除而删除，请勿存储私密内容
   ```
   */
  function setPublicItem(key: string, value: any): undefined;
  /**
   * 公开读取
   * @param key
   * @param defaultValue 找不到时的默认值
   * @returns 未找到会返回空字符串
   */
  function getPublicItem(key: string, defaultValue?: any): any;
}
//#endregion

//#region 请求相关

type headers = {
  /** 用来告知（服务器）客户端可以处理的内容类型 */
  Accept?: string;
  /** 用来告知（服务器）客户端可以处理的字符集类型 */
  'Accept-Charset'?: string;
  /** 客户端能够理解的内容编码方式——通常是某种压缩算法 */
  'Accept-Encoding'?: string;
  /** 允许客户端声明它可以理解的自然语言 */
  'Accept-Language'?: string;
  'Access-Control-Allow-Credentials'?: string;
  'Access-Control-Allow-Headers'?: string;
  'Access-Control-Allow-Methods'?: string;
  'Access-Control-Allow-Origin'?: string;
  'Access-Control-Expose-Headers'?: string;
  'Access-Control-Max-Age'?: string;
  'Access-Control-Request-Headers'?: string;
  'Access-Control-Request-Method'?: string;
  /** 消息头里包含对象在缓存代理中存贮的时长，以秒为单位 */
  Age?: number;
  /** 首部字段用于枚举资源所支持的 HTTP 方法的集合 */
  Allow?: string;
  /** 请求标头用于提供服务器验证用户代理身份的凭据，允许访问受保护的资源 */
  Authorization?: string;
  /** 通用消息头字段，被用于在 http 请求和响应中，通过指定指令来实现缓存机制 */
  'Cache-Control'?: string;
  /** 通用标头控制网络连接在当前会话完成后是否仍然保持打开状态 */
  Connection?: 'keep-alive' | 'close';
  /** 列出了对当前实体消息（消息荷载）应用的任何编码类型，以及编码的顺序 */
  'Content-Encoding'?: string;
  /** 用来说明访问者希望采用的语言或语言组合 */
  'Content-Language'?: string;
  /** 用来指明发送给接收方的消息主体的大小，即用十进制数字表示的八位元组的数目 */
  'Content-Length'?: string;

  'Content-Location'?: string;
  'Content-Range'?: string;
  'Content-Security-Policy'?: string;
  'Content-Security-Policy-Report-Only'?: string;
  'Content-Type'?:
    | 'application/x-www-form-urlencoded'
    | 'application/json;charset=utf-8'
    | 'text/plain'
    | 'multipart/form-data';
  /** 其中含有先前由服务器通过 Set-Cookie 标头投放或通过 JavaScript 的 Document.cookie 方法设置 */
  Cookie?: string;
  'Cross-Origin-Embedder-Policy'?: string;
  'Cross-Origin-Opener-Policy'?: string;
  'Cross-Origin-Resource-Policy'?: string;
  /** 包含了报文创建的日期和时间 */
  Date?: string;
  /** 包含日期/时间，即在此时候之后，响应过期 */
  Expires?: string;
  /** 指明了请求将要发送到的服务器主机名和端口号 */
  Host?: string;
  'If-Match'?: string;
  'If-Modified-Since'?: string;
  'If-None-Match'?: string;
  'If-Range'?: string;
  'If-Unmodified-Since'?: string;
  /** 允许消息发送者暗示连接的状态，还可以用来设置超时时长和最大请求数 */
  'Keep-Alive'?: string;
  /** 指定的是需要将页面重新定向至的地址 */
  Location?: string;
  /** 指定可经过的服务器最大数目 */
  'Max-Forwards'?: string;
  /** 表示了请求的来源（协议、主机、端口） */
  Origin?: string;
  /** 告知服务器返回文件的哪一部分 */
  Range?: string;
  /** 包含了当前请求页面的来源页面的地址 */
  Referer?: string;
  'Sec-Fetch-Dest'?: string;
  'Sec-Fetch-Mode'?: string;
  'Sec-Fetch-Site'?: string;
  'Sec-Fetch-User'?: string;
  /** 由服务器端向用户代理发送 cookie */
  'Set-Cookie'?: string;

  /** 用来让网络协议的对端来识别发起请求的用户代理软件的应用类型、操作系统、软件开发商以及版本号 */
  'User-Agent'?: string;
  Origin?: string;
  Origin?: string;
  Origin?: string;
};
type httpOptions = {
  /**
   * 当 method 为 post 时，发送的数据
   */
  body?: object | string;
  headers?: headers;
  /**
   ```
   那么返回的内容为 `{body: '字符串内容', headers: {'Set-Cookie': ['a=b', 'b=c']}}`
   即返回的是个 json 字符串，注意是字符串，header 里面每个 key 对应一个 array
   ```
   */
  withHeaders?: true;
  /**
   ```
   那么返回的内容为 `{body: '字符串内容', headers: {}, statusCode: 200}`
   即返回的是个 json 字符串
   ```
   */
  withStatusCode?: true;
  /**
   * 禁用重定向
   */
  redirect?: false;
  /**
   * 设置超时时间，单位为毫秒，默认10秒超时
   */
  timeout?: number;
  /**
   * byte[] 转16进制
   */
  toHex?: true;
  /**
   * 只获取 header 不获取 body，返回 `{headers: {'Set-Cookie': ['a=b', 'b=c']}}`
   */
  onlyHeaders?: true;
  /**
   * 获取InputStream
   ```
   let stream = fetch(url, {inputStream: true});
   try { 
       //执行逻辑 
   } catch(e){} 
   closeMe(stream);
   // 记住用完一定要关闭！
   ```
   */
  inputStream?: true;
  /**
   * 自定义DNS
   ```
   let html = fetch(url, { dns: 'https://dns.alidns.com/dns-query' })
   // dns 属性可以是 DNS-over-HTTPS 地址
   // 也可以是多个用空格隔开的 IP 地址
   // 也可以使用 registerDNS 方法批量注册
   ```
   */
  dns?: string;
};
/**
 * 关闭流
 * @param stream
 */
declare function closeMe(stream: object): undefined;

type fetchOptions = httpOptions & {
  method?: 'CONNECT' | 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'POST' | 'PUT' | 'TRACE';
  /**
   * 设置请求头
   * @see {@link https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Accept}
   */
  headers?: {
    /**
     ```
     当 method 为 post 时
     默认值为：'application/x-www-form-urlencoded'
     且当 body 值为 json 对象时，则会自动变为 'application/json;charset=utf-8'
     ```
     */
    'Content-Type'?:
      | 'application/x-www-form-urlencoded'
      | 'application/json;charset=utf-8'
      | 'text/plain'
      | 'multipart/form-data';
  };
};
/**
 * GET请求拼接参数
 * @param url 
 * @param obj 要拼接的对象，如果对象值含有 &，会转为 ＆＆
 * @returns 返回拼接好的字符串
 ```
 buildUrl('http://www.a.cn', {a:'b', c: 'd'})
 // http://www.a.cn?a=b&c=d
 ```
 */
declare function buildUrl(url: string, obj: object): string;
/**
 * 发送请求，默认 UA 为 MOBILE_UA
 * @param url 可以为 hiker://page/detail，获取子页面的内容，返回对象字符串，`{'name':'详情','path':'detail', 'rule':'js:xxx'}`
 * @param options
 */
declare function fetch(url: string, options?: fetchOptions): string;
declare const request = fetch;
/**
 * 发送请求，默认 UA 为 PC_UA，其他与 fetch 相同
 * @param url
 * @param options
 */
declare function fetchPC(url: string, options?: fetchOptions): string;
type postOptions = httpOptions & {
  /**
   * 设置请求头
   * @see {@link https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Accept}
   */
  headers?: {
    /**
     ```
     默认值为：'application/x-www-form-urlencoded'
     ```
     */
    'Content-Type'?:
      | 'application/x-www-form-urlencoded'
      | 'application/json;charset=utf-8'
      | 'text/plain'
      | 'multipart/form-data';
  };
};
/**
 * 发送 post 请求，默认 UA 为 MOBILE_UA
 * @param url
 * @param options 选项
 ```
 post('http://www.a.cn', {body: {a:'xx', b: 1}})
 // 软件会自动将 body 转成 a=xx&b=1
 // 且 Content-Type 设为 application/x-www-form-urlencoded
 ```
 */
declare function post(url: string, options?: postOptions): string;
/**
 * 发送 post 请求，默认 UA 为 PC_UA
 * @param url
 * @param options 选项
 ```
 post('http://www.a.cn', {body: {a:'xx', b: 1}})
 // 软件会自动将 body 转成 a=xx&b=1
 // 且 Content-Type 设为 application/x-www-form-urlencoded
 ```
 */
declare function postPC(url: string, options?: postOptions): string;
type http = {
  /**
   * 设置请求头信息
   * @param headers
   * @returns
   */
  headers: (headers: headers) => http;
  /**
   * 成功的回调
   * @param data 如果返回数据为json会自动使用JSON.parse转成对象，即success的data为对象，如果使用了withHeaders则data.body为response对象
   * @returns
   */
  success: (data: string | object) => http;
  /**
   * 错误的回调
   * @param err 错误信息
   * @returns
   */
  error: (err: string) => http;
  /**
   * 开始发起请求
   * @returns
   */
  start: () => typeof http;
};
/**
 * JS里面发起请求类似ajax，和ajax差远了，只是封装方便调用
 ``` 
 http.fetch('http://a.com/1.json', {}).headers({'X-Req-X', 'test'}).success(data=>{log(data.code)}).error(msg=>log(msg)).start()
 // 连续发起请求
 http.fetch('http://a.com').success(data=>{log(data)}).start().fetch('http://b.com').success(data=>{log(data)}).start()
 ```
 */
declare namespace http {
  /**
   * 发送请求，默认 UA 为 MOBILE_UA
   * @param url
   * @param options
   */
  function fetch(url: string, options?: fetchOptions): http;
  /**
   * 发送请求，默认 UA 为 MOBILE_UA
   * @param url
   * @param options
   */
  function request(url: string, options?: fetchOptions): http;
  /**
   * 发送 post 请求，默认 UA 为 MOBILE_UA
   * @param url
   * @param options 选项
   ```
   post('http://www.a.cn', {body: {a:'xx', b: 1}})
   // 软件会自动将 body 转成 a=xx&b=1
   // 且 Content-Type 设为 application/x-www-form-urlencoded
   ```
   */
  function post(url: string, options?: postOptions): http;
  /**
   * 获取 Cookie
   * @param url
   * @param options
   * @returns 返回的是数组的 json 字符串，如 ['a=b','c=d']，注意是字符串
   */
  declare function fetchCookie(url: string, options?: fetchOptions): http;
}
/**
 * 获取 Cookie
 * @param url
 * @param options
 * @returns 返回的是数组的 json 字符串，如 ['a=b','c=d']，注意是字符串
 */
declare function fetchCookie(url: string, options?: fetchOptions): string;
/**
 * 获取cookie
 * @param url
 */
declare function getCookie(url: string): string;
/**
 * 自定义DNS
 ```
 registerDNS({ 'www.themoviedb.org': '1.1.1.1 2.2.2.2' })，多个IP地址用空格隔开

 也可以使用DNS-over-HTTPS地址，如registerDNS({ 'www.themoviedb.org': 'https://dns.alidns.com/dns-query' })

 支持半匹配，比如所有themoviedb.org域名的包含www和image子域名：registerDNS({ '.themoviedb.org': '1.1.1.1' })

 可一次性注册多个：registerDNS({ 'b.com': '1.1.1.1', 'a.com': '2.2.2.2' })

 注意注册一次会全局生效，且该操作需要用户同意授权，否则执行无效果（第一次调用此方法，软件会自动弹出授权申请）
 ```
 */
declare function registerDNS(dns: object): undefined;

/**
 * 获得可用 IP 地址
 * @param ip 
 * @param timeout 默认值为 3000
 ```
 let ok = ipping('1.1.1.1', 2000);
 // 第一个参数为IP地址，第二个参数为超时毫秒数，默认 3000 可不传
 ```
 */
declare function ipping(ip: string, timeout?: number): boolean;
/**
 * 批量检测
 * @param ips 
 * @param timeout 默认值为 3000
 ```
 let ip = findReachableIP(['1.1.1.1', '2.2.2.2'], 2000);
 // 软件会多线程批量检测，找到一个即返回，第二个参数为单个检测超时毫秒数

 let ip = findReachableIP(['1.1.1.1', '2.2.2.2']); 
 registerDNS({'a.com': ip});
 // 可以配合 registerDNS 使用
 ```
 */
declare function findReachableIP(ips: string[], timeout?: number): string | null;

/**
 * 发起批量请求，可简写 bf
 * @param fetchArr
 * @returns 返回一个字符串数组对象，注意是对象，顺序和参数顺序严格一致
 ```
 注意：数组参数长度超过16时，会自动分批，同步循环执行
 比如20个参数，那么会先16个并发请求，请求完再发起4个并发请求，最后再返回结果
 ```
 */
declare function batchFetch(fetchArr: { url: string; options?: fetchOptions }[]): string[];
declare const bf = batchFetch;
/**
 * 将16进制字符串转成Uint8Array，可以搭配 fetch(url, {toHex: true}) 使用
 */
declare function hexToBytes(hexString: string): Uint16Array;
/**
 * 将16进制字符串转成二进制写入文件，主要用来搭配 fetch(url, {toHex: true}) 使用
 ```
 const hex = fetch(url, {toHex: true});
 writeHexFile('hiker://files/cache/a.mp3', hex)
 ```
 */
declare function writeHexFile(filePath: string, hexString: string): undefined;
/**
 * 缓存m3u8索引文件​
 * @param url
 * @param options
 * @param fileName 自定义文件名，如果要写该参数，那么第二个参数必须也要，无值就 {}
 * @returns 返回：`file:///storage/Android/data/com.example.hikerview/files/Documents/cache/video.m3u8##http://xx.m3u8`
 ```
 如果链接包含.mp4但是不包含m3u8那么认为不是m3u8格式，不支持缓存索引文件，可以给链接加上#m3u8强制识别为m3u8

 强制识别：默认情况下会校验content-type的header，如果是mp4等格式直接返回原链接，可以给链接加上#isM3u8#，那么软件会忽略header校验
 ```
 */
declare function cacheM3u8(url: string, options?: fetchOptions, fileName?: string): string;
/**
 * 批量多线程缓存，可简写 bcm
 * @param fetthArr
 */
declare function batchCacheM3u8(fetthArr: { url: string; options?: fetchOptions; fileName?: string }[]): string[];
declare const bcm = batchCacheM3u8;
/**
 * 修正m3u8索引路径
 * @param url
 * @param fixContent
 * @returns 修正后的文件内容
 ```
 // 说明：用于在不能直接使用cacheM3u8来缓存m3u8文件，需要自行生成m3u8文件的场景，而m3u8文件里面的ts文件路径又不想自行拼接
 const a = fixM3u8('http://yy/xx.m3u8', '#EXT-X-KEY:xxx.key\nxxx.ts')
 // 修正后的文件内容，如 #EXT-X-KEY:http://yy/xxx.key\nhttp://yy/xxx.ts
 ```
 */
declare function fixM3u8(url: string, fixContent: string): string;
/**
 * 移除M3U8广告片段
 * @param url
 * @param options
 * @returns 一个lazyRule动态解析字符串
 ```
 说明：clearM3u8AdLazy 方法会生成一个lazyRule动态解析字符串，在lazyRule方法中软件会缓存m3u8到本地，并检查和清理 #EXT-X-DISCONTINUITY 疑似广告的片段

 如果想立即清理AD片段而不是生成lazyRule，可以调用 clearM3u8Ad('http://1.com/1.m3u8'); 那么会立即缓存m3u8到本地并返回可播放地址
 ```
 */
declare function clearM3u8AdLazy(url: string, options?: fetchOptions): string;
/**
 * 移除M3U8广告片段并立即缓存m3u8到本地
 * @param url
 * @param options
 * @returns 返回可播放地址
 */
declare function clearM3u8Ad(url: string, options?: fetchOptions): string;
/**
 * 播放image/png分段格式的m3u8
 * @param url
 * @param options
 * @param fileName 自定义文件名，如果要写该参数，那么第二个参数必须也要，无值就 {}
 * @returns
 * @see {@link cacheM3u8} 和cacheM3u8基本一样
 ```
 说明：软件会调用startProxyServer方法，并且将原png分段地址改成代理地址，在代理方法中软件会自动下载png并转成ts格式
 可以执行 log(convertM3u8WithPngProxy.toString()) 查看实现源码
 ```
 */
declare function cacheM3u8WithPngProxy(url: string, options?: fetchOptions, fileName?: string): string;
/**
 * 直接转换m3u8内容，当不能用cacheM3u8WithPngProxy时可以用这个方法
 * @param url
 * @param options
 * @returns 返回代理地址
 ```
 说明：软件会调用startProxyServer方法，并且将原png分段地址改成代理地址，在代理方法中软件会自动下载png并转成ts格式，可以执行log(convertM3u8WithPngProxy.toString())查看实现源码
 ```
 */
declare function convertM3u8WithPngProxy(content: string, options?: fetchOptions): string;
/**
 * 封装的配置管理，管理个性设置、依赖版本、依赖地址等
 * @param config 配置对象
 ```
 // 写入配置：预处理里面使用
 initConfig({二级样式:'顺承天意', pako: 'https://cdn.com/v3.5.js'});
 // 读取配置：
 config.pako  // 'https://cdn.com/v3.5.js'
 ```
 */
declare function initConfig(config: onject): undefined;

/**
 * 执行加密代码
 * @param code 被加密的代码字符串
 ```
 设置 -> 开发者模式里面可以得到加密后的代码

 不要直接引用非顶层作用域的变量或者函数，比如在箭头函数()->{}里面定义变量然后加密代码块里面直接引用此变量名，建议把变量定义一起加密，或者使用传参来引用
 ```
 */
declare function evalPrivateJS(code: string): string;

/**
 * 远程模块（代码块）引用
 * @param url 远程 js 代码地址 或 本地目录 libs 下 js 文件名
 * @param options 请求头等信息
 * @param version 版本号
 ```
 原理：使用require软件会对链接取md5，然后判断libs目录该文件是否存在，存在则直接取文件内容，不存在则fetch到本地，然后执行eval

 注意：远程模块里面不要直接引用非顶层作用域的变量或者函数，比如在箭头函数 ()->{} 里面定义变量然后require里面直接引用此变量名，应该使用传递参数来引用此变量

 注意：如果远程文件有更新，同一个地址软件是不会更新文件的，推荐给链接加上?v=1这样的标志来缓存新版本的文件，这样不影响其它规则使用旧版本，如果非要更新缓存文件也可以增加版本号来强制更新

 强制更新：修改版本号就会无视时间强制刷新，版本号参数均为最后一个参数

 require是在顶层作用域eval代码，而requirejs则是CommonJS规范
 ```
 */
declare function require(url: string, options?: fetchOptions, version?: number): undefined;
/**
 * 临时缓存
 * @param url 远程 js 代码地址
 * @param time 缓存时间，单位为小时
 ```
 // 文件会缓存24小时，超过会重新下载，缩写：rc
 requireCache('http://xxx/t.js', 24)

 // 注：临时缓存只获取不执行eval
 ```
 */
declare function requireCache(url: string, time: number): undefined;
/**
 * 删除本地缓存、强制更新
 * @param url 远程 js 代码地址，不填则删除该规则下所有缓存
 * @param time 缓存时间，单位为小时
 ```
 删除缓存到本地的文件，再次执行require则会重新下载，删除该规则下所有缓存：deleteCache()
 ```
 */
declare function deleteCache(url?: string): undefined;
/**
 * 全局模块引用，即CommonJS规范的模块引用
 * @param url 本地目录 libs 下 js 文件名 或 远程 js 代码地址
 ```
 let {test} = requirejs('a')
 // 将会加载libs/a.js，并且一次加载全局生效

 // 为方便使用，加载本地模块也可以使用require('a')，效果和requirejs('a')是完全一样的
 // require是在顶层作用域eval代码，而requirejs则是CommonJS规范

 // 更新模块：首页长按规则名选择清除缓存，默认会全局缓存模块，即A页面读取文件加载了模块代码，再打开B页面不会再次读取文件执行
 ```
 */
declare function requirejs(url?: string): undefined;
/**
 * 下载文件到本地
 * @param url 
 * @param filePath 文件地址
 ```
 downloadFile('http://xxx.jar', 'hiker://files/cache/xxx.jar')
 ```
 */
declare function downloadFile(url: string, filePath: string, headers?: headers): undefined;
/**
 * 仅下载一次
 * @param url 
 * @param filePath 文件地址
 ```
 requireDownload('http://xxx.jar', 'hiker://files/cache/xxx.jar')
 ```
 */
declare function requireDownload(url: string, filePath: string): undefined;

type task = {
  /**
   * 任务方法
   * @param obj 这个对象为 param 对象
   */
  func: (obj: object) => any;
  /**
   * 给 func 方法传的参数
   */
  param?: object;
  id?: string;
};
type listener = {
  /**
   * @param param param参数
   * @param id 任务ID
   * @param error 该任务失败原因
   * @param taskResult task返回值
   */
  func: (obj: object, id: string, error: string, taskResult: string) => any;
  param?: object;
};
/**
 * 批量多线程任务，可简写 be
 * @param tasks 任务对象数组，注意func方法内不能直接引用外部变量，需要通过param传入
 * @param listener 任务进度监听（可为空），包含func监听逻辑方法、param外部参数，func属性包含三个参数：第一个即param参数，第二个为任务ID，第三个为该任务失败原因，第四个为task返回值
 * @param successCount 要求任务成功个数，不传则表示要求需等待所有任务完成，比如tasks传了5个任务，successCount传3，那么listener只会执行3次，3个任务完成后其余任务直接中断丢弃，继续执行be后面的逻辑
 * @see {@link https://github.com/qiusunshine/hiker-rules/blob/master/%E7%A4%BA%E4%BE%8B/batchExecute.js}
 ```
 在listener里面主动中断，只需要在listener里面return 'break' 即可
 任务为异步多线程执行，最大线程数16（任务数无限制），监听方法为同步执行不用担心并发问题，单个任务耗时不能超过30秒
 ```
 */
declare function batchExecute(tasks: task[], listener?: listener, successCount?: number): undefined;
declare const be = batchExecute;

/**
 * 同步锁定任务
 * @param param 参数
 ```
 该方法用于需要全局线程同步的情况，因为putVar、putMyVar、setItem等方法都是线程不安全的，比如batchExecute传入的多线程任务，如果在多线程任务里面读写putVar那么是无法保证数据准确的（不过be推荐在listener内读写，因为listener是当前be内线程同步的）
 ```
 */
declare function syncExecute(param: { func: (obj: object) => any; param: object }): undefined;

/**
 * 加载java字节码
 * @param dexPath dex 文件路径
 * @param package 包
 * @param path 路径
 ```
 requireDownload('https://gitee.com/qiusunshine233/hikerView/raw/master/rules/d.dex', 'hiker://files/cache/t.dex');
 var test = loadJavaClass('hiker://files/cache/t.dex', 'com.test.code.TestCode');
 log(test.hello());

 //携带so文件
 loadJavaClass('hiker://files/cache/t.dex', 'com.test.code.TestCode', 'hiker://cache/dir/a.so')
 // 携带多个so文件，其中so文件都放cache/dir目录
 loadJavaClass('hiker://files/cache/t.dex', 'com.test.code.TestCode', 'hiker://cache/dir')
 ```
 */
declare function loadJavaClass(dexPath: string, package: string, path: string): object;
type fetchCodeByWebViewOptions = {
  headers?: headers;
  /**
   * WebView加载过程中屏蔽链接的规则
   ```
   ['.png', '.jpg']
   ```
   */
  blockRules?: string[];
  /**
   * 超时时间，默认 30000 即 30 秒
   */
  timeout?: number;
  /**
   ```
   // 只有获取到内容才提取源码，也就是只有checkJs执行返回内容不为null软件才会获取源码返回
   fetchCodeByWebView('http://a.com', { checkJs: $.toString(() => { return document.querySelector('#main a') } )})
   ```
   */
  checkJs?: string;
};
/**
 * 使用WebView获取源码
 * @param url
 * @param options
 */
declare function fetchCodeByWebView(url: string, options?: fetchCodeByWebViewOptions);

//#endregion

//#region $工具（LoyDglk大佬提供）

/**
 * $工具（LoyDglk大佬提供）
 */
declare namespace $ {
  /**
   * 海阔顶层作用域，你可以在局部作用域中快速访问全局属性。
   ```
   var a1 = 1;
   const a2 = 2;
   let a3 = 3;
   (function () {
      var a1 = 10;
      const a2 = 20;
      let a3 = 30;
      log(a1);	//10
      log(a2);	//20
      log(a3);	//30
      log($.hiker.a1);	//1
      log($.hiker.a2);	//2
      log($.hiker.a3);	//'undefined'
   })()
   // 1. 不知道是不是海阔的特性，使用var或者const定义变量时会定义在全局作用域，而使用let定义变量时则不会。
   // 2. 此功能适用范围很小，除极个别情况一般不会也不应使用。
   ```
   */
  const hiker: object;
  /**
   * 导出模块，默认值{}，需要配合$.require()使用。
   ```
   // 子页面 hiker://page/test 内容
   if ($.importParam === 1) {//用法1
      $.exports.tips = "hello";
      $.exports.setLog = text=>log(text);
   } else if ($.importParam === 2) {//用法2
      $.exports = ()=>log("hello2");
   }

   //用法1
   const mylog = $.require("hiker://page/test", 1);
   mylog.setLog(mylog.tips);	//"hello"
 
   //用法1(解构赋值)
   const { tips, setLog } = $.require("hiker://page/test", 1);
   setLog(tips); //'hello'
 
   //用法2
   const mylog = $.require("hiker://page/test", 2);
   mylog()	//"hello2"
   ```
   */
  const exports: object;
  /**
   * 通过 $.require 方法第二个参数传过来的数据
   */
  const importParam: any;
  /**
   * 将函数转化为立即执行函数的字符串，后面的lazyRule,rule等方法都是以这个函数为基准(用法都差不多)
   * @param func 需要转化的函数
   * @param argN 向func函数传入参数。支持类型：json对象，函数等，TS:传递参数时需要func有对应形参接收
   * @returns 返回形如 "(function(){})()" 的立即执行函数的字符串
   ```
   //传递单个参数
   let url = $.toString(index => {//箭头函数单个参数可以不用()
   	  log(index);
   }, 1);
   log(typeof url);	//string
   log(url);	//((index)=>{log(index);})(1)
   
   //传递多个参数
   let url2 = $.toString((a, b, c)=>{//箭头函数多个参数需要用(),不传参数需要用()占位
   	  log(a + b + c);
   }, 1, 2, 3);//这里a对应1,b对应2,c对应3
   log(typeof url2);	//string
   log(url2);	//((a,b,c)=>{log(a+b+c);})(1,2,3) 

   {
     col_type: "input",
     url: $.toString(() => "toast://"+input)
   }
   //点击后弹出通知，通知内容为输入框的输入内容
   addListener("close", $.toString(() => {
     clearVar("test");
   }))
   //关闭页面时，清除test全局变量
   ```
   */
  function toString(func: (...argN) => any, ...argN): string;

  /**
   * 将基本数据类型和部分引用型数据类型转化为字符串，如 json对象，函数。
   * @param obj 需要转化的对象
   ```
   let obj = {
     tisp: "hello",
     time: 2021,
     log() {
     	log(this.tisp + this.time);
     }
   };
   let objectStr = $.stringify(obj);
   log(typeof objectStr);	//string
   ```
   */
  function stringify(obj: object): string;

  /**
   * 导入通过 $.exports 导出的数据
   * @param path 模块路径，可以是子页面、本地文件、远程文件
   * @param importParam 仅在生成模块时可用的外部参数
   * @returns 返回 $.exports 的值
   ```
   1、使用 $.require() 时，会先执行路径文件中的代码，然后返回 $.exports，因此代码中必须定义 $.exports。

   2、为防止影响引用环境，$.require() 设计成了闭包，因此调用 $.exports 中的函数时无法直接使用外部变量。要使用外部变量应通过传参的方式传入，或者使用 $.hiker.a 的方式调用外部变量（不建议也不应这样用）。
   ```
   */
  function require(path: string, importParam?: any): any;

  /**
   * 比 typeof 更加强大的数据类型判断
   * @param param 任意数据类型
   * @returns 传入参数的数据类型
   ```
   log($.type(a)); //'undefined'
   log($.type(null)); //'null'
   log($.type(true)); //boolean
   log($.type(0)); //number
   log($.type('test')); //string
   log($.type(function(){})); //function
   log($.type([1,2])); //array
   log($.type(new Date)); //date
   log($.type(new RegExp)); //regexp
   log($.type({})); //object
   log($.type(new Error)); //error
   log($.type(Symbol())); //symbol
   ```
   */
  function type(param: any): string;

  /**
   * 比 typeof 更加强大的数据类型判断
   * @param date 要格式化的日期
   * @param text 日期格式化的格式
   * @returns 格式化后的日期
   ```
   let text = "yyyy年-MM月-dd日-hh时-mm分-ss秒";
   log(new Date(),text);
   log(1640667814055,text); //2021年12月28日1时3分34秒
   日期字符	含义
   G	Era 标志符
   y	年
   M	月份
   w	年中的周数
   W	月中的周数
   D	年中的天数
   d	月中的天数
   F	月份中的星期数
   E	星期中的天数
   a	am/pm标记
   H	一天中的小时数(0-23)
   k	一天中的小时数(1-24)
   K	am/pm中的小时数(0-11)
   h	am/pm中的小时数(1-12)
   m	小时中的分钟数
   s	分钟中的秒数
   S	毫秒数
   z、Z	时区
   ```
   */
  function dateFormat(date: Date | number, text: string): string;
  /**
   * 格式化字符串输出
   * @param param 要输出的内容
   * @param argN 格式化输出的参数
   * @returns 返回传入的第一个参数
   * @see {@link https://www.cnblogs.com/zhongjunbo555/p/11383159.html}
   ```
   $.log([1,2,3]); //"[1,2,3]"( 相当于log($.stringify([1,2,3])) )
   $.log("%s","hello"); //"hello"
    
   //可以用以下方式方便地进行log
   function test(text){ return text};
   let text = $.log(test("hello"));
   ```
   */
  function log(param: any, ...argN): any;
}
type $$ = {
  /**
   * 生成用于新开页面的 url 字符串。
   * @param func 新开页面后要执行的函数（一般是设置页面内容）
   * @param argN
   * @returns 此方法实际上返回了下面这段代码的值
   ```
   url + "@rule=js:" + $.toString(func,arg1,...,argN)

   let url='http://a.com';
   let test=$(url).rule(param=>{//url留空时，默认为"hiker://empty"
     log(input); //"http://a.com"(在func函数中input的值默认为url的值)
     setResult([{
       title: param,
       url: input//可以嵌套使用$().ruel()
     }]);
   },1);
   
   log(test);//"http://a.com@rule=js:(param=>{......})(1)"
   
   //下面两种用法效果相同
   let test2=url+$('').rule();
   let test3=$(url).rule();
   log(test2); //"http://a.com@rule=js:"
   log(test3); //"http://a.com@rule=js:"
   ```
   */
  rule: (func: (...argN) => string | urls, ...argN) => string;
  /**
   * 生成动态解析的url字符串
   * @param func 用于处理解析获得的链接的函数
   * @param 向func函数传入的参数
   * @returns 此方法实际上返回了下面这段代码的值
   ```
   url + "@lazyRule="+param+".js:" + $.toString(func,arg1,...,argN)

   let url='http://a.com';
   let test=$(url,"body&&a").lazyRule(param=>{//url留空时，默认为"hiker://empty"
     log(input); //"http://a.com"(在func函数中input的值默认为url解析后的值)
     return "hiker://empty"; //此方法必须有返回值，而且不能嵌套lazyRule
   },1);
   
   log(test); //"http://a.com@lazyRule=param.js:(arg1=>{......})(1)"
   
   //下面两种用法效果相同
   let test2=url+$('').lazyRule();
   let test3=$(url).lazyRule();
   log(test2); //"http://a.com@lazyRule=.js:"
   log(test3); //"http://a.com@lazyRule=.js:"
   ```
   */
  lazyRule: (func: (...argN) => undefined, ...argN) => string;
  /**
   * 生成浏览器环境下的动态解析url链接。用法同lazyRule，但是只能在浏览器环境(多为x5组件)中使用。
   * @param func 用于处理解析获得的链接的函数
   * @param 向func函数传入的参数
   * @returns 此方法实际上返回了下面这段代码的值
   * @see {@link $$.lazyRule}
   */
  x5LazyRule: (func: (...argN) => undefined, ...argN) => string;
  /**
   * 为解决lazyRule等无法嵌套使用的问题，而将字符串进行base64编解码
   * @param quote 默认为'\"'，一般无须加参数
   ```
   let url='http://a.com';
   let test=$(url).b64().lazyRule(()=>{
     return "hiker://empty";
   });
   
   log(test); //"http://a.com@lazyRule=.js:eval(base64Decode  (\"KAooKSA9PiB7CiAgICByZXR1cm4gImhpa2VyOi8vZW1wdHkiOwp9CikoKQ==\"))"
   
   //下面两种用法效果相同
   let test2=url+$('').b64().lazyRule();
   let test3=$(url).b64().lazyRule();
   log(test2); //"http://a.com@lazyRule=.js:eval(base64Decode(\"\"))"
   log(test3); //"http://a.com@lazyRule=.js:eval(base64Decode(\"\"))"
   ```
   */
  b64: (quote: string) => $$;
  /**
   * 在当前页面x5组件中或跳转浏览器页面后，执行一段代码
   * @param func 要执行的函数
   * @param argN 向func函数传入的参数
   ```
   let url='http://a.com';
   let test1=$(url).x5Rule(()=>{//刷新当前页面x5组件链接
     console.log(url);
   });
   let test2=$('').x5Rule(()=>{//跳转浏览器页面
     console.log('hello');
   });
   
   log(test1); //"x5WebView://javascript:var input=url;(()=>{console.log(url);})()"
   log(test2); //"javascript:var input='';(()=>{console.log(\"hello\");})()"
   ```
   */
  x5Rule: (func: (...argN) => undefined, ...argN) => string;
  /**
   * 生成弹出输入框的url链接
   * @param param1 $方法中第一个参数，默认填充内容
   * @param param2 $方法中第一个参数，提示信息
   * @param func 处理输入内容的函数
   * @param argN 向func函数传入的参数
   * @returns 此方法实际上返回了下面这段代码的值
   ```
   "input://"+JSON.stringify({"value":param1,"hint":param2,js:$.toString(func,arg1,...,argN)})

   let test=$("内容","请输入").input(()=>{
     return "toast://你输入的是"+input; //在func函数中input表示输入的内容
   });
   
   log(test);//'input://{"value":"内容","hint":"请输入","js":"(()=>{return "toast://你输入的是"+input;})()"}'
   ```
   */
  input: (func: (...argN) => string, ...argN) => string;
  /**
   * 生成弹出确认框的url链接
   * @param param $方法中的参数，提示信息
   * @param func 点击"确定"后执行的函数
   * @param argN 向func函数传递的参数
   * @returns 此方法实际上返回了下面这段代码的值
   ```
   "confirm://"+param+".js"+:$.toString(func,arg1,...,argN)

   let test=$("是否确认？").confirm(()=>{
     return "toast://你点击了确定";
   });
   
   log(test);//'input://是否确认.js:(()=>{return "toast://你输入的是"+input;})()'
   ```
   */
  confirm: (func: (...argN) => string, ...argN) => string;
  /**
   * 生成弹出确认框的url链接
   * @param param1 $方法中的第一个参数，选项数组
   * @param param2 $方法中的第二个参数，列数
   * @param param3 $方法中的第三个参数，标题
   * @param func 选择后执行的函数
   * @param argN 向func函数传递的参数
   * @returns 此方法实际上返回了下面这段代码的值
   ```
   "select://"+JSON.stringify({"options":param1,"col":param2,"title":param3,js:$.toString(func,arg1,...,argN)})

   let test=$(["选项1","选项2"],2,"请选择").select(()=>{
     return "toast://你选择的是"+input; //在func函数中input表示选择的选项内容
   });
   
   log(test);//'input://{"options":"["选项1","选项2"]","col":"2","title":"请选择","js":"(()=>{return "toast://你选择的是"+input;})()"}'
   ```
   */
  select: (func: (...argN) => string, ...argN) => string;
  /**
   * 生成网页资源嗅探(x5)的url链接
   * @param url $方法中的参数，要嗅探的网页链接
   * @param func 嗅探所使用的函数
   * @param argN 向func函数传递的参数
   * @returns 此方法实际上返回了下面这段代码的值
   ```
   "x5Rule://"+url+"@"+$.toString(func,arg1,...,argN)})

   let test=$("http://a.com").x5Lazy(()=>{
     return url; //url是嗅探得到的视频链接
   });
   
   log(test);//'x5Rule://http://a.com@(()=>{return url;})()'
   ```
   */
  x5Lazy: (func: (...argN) => string, ...argN) => string;
  /**
   * 生成网页资源嗅探(Webkit)的url链接，用法同x5Lazy，只是所用内核不同
   * @param url $方法中的参数，要嗅探的网页链接
   * @param func 嗅探所使用的函数
   * @param argN 向func函数传递的参数
   * @returns 此方法实际上返回了下面这段代码的值
   * @see {@link $$.x5Lazy}
   */
  webLazy: (func: (...argN) => string, ...argN) => string;
};
/**
 * @see {@link https://www.yuque.com/u537126/kb/oq16z4}
 * @see {@link https://docs.189.tyrantg.com/docs/$/static_property.html}
 */
declare function $(param1?: string, param2?: string, param3?: string): $$;
//#endregion

//#region 官方帮助手册补充 API（来自 App 内置开发者手册 help_*.json）

/**
 * 预先返回优先显示的部分结果（与 setResult 成对使用，先 setPreResult 后 setResult）。
 * 常用于顶部固定按钮秒开 + 底部网络请求结果。
 */
declare function setPreResult(layouts: layout[]): void;

/**
 * 存储全局对象（任意类型：字符串/数值/对象/数组）。
 * @see {@link storage0} 用法相同；globalMap0 支持 hasVar
 */
declare namespace globalMap0 {
  function putVar(key: string, value: any): undefined;
  function getVar(key: string, defaultValue?: any): any;
  function clearVar(key: string): undefined;
  function hasVar(key: string): boolean;
  function putMyVar(key: string, value: any): undefined;
  function getMyVar(key: string, defaultValue?: any): any;
}

/**
 * 后台执行 webRule 的代码（同步阻塞，对应 webRule://url@JS）。
 * @param url 要加载的网页地址
 * @param js 执行的 JS 代码字符串，结尾返回需要的内容；非空即结束返回，否则每 250ms 重试
 * @param options {ua, blockRules, timeout(默认30000), checkTime(默认250)}
 */
declare function executeWebRule(url: string, js: string, options?: object): string;

/**
 * 智能加载解析小说正文（封装了 setResult 回调）。
 * 子页面正文规则写 js: loadReadContentPage(MY_PARAMS.u) 即可。
 */
declare function loadReadContentPage(url?: string, options?: object): undefined;

/**
 * 获取当前页面正文内容和下一页地址（被 loadReadContentPage 使用，Readability 提取）。
 */
declare function getReadContentData(url?: string, options?: object): { content: string; nextUrl?: string };

/**
 * 刷新播放地址（立即生效）。
 * @param url 完整视频地址（含 header）或多线路对象 {urls, names}
 * @param restart true=重新获取记忆进度重新播放，false=接着当前进度
 */
declare function refreshVideoUrl(url: string | object, restart: boolean): undefined;

/**
 * 自动缓存页面（配合 #autoCache# 标识）；从缓存渲染页面之前执行：
 * @example cacheCode($.toString((t)=>{ putVar('a', t) }, t))
 */
declare function cacheCode(code: string | (() => any)): undefined;

/**
 * 缓存远程文件 N 小时，只缓存不执行 eval。
 * @see {@link requireCache} 用法相同但会 eval 执行
 */
declare function fetchCache(url: string, hours: number): string;
declare const fc: typeof fetchCache;

/**
 * EPUB 开放接口：解析章节目录
 * @example let c = getEpubChapters(path); c[0].title + '-' + c[0].url
 */
declare function getEpubChapters(path: string): { title: string; url: string }[];

/**
 * EPUB 开放接口：获取章节正文（图片自动识别；正文用 rich_text 加载，可配 #readTheme#/#autoPage#）
 */
declare function getEpubContent(path: string, chapterUrl: string): string;

/**
 * EPUB 开放接口：获取更多元信息
 */
declare function getEpubMetadata(path: string): object;

/**
 * WebDav 开放接口
 * @example let webdav = buildWebDav('http://xxx/dav', user, password); let list = JSON.parse(webdav.list());
 */
declare function buildWebDav(url: string, user: string, password: string): {
  list: () => string;
  download: (name: string, path: string) => undefined;
  upload: (name: string, path: string) => undefined;
  delete: (name: string) => undefined;
  makeDir: (name: string) => undefined;
};

/**
 * 生成加密代码（设置->开发者模式可得到加密后的代码）。
 * 加密代码不要引用非顶层作用域的变量；用 evalPrivateJS(code) 运行。
 */
declare function getPrivateJS(code: string): string;

/**
 * 弹出下拉选择框（不会阻塞页面，js 代码可异步）。
 * @example showSelectOptions({title: '选择', options: ['一','二'], col: 3, js: "'toast://你点击的是'+input"})
 * 带图标后只能两列；bottom 显示在底部；js 里可用 MY_INDEX 获取点击索引
 */
declare function showSelectOptions(options: { title?: string; options: (string | { title: string; icon: string })[]; col?: number; js: string; selectedIndex?: number; bottom?: boolean; attachView?: boolean }): undefined;

/**
 * 打开第三方软件
 * @param pkg 包名
 * @param activity activity class
 * @param params {intentData 等额外参数}
 */
declare function openAppIntent(pkg: string, activity: string, params?: object): undefined;

/**
 * 生成二维码（true=展示输入框允许修改）。
 * @see {@link createQRCodeToFile} 生成到文件返回路径
 */
declare function createQRCode(text: string, showInput?: boolean): undefined;

/**
 * 生成二维码到文件，返回文件路径（可放图片属性显示）。
 */
declare function createQRCodeToFile(text: string): string;

/**
 * 跳转二维码扫描界面
 */
declare function startQRScanPage(): undefined;

/**
 * 分享文件夹（主要用于小程序合集包 .hkpkg/.hk合集.zip）。
 * 第二参数不传默认文件名为文件夹名称.hk合集.zip
 */
declare function shareDirectory(path: string, name?: string): undefined;

/**
 * 提交规则到云仓库（会弹窗征求用户同意）。
 */
declare function publishRule(rule: object | object[]): undefined;

/**
 * 初始化 Python（chaquopy）支持，参数为 chaquopy 框架 assets 打包的 apk 路径
 */
declare function initChaquopy(apkPath: string): undefined;

/**
 * 判断链接地址是不是音视频（关键词匹配 + 用户嗅探规则）
 */
declare function isVideoOrMusic(url: string): boolean;

/**
 * 关闭当前窗口所有页面直到回到首页
 */
declare function backToHome(): undefined;

/**
 * 当前搜索关键词（仅搜索页面可用）
 */
declare const MY_KEYWORD: string;
/**
 * 当前分类名称/替换词（仅首页且规则写了替换词时可用）
 */
declare const MY_CLASS_NAME: string;
declare const MY_CLASS_URL: string;
/**
 * 当前年代名称/替换词
 */
declare const MY_YEAR_NAME: string;
declare const MY_YEAR_URL: string;
/**
 * 当前地区名称/替换词
 */
declare const MY_AREA_NAME: string;
declare const MY_AREA_URL: string;
/**
 * 当前排序名称/替换词
 */
declare const MY_SORT_NAME: string;
declare const MY_SORT_URL: string;

/**
 * 同步请求（网页桥接 fy_bridge_app 内；页面加载完成后才可用，立即使用用 request00）
 */
declare function request00(url: string, options?: object): string;

//#endregion
