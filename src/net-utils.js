import os from 'node:os';

/**
 * 获取本机所有局域网 IPv4 地址（排除回环 127.0.0.1 与内部接口）。
 * @returns {string[]} 如 ['192.168.1.100', '10.0.0.5']
 */
export function getLanIPv4s() {
  const result = [];
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const info of interfaces[name] || []) {
      const isV4 = info.family === 'IPv4' || info.family === 4;
      if (isV4 && !info.internal) result.push(info.address);
    }
  }
  // 去重并保持稳定顺序
  return [...new Set(result)];
}

/**
 * 生成启动横幅里可打印的访问地址列表。
 * @param {object} opts
 * @param {number} opts.port 监听端口
 * @param {boolean} [opts.lan=false] 是否监听 0.0.0.0（打印内网地址）
 * @returns {string[]} 每行一条地址说明
 */
export function formatAccessUrls({ port, lan }) {
  const lines = [`  http://127.0.0.1:${port}/mcp    本机访问（MCP 客户端 URL）`];
  if (lan) {
    for (const ip of getLanIPv4s()) {
      lines.push(`  http://${ip}:${port}/mcp        内网访问（同一局域网设备可用）`);
    }
    lines.push(`  健康检查: http://127.0.0.1:${port}/health`);
  }
  return lines;
}