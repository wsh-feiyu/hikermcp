import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * 默认配置：与浏览器插件保持一致
 * - 海阔视界 App 默认监听 52020 端口
 * - 支持精确 IP、IP 段（192.168.1.[50-249]）、通配符（192.168.1.*）
 */
const DEFAULTS = {
  // 海阔视界 App 地址列表，支持 IP 段 / 通配符，启动时自动探测可用地址
  hosts: ['192.168.1.100'],
  port: 52020,
  // 请求超时（毫秒）
  timeout: 10000,
  // 探测 IP 段时的并发数
  scanConcurrency: 20,
};

let cached = null;

/**
 * 读取配置文件 config/mcp.json（可选），合并默认值
 */
export function loadConfig() {
  if (cached) return cached;
  const configPath = path.join(__dirname, '..', 'config', 'mcp.json');
  let user = {};
  if (fs.existsSync(configPath)) {
    try {
      user = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (e) {
      console.error(`[hiker-mcp] 配置文件解析失败: ${configPath}`, e.message);
    }
  }
  cached = { ...DEFAULTS, ...user };
  return cached;
}

/**
 * 将 IP 段 / 通配符展开为具体 IP 列表
 * 支持格式：
 *   - 192.168.1.100         精确 IP
 *   - 192.168.1.[50-249]    IP 段
 *   - 192.168.1.*           通配符（1-254）
 */
export function expandHosts(hosts) {
  const result = [];
  for (const h of hosts) {
    const m = h.match(/^(\d+\.\d+\.\d+)\.\[(\d+)-(\d+)\]$/);
    if (m) {
      const [, prefix, a, b] = m;
      const lo = Math.min(+a, +b);
      const hi = Math.max(+a, +b);
      for (let i = lo; i <= hi; i++) result.push(`${prefix}.${i}`);
      continue;
    }
    const w = h.match(/^(\d+\.\d+\.\d+)\.\*$/);
    if (w) {
      for (let i = 1; i <= 254; i++) result.push(`${w[1]}.${i}`);
      continue;
    }
    result.push(h);
  }
  return result;
}

export function apiBase(host) {
  return `http://${host}:${loadConfig().port}`;
}
