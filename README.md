# hiker-mcp

海阔视界规则编辑器 MCP Server。让 AI 助手（Claude Desktop / Cursor / Trae / Codex 等）直接读写海阔视界 App 中的规则与 JS 插件。

## 功能

### Tools（工具）
| 工具 | 说明 |
|------|------|
| `list_rules` | 获取 App 中所有规则标题 |
| `get_rule` | 获取指定规则的完整内容（JSON） |
| `save_rule` | 保存规则到 App（自动序列化 pages） |
| `validate_rule` | 校验规则结构与 JS 代码语法 |
| `format_rule_code` | Prettier 格式化规则代码 |
| `list_js_plugins` | 获取 App 中所有 JS 插件 |
| `get_js_plugin` | 获取 JS 插件代码 |
| `save_js_plugin` | 保存 JS 插件 |
| `format_js_code` | 格式化 JS 插件代码 |
| `get_rule_docs` | 读取规则编写文档（hiker-help 官方手册 / blueprint 模板手册 / video-template 视频源模板 等） |
| `get_connection_status` | 查看当前连接状态 |
| `share_rule_paste` | 未连接 App 时，把规则发送到云剪贴板（pasteme.tyrantg.com），返回 `云6oooole/xxxxxx/{path}` 分享链接，复制到手机即可导入 |

### 官方文档体系（写源参考顺序）
| 文档 | get_rule_docs 选项 | 用途 |
|------|------------------|------|
| **官方帮助手册** | `hiker-help` | App 内置开发者手册整合：JS API / 链接协议 / 选择器 / col_type 字典 / 标识 / 网页桥接 —— **通用标准** |
| **写源模板手册** | `blueprint` | 基于 361 条真实规则实证的模板：主页/分类/二级/详情/解析怎么写 —— **AI 写源必读** |
| **视频源写源模板** | `video-template` | 模块化框架（顶层 JSON + 子页面模块 + 多线路选集），**★ 写视频源/视频小程序优先使用** |
| API 类型声明 | `hiker-dts` | hiker.d.ts 全部引擎 API |
| 原生源格式参考 | `source-formats` | 基于 361 真实规则分析的格式参考 |
| 青豆框架指南 | `qingdou-guide` | ★ 仅写青豆规则（var Rule 风格）时参考 |
| 青豆 SKILL | `qingdou-skill` | ★ 仅写青豆规则时参考 |
| 代码片段建议 | `suggestions` | 编辑器内置补全建议 |
| 一行大 JSON 详解 | `save-format` | pages（子页面）序列化与导入转化 |

### Resources（资源，AI 按需读取）
- `hiker://docs/hiker-help` — **官方帮助手册**（App 内置开发者手册整合：JS API/链接协议/选择器/col_type/标识/网页桥接）
- `hiker://docs/source-blueprint` — **写源模板手册（AI 写源必读）**
- `hiker://docs/video-template` — **视频源写源模板**（模块化框架 + 多线路选集，**写视频源优先使用**）
- `hiker://docs/qingdou-guide` — 青豆框架规则编写指南（仅写青豆规则时参考）
- `hiker://docs/qingdou-skill` — 青豆 SKILL 文档（仅写青豆规则时参考）
- `hiker://docs/suggestions` — 代码片段建议
- `hiker://docs/hiker-dts` — 海阔视界 API 类型声明
- `hiker://docs/source-formats` — 基于 361 真实规则分析的原生源格式参考
- `hiker://docs/save-format` — 「一行大 JSON」导入与 pages（子页面）序列化详解

> 写源参考已由「官方帮助手册 + 写源模板手册 + 视频源写源模板」完整覆盖，可直接让 AI 按模板生成。

### Prompts（提示词）
- `create_rule` — 引导 AI 编写新规则（强制先读官方帮助手册 + 模板手册，再照抄模板）
- `fix_rule` — 引导 AI 修复规则（先读模板手册对照排查）

## 安装

```bash
cd hiker-mcp
npm install
```

## 配置

### 1. 服务运行配置 `config/mcp.json`

本项目唯一的运行配置文件，控制如何连接你的海阔视界 App。
不存在时复制 `config/mcp.example.json` 为 `config/mcp.json` 后编辑：

```json
{
  "hosts": ["192.168.1.100", "192.168.1.[50-249]"],
  "port": 52020,
  "timeout": 10000,
  "scanConcurrency": 20
}
```

| 字段 | 说明 |
|------|------|
| `hosts` | 海阔视界 App 的地址列表，支持三种格式（见下），启动时自动探测第一个可用的 |
| `port` | App 监听端口（海阔视界默认 **52020**） |
| `timeout` | 请求超时（毫秒），默认 10000 |
| `scanConcurrency` | 探测 IP 段时的并发数，默认 20 |

`hosts` 支持三种格式：
- 精确 IP：`192.168.1.100`
- IP 段：`192.168.1.[50-249]`
- 通配符：`192.168.1.*`

不配置 `config/mcp.json` 时使用默认值 `["192.168.1.100"]:52020`。

> ⚠️ 注意：`config/mcp.json` 是**本服务运行配置**；`claude_desktop_config.json` 是
> **MCP 客户端接入配置**（见下方「接入 MCP 客户端」），两者不是同一个文件。
> `config/mcp.json` 含你的局域网信息，已加入 .gitignore 不会提交。

## 使用

### 独立扫描可用地址

```bash
node src/scan.js 192.168.1.[50-249]
```

### 接入 MCP 客户端

以 Claude Desktop 为例，编辑 `claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "hiker-mcp": {
      "command": "node",
      "args": ["/绝对路径/hiker-mcp/src/index.js"]
    }
  }
}
```

