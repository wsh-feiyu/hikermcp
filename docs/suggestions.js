/**
 * 自定义代码片段
 */
export const SNIPPET = [
  {
    label: 'js:',
    insertText: `js:
/** @type layout[] */
let layouts = [];
const html = getResCode();
log(html);
//let json = JSON.parse(getResCode());
\$0
setResult(layouts);`,
    detail: 'js规则起手式',
    documentation: `js:
/** @type layout[] */
let layouts = [];
const html = getResCode();
log(html);
//let json = JSON.parse(getResCode());

setResult(layouts);`,
  },
  {
    label: 'for',
    insertText: `for (let \${1:i} = 0; \${1:i} < \${2:array}.length; \${1:i}++) {
  let \${3:data} = \${2:array}[\${1:i}];
  \$0
}`,
    detail: '普通 for 循环',
    documentation: `for (let i = 0; i < array.length; i++) {
  let data = array[i];

}`,
  },
  {
    label: 'forof',
    insertText: `for (let data of \${1:array}) {
  \$0
}`,
    detail: 'for-of(遍历数组推荐)',
    documentation: `for (let data of array) {
 
}`,
  },
  {
    label: 'forin',
    insertText: `for (let key in \${1:object}) {
  let data = \${1:object}[key];
  \$0
}`,
    detail: 'for-in(遍历对象推荐)',
    documentation: `for (let key in object) {
  let data = object[key];

}`,
  },
];

/**
 * 资源标识
 * https://docs.189.tyrantg.com/docs/hikerview/help_tag.html
 */
export const RESOURCE_INDENTIFIER = [
  {
    label: '#noLoading#',
    detail: '不显示loading弹窗，请求时会自动删除该标识，仅做标识用',
    documentation: `示例：a&&href.js:input+'#noLoading#@lazyRule=.js:input'`,
  },
  {
    label: '#noHistory#',
    detail: '不要记录足迹，请求时会自动删除该标识，仅做标识用',
    documentation: '说明：可以用在页面 url 或者按钮 url 里面',
  },
  {
    label: '#noRecordHistory#',
    detail: '不要记录历史记录，请求时会自动删除该标识，仅做标识用',
    documentation: '说明：页面 url 加上 #noRecordHistory#，那么进入该页面就会不记录历史记录',
  },
  {
    label: '#ignoreVideo=true#',
    detail: '强制识别为非视频资源，请求时会自动删除该标识，仅做标识用',
    documentation: '',
  },
  {
    label: '#isVideo=true#',
    detail: '强制识别为视频资源，请求时会自动删除该标识，仅做标识用',
    documentation: '',
  },
  {
    label: '#ignoreImg=true#',
    detail: '强制识别为非图片资源，请求时会自动删除该标识，仅做标识用',
    documentation: '',
  },
  {
    label: '#isMusic=true#',
    detail: '强制识别为音频资源，请求时会自动删除该标识，仅做标识用',
    documentation: '',
  },
  {
    label: '#ignoreMusic=true#',
    detail: '强制识别为非音频资源，请求时会自动删除该标识，仅做标识用',
    documentation: '',
  },
  {
    label: '#immersiveTheme#',
    detail: '标记为沉浸式页面，请求时会自动删除该标识，仅做标识用',
    documentation: '说明：顶部标题栏不占用空间，只能用于二级和子页面，不支持首页',
  },
  {
    label: '#fullTheme#',
    detail: '标记为全屏页面，请求时会自动删除该标识，仅做标识用',
    documentation: '说明：只能用于二级和子页面，不支持首页',
  },
  {
    label: '#readTheme#',
    detail: '标记为阅读模式，请求时会自动删除该标识，仅做标识用',
    documentation: `说明：常用于电子书正文页，该模式下支持点击翻页、音量键翻页、进度记忆

正文列表项：{col_type:'rich_text', extra: {click: true}}，即点击/音量上下键翻页
      `,
  },
  {
    label: '#gameTheme#',
    detail: '标记为游戏模式，请求时会自动删除该标识，仅做标识用',
    documentation: '说明：常用于全屏游戏页面，操作菜单将显示在右上角，不显示状态栏',
  },
  {
    label: '#autoPage#',
    detail: '标记为自动翻页，请求时会自动删除该标识，仅做标识用',
    documentation:
      '使用场景：小说的章节页面每一项链接加上#autoPage#，不要包含fypage，然后点击章节进入详情页，详情页滚动到底部的时候会自动加载父级章节页下一章节的链接',
  },
  {
    label: '#autoCache#',
    detail:
      '自动缓存页面：给页面链接加上#autoCache#，达到下次进入页面时秒开的效果，可用于电子书章节目录等页面，请勿用于正文页面',
    documentation: `秒开原理：启动页面的时候会从缓存中判断是否有页面缓存，有的情况下先使用缓存显示界面，同时从网络加载，网络加载完成也会写入缓存，页面缓存在data/xxx/Documents/cache/pages下

只用缓存：页面链接使用#cacheOnly#（无需再加#autoCache#），那么一旦有缓存就不再使用网络加载，除非手动下拉刷新
    
如何更新缓存：无需规则手动管理，每次刷新、重新进入页面都会自动更新，也可以在软件的设置->更多功能设置里面清除缓存来删掉页面缓存
    
缓存key：使用页面链接和页面标题联合生成md5作为缓存文件名，因此请务必保证页面链接+页面标题唯一
    
自动清理策略：软件在启动时会自动删除超过15天没有更新的文件，并且最大保留200个缓存文件，超出的自动删除（优先删除旧的）
    
注意事项：仅缓存第一页，翻页之后的数据不会缓存
    
高级用法之缓存代码，用于从缓存渲染页面前执行，如：cacheCode($.toString((t)=>{ putVar('a', t) }, t))，那么显示缓存的时候假设列表项有一个x5组件，那么网页里面就能使用getVar获取到，参数可以是js字符串或者函数
    
高级用法之缓存代码：如果cacheCode返回了数组，那么会作为缓存显示内容，如：cacheCode(()=>{ return [{title:'来自cacheCode', col_type: 'text_1'}] })`,
  },
  {
    label: '#noRefresh#',
    detail: '标记为禁止下拉刷新，请求时会自动删除该标识，仅做标识用',
    documentation: '',
  },
  {
    label: '#background#',
    detail: '标记为后台播放音频，请求时会自动删除该标识，仅做标识用',
    documentation:
      '给页面链接加上#background#，启动页面的时候会自动在通知栏显示前台通知，尽可能保证软件不被杀后台，可用于当前页面X5中播放音频',
  },
  {
    label: '#pre#',
    detail:
      '强制预加载：默认预加载会执行两次，如果两次结果不一致那么会放弃预处理结果（因为这样的地址很可能有时效性），可以给链接加上#pre#强制保留预加载',
    documentation: '',
  },
  {
    label: '#noPre#',
    detail: '强制不要预加载：如果不希望预加载可以给链接加上#noPre#',
    documentation: '',
  },
  {
    label: '#originalSize#',
    detail:
      '强制让图片在大图缩放显示界面以原图尺寸加载，注意超大图片以原图加载可能导致软件崩溃，未加此标识软件默认会缩放显示（根据手机分辨率和图片大小）',
    documentation: '',
  },
];

