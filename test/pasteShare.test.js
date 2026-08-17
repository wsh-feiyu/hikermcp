/**
 * 云剪贴板分享（paste-share）单元测试。
 * 使用 mock fetch，不依赖真实网络。
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildRulePasteText, uploadPaste, buildPasteLinks, shareRuleToPaste } from '../src/paste-share.js';

test('buildRulePasteText：生成标准海阔口令，base64 可解码回原 JSON', () => {
  const rule = {
    title: '测试源',
    type: 'video',
    find_rule: 'js:setResult([]);',
    pageList: [{ name: '主页', path: 'home', rule: '//js:setResult([]);' }],
  };
  const text = buildRulePasteText(rule);
  // 前缀与格式
  assert.ok(text.startsWith('海阔视界规则分享，当前分享的是：小程序￥home_rule_v2￥base64://@测试源@'), '口令格式错误');
  // base64 部分可解码回规则 JSON（normalizeRule 统一输出 pages 字符串）
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

test('uploadPaste：POST 到 /api/create，提取 data.path', async () => {
  let captured = null;
  const fakeFetch = async (url, opts) => {
    captured = { url, opts };
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ data: { path: 'abc123' } }),
    };
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
  const fakeFetch = async () => ({
    ok: false,
    status: 500,
    text: async () => 'server error',
  });
  await assert.rejects(() => uploadPaste('x', { fetchImpl: fakeFetch }), /HTTP 500/);
});

test('uploadPaste：响应缺少 data.path 抛错', async () => {
  const fakeFetch = async () => ({
    ok: true,
    status: 200,
    text: async () => JSON.stringify({ data: {} }),
  });
  await assert.rejects(() => uploadPaste('x', { fetchImpl: fakeFetch }), /data\.path/);
});

test('uploadPaste：响应非 JSON 抛错', async () => {
  const fakeFetch = async () => ({
    ok: true,
    status: 200,
    text: async () => '<html>error</html>',
  });
  await assert.rejects(() => uploadPaste('x', { fetchImpl: fakeFetch }), /合法 JSON/);
});

test('buildPasteLinks：生成三种链接', () => {
  const links = buildPasteLinks('abc123');
  assert.equal(links.pasteLink, '云6oooole/xxxxxx/abc123');
  assert.equal(links.url, 'https://pasteme.tyrantg.com/xxxxxx/abc123');
  assert.equal(links.checkUrl, 'https://pasteme.tyrantg.com/api/getContent/abc123');
});

test('shareRuleToPaste：规则→口令→上传→链接 全链路', async () => {
  const fakeFetch = async () => ({
    ok: true,
    status: 200,
    text: async () => JSON.stringify({ data: { path: 'xyz789' } }),
  });
  const r = await shareRuleToPaste({ title: '测试', type: 'video', find_rule: 'js:setResult([]);' }, { fetchImpl: fakeFetch });
  assert.equal(r.path, 'xyz789');
  assert.ok(r.pasteText.startsWith('海阔视界规则分享，当前分享的是：'));
  assert.equal(r.links.pasteLink, '云6oooole/xxxxxx/xyz789');
});