#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { loadConfig } from './config.js';
import { discoverHost, getCurrentHost } from './hiker-api.js';
import { registerRuleTools } from './tools/rules.js';
import { registerJsPluginTools } from './tools/js-plugins.js';
import { registerExampleTools } from './tools/examples.js';
import { registerPasteShareTools } from './tools/paste-share.js';
import { registerMemoryTools } from './tools/memory.js';
import { registerResources } from './resources.js';
import { registerPrompts } from './prompts.js';
import { formatAccessUrls } from './net-utils.js';

/**
 * 海阔视界规则编辑器 MCP Server
 *
 * 启动方式：
 *   node src/index.js                    stdio 模式（默认，供 Claude Desktop / Cursor 等使用）
 *   node src/index.js --http             Streamable HTTP 模式（默认监听 127.0.0.1）
 *   node src/index.js --http --lan       HTTP 模式 + 监听 0.0.0.0，打印局域网地址（npm start）
 *   node src/index.js --http --tunnel    HTTP 模式 + 内网穿透，打印公网地址（npm run tunnel）
 *     可指定隧道: --tunnel cloudflared / ngrok / localtunnel / cpolar（默认 auto 自动选择）
 *   环境变量: HIKER_MCP_PORT（端口，默认 3000）、HIKER_MCP_HOST（监听地址，优先级高于 --lan）
 */

/**
 * 创建 MCP Server 实例（工厂函数）。
 * HTTP 模式下每个会话使用独立实例，避免 Protocol 单 transport 限制。
 */
function createMcpServer() {
  const server = new McpServer({
    name: 'hiker-mcp',
    version: '0.1.0',
  });

  // 注册工具
  registerRuleTools(server);
  registerJsPluginTools(server);
  registerExampleTools(server);
  registerPasteShareTools(server);
  registerMemoryTools(server);

  // 注册资源与提示词
  registerResources(server);
  registerPrompts(server);

  // 连接状态工具
  server.tool(
    'get_connection_status',
    '获取当前连接的海阔视界 App 地址与配置信息',
    {},
    async () => {
      try {
        const host = await discoverHost();
        const cfg = loadConfig();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  connected: true,
                  host,
                  port: cfg.port,
                  apiBase: `http://${host}:${cfg.port}`,
                  configuredHosts: cfg.hosts,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (e) {
        return {
          content: [{ type: 'text', text: `未连接: ${e.message}` }],
          isError: true,
        };
      }
    }
  );

  return server;
}

async function main() {
  const args = process.argv.slice(2);
  const useHttp = args.includes('--http');
  const useLan = args.includes('--lan');
  const tunnelFlag = args.indexOf('--tunnel');
  const tunnelType = tunnelFlag >= 0 ? (args[tunnelFlag + 1] && !args[tunnelFlag + 1].startsWith('--') ? args[tunnelFlag + 1] : 'auto') : null;
  const port = Number(process.env.HIKER_MCP_PORT || 3000);
  const host = process.env.HIKER_MCP_HOST || (useLan ? '0.0.0.0' : '127.0.0.1');
  const lan = host === '0.0.0.0';

  if (useHttp) {
    // 有状态模式：按 Mcp-Session-Id 维护 transport 映射，支持多客户端并发
    const { randomUUID } = await import('node:crypto');
    const transports = new Map();

    const http = await import('node:http');
    const serverHttp = http.createServer(async (req, res) => {
      if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, host: getCurrentHost() }));
        return;
      }
      try {
        const sessionId = req.headers['mcp-session-id'];

        // 读取并解析请求体（SDK 的 handleRequest 支持直接传入 parsedBody）
        let parsedBody;
        if (req.method === 'POST') {
          const raw = await new Promise((resolve) => {
            let data = '';
            req.on('data', (c) => (data += c));
            req.on('end', () => resolve(data));
          });
          try {
            parsedBody = JSON.parse(raw);
          } catch {
            // 交给 SDK 返回 Parse error
          }
        }

        // 客户端主动关闭会话（DELETE）
        if (req.method === 'DELETE') {
          if (sessionId && transports.has(sessionId)) {
            const t = transports.get(sessionId);
            await t.handleRequest(req, res);
          } else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '无效或缺失的会话 ID' }));
          }
          return;
        }

        // 已有会话：复用 transport
        if (sessionId && transports.has(sessionId)) {
          const transport = transports.get(sessionId);
          await transport.handleRequest(req, res, parsedBody);
          return;
        }

        // 无 sessionId：必须是 initialize 请求，否则按规范返回 400
        if (!isInitializeRequest(parsedBody)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              jsonrpc: '2.0',
              error: { code: -32000, message: 'Bad Request: 缺少 Mcp-Session-Id 或请求不是 initialize' },
              id: null,
            })
          );
          return;
        }

        // 新会话：创建独立 server + transport，会话生成后注册到映射
        const server = createMcpServer();
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: randomUUID,
          onsessioninitialized: (sid) => {
            transports.set(sid, transport);
          },
        });
        transport.onclose = () => {
          const sid = transport.sessionId;
          if (sid && transports.has(sid)) transports.delete(sid);
        };
        await server.connect(transport);
        await transport.handleRequest(req, res, parsedBody);
      } catch (e) {
        console.error('[hiker-mcp] HTTP 请求处理失败:', e);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
      }
    });
    serverHttp.listen(port, host, () => {
      console.error(`[hiker-mcp] Streamable HTTP 模式已启动（监听 ${host}:${port}）`);
      console.error(`[hiker-mcp] MCP 客户端可用地址:`);
      for (const line of formatAccessUrls({ port, lan })) console.error(line);

      // 内网穿透：生成公网地址
      if (tunnelType) {
        import('./tunnel.js')
          .then(async ({ startTunnel }) => {
            const { type, url, proc } = await startTunnel({ port, type: tunnelType });
            console.error(`[hiker-mcp] ★ 公网隧道已建立（${type}）:`);
            console.error(`[hiker-mcp]   ${url}/mcp   远程 MCP 客户端 URL`);
            console.error(`[hiker-mcp]   ${url}/health  远程健康检查`);
            proc.on('exit', () => console.error('[hiker-mcp] 隧道已断开，MCP 服务仍在本地运行'));
          })
          .catch((e) => console.error(`[hiker-mcp] 内网穿透启动失败: ${e.message}`));
      }
    });
  } else {
    const server = createMcpServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('[hiker-mcp] stdio 模式已启动');
    // 后台探测可用 host（不阻塞启动）
    discoverHost()
      .then((h) => console.error(`[hiker-mcp] 已连接海阔视界 App: ${h}`))
      .catch((e) => console.error(`[hiker-mcp] 连接提示: ${e.message}`));
  }
}

main().catch((e) => {
  console.error('[hiker-mcp] 启动失败:', e);
  process.exit(1);
});