### 未连接 App 时分享规则（云剪贴板）

未连接手机 App 时，写好的源可用 `share_rule_paste` 发送到云剪贴板
（[pasteme.tyrantg.com](https://pasteme.tyrantg.com)），返回可导入的分享链接：

```
📋 分享链接（复制到海阔视界 App 即可导入）：
云6oooole/xxxxxx/hvk5wcbi7hmsuc6n
🌐 网页格式：https://pasteme.tyrantg.com/xxxxxx/hvk5wcbi7hmsuc6n
```

规则自动打包成海阔口令 `海阔视界规则分享，当前分享的是：小程序￥home_rule_v2￥base64://@规则名@base64(JSON)`
后上传；链接为公开内容（无密码），请勿分享隐私数据。

### 局域网模式（显示内网地址）

```bash
npm start          # 等价于 node src/index.js --http --lan
```

启动后控制台会打印所有可用地址（本机 + 局域网 IP 列表），同一局域网内的其他设备
（如另一台电脑）可将 MCP 客户端指向内网地址：

```
[hiker-mcp] MCP 客户端可用地址:
  http://127.0.0.1:3000/mcp        本机访问（MCP 客户端 URL）
  http://192.168.1.100:3000/mcp    内网访问（同一局域网设备可用）
  健康检查: http://127.0.0.1:3000/health
```

也可用 `npm run serve`（与 `npm start` 相同），或保持仅本机可访问的 `node src/index.js --http`。

### 内网穿透（公网地址）

```bash
npm run tunnel     # 等价于 node src/index.js --http --lan --tunnel
```

自动检测本机已安装的穿透工具并建立公网隧道，启动后打印公网 URL：

- **cloudflared**（推荐，免费免注册）→ `https://xxx.trycloudflare.com`
- **ngrok**（需注册 token）→ `https://xxx.ngrok-free.app`
- **localtunnel**（Node 自带 npx 自动拉取，免费）→ `https://xxx.loca.lt`
- **cpolar**（国内服务）→ `https://xxx.cpolar.cn`

```bash
npm run tunnel:cloudflared   # 指定用 cloudflared
node src/index.js --http --tunnel ngrok   # 指定用 ngrok
```

拿到公网地址后，远程 MCP 客户端（支持 Streamable HTTP 的即可）配置
`https://xxx.trycloudflare.com/mcp` 即可远程访问。健康检查：`/health`。

> ⚠️ 公网暴露无鉴权，请仅在信任环境短期使用，用完即关。

### 仅本机使用（stdio）

Claude Desktop / Cursor / Trae 等本地客户端仍推荐 stdio 模式：
`npm run stdio`（等价于直接 `node src/index.js`）。

## 测试

```bash
npm test
```

测试覆盖两种模式：
- **stdio 模式**：完整 MCP 握手（initialize → initialized → tools/list → resources/list → 工具调用）
- **HTTP 模式**：会话 ID 生成、多请求复用、无会话请求返回 400、DELETE 关闭会话

手动测试 stdio 模式（模拟 MCP 客户端）：

```bash
printf '%s\n' \
'{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"t","version":"1"}}}' \
'{"jsonrpc":"2.0","method":"notifications/initialized"}' \
'{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' \
| node src/index.js
```

手动测试 HTTP 模式：

```bash
# 1. 健康检查
curl http://127.0.0.1:3000/health

# 2. 初始化（响应头含 Mcp-Session-Id）
curl -i -X POST http://127.0.0.1:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"curl","version":"1"}}}'

# 3. 带上会话 ID 调用工具
curl -N -X POST http://127.0.0.1:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Mcp-Session-Id: <上一步返回的ID>" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

## 目录结构

```
hiker-mcp/
├── src/
│   ├── index.js          # MCP Server 入口
│   ├── config.js         # 配置与 IP 段展开
│   ├── hiker-api.js      # 海阔视界 HTTP API 封装
│   ├── scan.js           # 独立 IP 扫描脚本
│   ├── resources.js      # MCP Resources
│   ├── prompts.js        # MCP Prompts
│   └── tools/
│       ├── rules.js      # 规则工具
│       ├── js-plugins.js # JS 插件工具
│       ├── examples.js   # 规则文档工具（get_rule_docs，读官方帮助/模板）
│       └── format.js     # 格式化与校验
├── docs/                 # 官方帮助手册整合、写源模板手册、青豆框架文档与 hiker.d.ts
├── test/                 # 测试（stdio + HTTP 双模式）
└── config/               # 运行配置（mcp.json 实际配置 / mcp.example.json 示例模板，mcp.json 不提交）
```

## 与浏览器插件的关系

- 浏览器插件（hiker-web-edit）通过 `chrome.runtime.sendMessage` 代理请求解决 CORS
- 本 MCP Server 是 Node.js 进程，无 CORS 限制，直接访问 App 的 HTTP API
- 两者可共存：插件负责图形化编辑，MCP Server 让 AI 直接读写规则

## 安全提示

- App 的 HTTP API 无鉴权，仅在局域网内可用
- HTTP 模式（`--http`）默认只监听 `127.0.0.1`，仅本机可访问
- `--lan` 模式监听 `0.0.0.0`，局域网内任何设备都可访问——仅在可信局域网使用
- `npm run tunnel` 的公网隧道**无鉴权**，任何拿到 URL 的人都能调用你的 MCP 工具
  （等同于能操控你电脑上的规则读写），请勿长期开放，用完即关
- 公网/局域网模式下，建议配合防火墙、VPN 或在可信环境短期使用
