/**
 * 云分享（云5 cmd.im + 云6 pasteme）单元测试。
 * 使用 mock fetch，不依赖真实网络。
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildRulePasteText,
  uploadPaste,
  buildPasteLinks,
  uploadCmdIm,
  parseCmdImHtml,
  buildCmdLinks,
  shareToCloud,
  shareRuleToCloud,
} from '../src/paste-share.js';

test('buildRulePasteText：生成标准海阔口令，base64 可解码回原 JSON', () => {
  const rule = {
    title: '测试源',
    type: 'video',
    find_rule: 'js:setResult([]);',
    pageList: [{ name: '主页', path: 'home', rule: '//js:setResult([]);' }],
  };
  const text = buildRulePasteText(rule);
  assert.ok(text.startsWith('海阔视界规则分享，当前分享的是：小程序￥home_rule_v2￥base64://@测试源@'), '口令格式错误');
  const b64 = text.split('@测试源@')[1];
  const decoded = JSON.parse(Buffer.from(b64, 'base64').toString('utf-8'));
  assert.equal(decoded.title, '测试源');
  assert.ok(decoded.pages, 'normalizeRule 应输出 pages 字符串');
  const pages = JSON.parse(decoded.pages);
  assert.equal(pages.length, 1);
  assert.equal(pages[0].name, '主页');
});

test('buildRulePasteText：自定义 name 覆盖 rule.title', () => {
  const rule = { title: 'A', type: 'video', find_rule: 'js:setResult([]);' };
  const text = buildRulePasteText(rule, '自定义名');
  assert.ok(text.includes('@自定义名@'), '应使用自定义名称');
});

// ============ 云5（cmd.im） ============

test('uploadCmdIm：302 + Location 提取 path（表单/头/关闭重定向）', async () => {
  let captured = null;
  const fakeFetch = async (url, opts) => {
    captured = { url, opts };
    return {
      status: 302,
      headers: { get: (k) => (k.toLowerCase() === 'location' ? '/ABCDE' : null) },
      text: async () => '',
    };
  };
  const path = await uploadCmdIm('分享内容', { fetchImpl: fakeFetch });
  assert.equal(path, 'ABCDE');
  assert.equal(captured.url, 'https://cmd.im/');
  assert.equal(captured.opts.method, 'POST');
  assert.equal(captured.opts.redirect, 'manual', '必须关闭自动重定向');
  assert.equal(captured.opts.headers['Content-Type'], 'application/x-www-form-urlencoded');
  assert.equal(captured.opts.headers.Origin, 'https://cmd.im');
  assert.equal(captured.opts.headers.Referer, 'https://cmd.im/');
  const body = new URLSearchParams(captured.opts.body);
  assert.equal(body.get('txt'), '分享内容');
});

test('uploadCmdIm：301 也接受；无 Location 抛错', async () => {
  const ok = await uploadCmdIm('x', { fetchImpl: async () => ({ status: 301, headers: { get: () => 'abc' }, text: async () => '' }) });
  assert.equal(ok, 'abc');
  await assert.rejects(
    () => uploadCmdIm('x', { fetchImpl: async () => ({ status: 200, headers: { get: () => null }, text: async () => 'ok' }) }),
    /无 Location/
  );
});

test('parseCmdImHtml：提取 .test_box 纯文本（含 br/实体）', () => {
  const html = '<html><body><div class="test_box">第一行<br/>第二行 &amp; 结束</div></body></html>';
  assert.equal(parseCmdImHtml(html), '第一行\n第二行 & 结束');
  assert.throws(() => parseCmdImHtml('<html>无内容</html>'), /test_box/);
});

test('buildCmdLinks：云5oooole 链接', () => {
  const links = buildCmdLinks('ABCDE');
  assert.equal(links.pasteLink, '云5oooole/ABCDE');
  assert.equal(links.url, 'https://cmd.im/ABCDE');
  assert.equal(links.checkUrl, 'https://cmd.im/ABCDE');
});

// ============ 统一入口（云5 优先、云6 兜底） ============

test('shareToCloud：云5 在线 → 走云5', async () => {
  const fakeFetch = async () => ({ status: 302, headers: { get: (k) => (k.toLowerCase() === 'location' ? '/abc5' : null) }, text: async () => '' });
  const r = await shareToCloud('内容', { fetchImpl: fakeFetch });
  assert.equal(r.provider, 'cmd');
  assert.equal(r.path, 'abc5');
  assert.equal(r.links.pasteLink, '云5oooole/abc5');
});

test('shareToCloud：云5 不在线 → 兜底云6', async () => {
  let calls = 0;
  const fakeFetch = async () => {
    calls++;
    if (calls === 1) return { status: 500, headers: { get: () => null }, text: async () => 'error' }; // 云5 失败
    return { ok: true, status: 200, text: async () => JSON.stringify({ data: { path: 'abc6' } }) }; // 云6 成功
  };
  const r = await shareToCloud('内容', { fetchImpl: fakeFetch });
  assert.equal(r.provider, 'paste');
  assert.equal(r.path, 'abc6');
  assert.equal(r.links.pasteLink, '云6oooole/xxxxxx/abc6');
  assert.equal(calls, 2, '应尝试过云5 再云6');
});

test('shareToCloud：云5 云6 都不在线 → 报不可用', async () => {
  const fakeFetch = async () => ({ status: 500, headers: { get: () => null }, text: async () => 'down' });
  await assert.rejects(() => shareToCloud('内容', { fetchImpl: fakeFetch }), /不可用/);
});

test('shareRuleToCloud：规则→口令→云5 全链路', async () => {
  const fakeFetch = async () => ({ status: 302, headers: { get: (k) => (k.toLowerCase() === 'location' ? '/abcd' : null) }, text: async () => '' });
  const r = await shareRuleToCloud({ title: '测试', type: 'video', find_rule: 'js:setResult([]);' }, { fetchImpl: fakeFetch });
  assert.equal(r.provider, 'cmd');
  assert.ok(r.pasteText.startsWith('海阔视界规则分享，当前分享的是：'));
  assert.equal(r.links.pasteLink, '云5oooole/abcd');
});

// ============ 云6（pasteme）保留测试 ============

test('uploadPaste：POST 到 /api/create，提取 data.path', async () => {
  let captured = null;
  const fakeFetch = async (url, opts) => {
    captured = { url, opts };
    return { ok: true, status: 200, text: async () => JSON.stringify({ data: { path: 'abc123' } }) };
  };
  const path = await uploadPaste('分享内容', { fetchImpl: fakeFetch });
  assert.equal(path, 'abc123');
  assert.equal(captured.url, 'https://pasteme.tyrantg.com/api/create');
  assert.equal(captured.opts.method, 'POST');
  assert.equal(captured.opts.headers['Content-Type'], 'application/json');
  assert.equal(captured.opts.headers.Referer, 'https://pasteme.tyrantg.com/');
  const body = JSON.parse(captured.opts.body);
  assert.equal(body.lang, 'plain');
  assert.equal(body.content, '分享内容');
});

test('uploadPaste：HTTP 非 2xx 抛错', async () => {
  const fakeFetch = async () => ({ ok: false, status: 500, text: async () => 'server error' });
  await assert.rejects(() => uploadPaste('x', { fetchImpl: fakeFetch }), /HTTP 500/);
});

test('uploadPaste：响应缺少 data.path 抛错', async () => {
  const fakeFetch = async () => ({ ok: true, status: 200, text: async () => JSON.stringify({ data: {} }) });
  await assert.rejects(() => uploadPaste('x', { fetchImpl: fakeFetch }), /data\.path/);
});

test('uploadPaste：响应非 JSON 抛错', async () => {
  const fakeFetch = async () => ({ ok: true, status: 200, text: async () => '<html>error</html>' });
  await assert.rejects(() => uploadPaste('x', { fetchImpl: fakeFetch }), /合法 JSON/);
});

test('buildPasteLinks：生成三种链接', () => {
  const links = buildPasteLinks('abc123');
  assert.equal(links.pasteLink, '云6oooole/xxxxxx/abc123');
  assert.equal(links.url, 'https://pasteme.tyrantg.com/xxxxxx/abc123');
  assert.equal(links.checkUrl, 'https://pasteme.tyrantg.com/api/getContent/abc123');
});