/**
 * 路由跳转链接
 * https://docs.189.tyrantg.com/docs/hikerview/help_link.html
 */
export const LINK_ROUTE = [
  {
    label: 'hiker://files/',
    detail: '映射路径',
    documentation: `file:///storage/emulated/0/Android/data/com.example.hikerview/files/Documents/`,
  },
  {
    label: 'hiker://files/cache/video.m3u8',
    detail: '视频缓存映射路径',
    documentation: `file:///storage/emulated/0/Android/data/com.example.hikerview/files/Documents/cache/video.m3u8`,
  },
  {
    label: 'hiker://home',
    detail: '首页频道',
    documentation: `hiker://home@V电影，跳转频道名称为V电影的首页频道

hiker://home@V电影这种形式，仅支持小程序里面用，网页里面不支持跳转，hiker://home两者都支持
    
hiker://home@规则名支持补偿，如hiker://home@规则1||规则2||http://haikuoshijie.cn，那么会先找规则1，找不到找规则2，还找不到则进入网页`,
  },
  {
    label: 'hiker://bookmark',
    detail: '跳转书签页面',
    documentation: `小程序和网页里面均可以使用`,
  },
  {
    label: 'hiker://js',
    detail: '跳转网页插件管理页面',
    documentation: `仅支持小程序里面用，网页里面不支持跳转`,
  },
  {
    label: 'hiker://download',
    detail: '跳转下载中心',
    documentation: `小程序和网页里面均可以使用`,
  },
  {
    label: 'hiker://history',
    detail: '跳转历史记录页面',
    documentation: `小程序和网页里面均可以使用

高级用法：hiker://history?rule=xxx，显示指定规则的历史记录`,
  },
  {
    label: 'hiker://collection',
    detail: '跳转收藏页面',
    documentation: `小程序和网页里面均可以使用

hiker://collection?group=收藏分组名，可直接弹出该分组的收藏弹窗
    
高级用法：hiker://collection?rule=xxx，显示指定规则的收藏记录`,
  },
  {
    label: 'hiker://adUrl',
    detail: '跳转网址拦截管理页面',
    documentation: `仅支持小程序里面用，网页里面不支持跳转`,
  },
  {
    label: 'hiker://adRule',
    detail: '跳转元素拦截页面',
    documentation: `仅支持小程序里面用，网页里面不支持跳转`,
  },
  {
    label: 'hiker://setting',
    detail: '跳转设置页面',
    documentation: `仅支持小程序里面用，网页里面不支持跳转`,
  },
  {
    label: 'hiker://settingMore',
    detail: '跳转更多设置页面',
    documentation: `仅支持小程序里面用，网页里面不支持跳转`,
  },
  {
    label: 'hiker://search',
    detail: '跳转搜索关键词页面',
    documentation: `仅支持网页里面用，小程序里面不支持
hiker://search?s=测试，将会打开搜索弹窗，自动填充搜索的关键词“测试”，由用户自己选择分组和规则后搜索

hiker://search?s=测试&group=②影搜，将会打开搜索弹窗，自动填充搜索的关键词“测试”并且自动切换分组为“②影搜”，用户可切换分组和规则
    
hiker://search?s=测试&rule=海阔视界，将会直接跳转搜索结果界面，自动选择标题为“海阔视界”的规则进行搜索，并且该界面不可切换别的规则
    
hiker://search?s=测试&rule=海阔视界&simple=false，将会自动填充搜索的关键词“测试”，并且自动切换分组为“①推荐”、自动选中标题为“海阔视界”的规则，用户可切换分组和规则，并自动开始搜索`,
  },
  {
    label: 'hiker://empty',
    detail: '直接返回空字符串，',
    documentation: `比如需要在二级页面再用fetch去请求，不希望一进入二级就自动请求，那么可以这样：

hiker://empty#http://a.com@rule=js:fetch(MY_URL.split('#')[1],{})`,
  },
  {
    label: 'rule://',
    detail: 'rule://口令',
    documentation: `即完全编码的规则，当url为此形式时，点击即可识别口令，提示剪贴板检测到口令，是否立即导入

比如写一个类似规则仓库的规则，点击即可直接导入`,
  },

  {
    label: '海阔视界',
    detail: '海阔视界...',
    documentation: `即海阔视界开头的口令，只要url为海阔视界开头，那么视界将会把这个链接识别为口令，尝试解析并提示导入`,
  },
  {
    label: 'pics://',
    detail: 'pics://https://a.com/1.jpg&&https://a.com/2.jpg',
    documentation: `即pics://开头，后面为多张图片地址用&&连接

视界将会识别为多图模式（类似漫画），下拉会尝试执行下一集的动态解析，实现自动下一章`,
  },
  {
    label: 'javascript:',
    detail: '视界叫其彩蛋模式',
    documentation: `实际上就是一段javascript代码，类似电脑上存一段javascript书签，点击后视界会跳转浏览器执行后面的代码`,
  },
  {
    label: 'toast://',
    detail: 'toast://文本',
    documentation: `url为toast://开头，那么视界会提示后面的文本信息，比如toast://加载失败，请换源`,
  },
  {
    label: 'hiker://webdav',
    detail: '点击即可快速备份规则到webdav，前提必须先设置好webdav账号',
    documentation: ``,
  },
  {
    label: 'hiker://webRule',
    detail: '点击即可开启Web编辑规则模式',
    documentation: ``,
  },
  {
    label: 'hiker://debug',
    detail: '点击即可打开开发助手页面，用于放在首页按钮的链接上，点击即可快速跳转',
    documentation: ``,
  },
  {
    label: 'input://',
    detail: '弹出输入框',
    documentation: `自动获取剪贴板内容填充，{"value": ""}

input://{"value":"默认填充内容", "js": "'toast://你输入的是'+input", "hint": "提示信息"}`,
  },
  {
    label: 'confirm://',
    detail: '弹出确认框',
    documentation: `链接格式：confirm://提示信息.js:'toast://你点击了确认'`,
  },
  {
    label: 'copy://',
    detail: '复制文本',
    documentation: `链接格式：copy://要复制到剪贴板的内容.js:'http://1.com'，可以只copy://要复制到剪贴板的内容，不要后面的.js:xxx`,
  },
  {
    label: 'editFile://',
    detail: '进入编辑文件界面',
    documentation: `链接格式：editFile://hiker://files/file.txt`,
  },
  {
    label: 'openFile://',
    detail: '使用第三方软件打开文件',
    documentation: `链接格式：openFile://hiker://files/file.txt`,
  },
  {
    label: 'x5://',
    detail: '从二级页面跳转X5全屏显示',
    documentation: `链接格式：x5://http://a.com`,
  },
  {
    label: 'web://',
    detail: '跳转网页，忽略二级解析规则',
    documentation: `链接格式：web://http://a.com`,
  },
  {
    label: 'x5Play://',
    detail: '从二级强制调用X5播放器播放视频地址',
    documentation: `链接格式：x5Play://http://a.com/1.mp4`,
  },
  {
    label: 'select://',
    detail: '弹出下拉选择框',
    documentation: `用法：
  select://{"title": "选择性别", "options" : ["选项一", "选项二"], col: 3, js: "'toast://你点击的是' + input"}，col为列数，默认为3`,
  },
  {
    label: 'x5Rule://',
    detail: '网页资源嗅探X5',
    documentation: `链接格式：x5Rule://链接@JS代码
    
注意：现在推荐用webRule://链接@JS代码，格式一样只是不依赖X5内核

示例：
'x5Rule://' + parseDom(list[i], 'a&&href') + '@' + $.toString(() => {
    let div = document.querySelector("#playdiv audio");
    if (div != null) {
        return div.getAttribute("src")
    }
})

原理：点击按钮后视界会启动一个X5组件来加载链接，然后当页面加载完时会执行JS代码，完整的JS代码为视界会每隔250毫秒执行一下链接中的JS，获取返回值，一旦返回值不为空则表明获取到资源，然后自动销毁X5组件

注意：JS代码的设计如示例，获取到资源时返回资源地址，获取不到返回空，每隔250毫秒检测一次，30秒超时也会自动销毁X5组件

JS支持获取加载过的资源链接，fy_bridge_app.getUrls()或者window._getUrls()，前者为字符串后者为数组，自动添加header 手册搜索‘获取带header的视频地址’

打印日志方便调试：fy_bridge_app.log('msg')

高级用法：设置UA：只要在链接所在项使用extra属性，如{url: 'x5Rule://xxx', extra: {ua: PC_UA}} PC_UA是视界内置变量，也可以使用自定义的字符串

高级用法：设置Referer：只要在链接所在项使用extra属性，如{url: 'x5Rule://xxx', extra: {referer: 'http://test.cn'}}

拦截资源：{url: 'x5Rule://xxx', extra: {blockRules: ['baidu.*.png','.jpg']}}，拦截部分让网页更快加载，或者避免部分资源访问一次就失效`,
  },
  {
    label: 'webRule://',
    detail: '网页资源嗅探Webkit',
    documentation: `链接格式：webRule://链接@JS代码
    
用法和x5Rule://一致，webRule使用系统浏览器内核，而x5Rule使用腾讯Tbs X5内核`,
  },
  {
    label: 'download://',
    detail: '直接下载文件',
    documentation: `支持视频、音频、应用安装包APK`,
  },
  {
    label: 'share://',
    detail: '分享文件',
    documentation: `链接格式：share://hiker://files/a.txt
    
用户点击该元素后会提示用户分享到的应用，请确保文件存在`,
  },
  {
    label: 'fileSelect://',
    detail: '选择文件、上传文件',
    documentation: `链接格式：fileSelect://log(input)，即fileSelect://加JS代码，JS代码里面使用input变量获取文件路径

（该路径并非文件原始路径，因为系统限制非软件专属目录只能获取文件流，不能获取文件路径，因此软件会拷贝一份到内置目录，下次启动时自动删除，文件名会自动加一个_fileSelect_前缀）`,
  },
  {
    label: 'video://',
    detail: '自动提取视频',
    documentation: `链接格式：video://https://xxx.html

软件会直接进入播放器界面，并且自动提取网页中的视频地址，和悬浮嗅探原理一致，并且解析到多个视频地址会自动切换测试，直到找到能播放的地址
    
加快提取、增强提取示例
{url: 'video://https://xxx.html', extra: {blockRules: ['bb.*.png','.jpg']}}
// 和x5_webview_single样式一致

注入 JS：{url: 'video://https://xxx.html', extra: {js: 'console.log("我加载了")'}}，和x5_webview_single样式一致

自定义嗅探规则：{url: 'video://https://xxx.html', extra: {videoRules: ['videoType=1', 'video*m3u*.ts']}}，使用包含匹配，*代表任意字符

自定义排除嗅探规则：{url: 'video://https://xxx.html', extra: {videoExcludeRules: ['?url=']}}，匹配到的识别为非视频地址，使用包含匹配，*代表任意字符

缓存m3u8索引文件：{url: 'video://https://xxx.html', extra: {cacheM3u8: true}}
`,
  },
];
