/**
 * 网络工具与启动横幅测试。
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getLanIPv4s, formatAccessUrls } from '../src/net-utils.js';

test('getLanIPv4s：返回非回环 IPv4 列表', () => {
  const ips = getLanIPv4s();
  assert.ok(Array.isArray(ips));
  assert.ok(!ips.includes('127.0.0.1'), '不应包含回环地址');
  for (const ip of ips) {
    assert.match(ip, /^\d+\.\d+\.\d+\.\d+$/, `应为合法 IPv4: ${ip}`);
  }
});

test('formatAccessUrls：默认只含本机地址', () => {
  const lines = formatAccessUrls({ port: 3200, lan: false });
  assert.ok(lines.some((l) => l.includes('http://127.0.0.1:3200/mcp')));
  assert.ok(!lines.some((l) => l.includes('内网访问')), '非 lan 模式不应打印内网地址');
});

test('formatAccessUrls：lan 模式包含内网地址与健康检查', () => {
  const ips = getLanIPv4s();
  const lines = formatAccessUrls({ port: 3200, lan: true });
  assert.ok(lines.some((l) => l.includes('内网访问')), 'lan 模式应打印内网访问');
  for (const ip of ips) {
    assert.ok(lines.some((l) => l.includes(`http://${ip}:3200/mcp`)), `应包含内网地址 ${ip}`);
  }
  assert.ok(lines.some((l) => l.includes('/health')), '应包含健康检查地址');
});