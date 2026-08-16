#!/usr/bin/env node
/**
 * 独立扫描脚本：探测局域网内可用的海阔视界 App 地址
 *
 * 用法：
 *   node src/scan.js 192.168.1.[50-249]
 *   node src/scan.js 192.168.1.100 192.168.1.200
 *   node src/scan.js              # 使用 config/mcp.json 中的 hosts
 */
import { loadConfig, expandHosts, apiBase } from './config.js';

async function scan(hosts) {
  const candidates = expandHosts(hosts);
  console.error(`[scan] 共 ${candidates.length} 个候选地址，开始并发探测...`);
  const timeout = loadConfig().timeout;
  const found = [];

  const queue = [...candidates];
  const workers = Array.from({ length: 30 }, async () => {
    while (queue.length) {
      const host = queue.shift();
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), timeout);
        const res = await fetch(`${apiBase(host)}/getAllRuleTitles`, { signal: ctrl.signal });
        clearTimeout(timer);
        if (res.ok) {
          found.push(host);
          console.error(`[scan] ✓ ${host} 可用`);
        }
      } catch {
        // 不可达
      }
    }
  });
  await Promise.all(workers);

  if (found.length === 0) {
    console.error('[scan] 未发现可用的海阔视界 App');
    process.exit(1);
  }
  console.log(JSON.stringify(found, null, 2));
}

const args = process.argv.slice(2);
const hosts = args.length ? args : loadConfig().hosts;
scan(hosts).catch((e) => {
  console.error('[scan] 失败:', e.message);
  process.exit(1);
});
