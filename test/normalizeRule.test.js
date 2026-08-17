/**
 * normalizeRule 单元测试（2026-08 修订：子页面统一以 pages 为准，pageList 仅兼容输入）
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRule, parsePages } from '../src/ruleNormalize.js';

test('normalizeRule：pages 为数组 → 输出 pages 字符串，不含 pageList', () => {
  const r = normalizeRule({
    title: 'test',
    pages: [{ name: '主页', path: 'home', rule: '//js:setResult([]);' }],
  });
  assert.equal(typeof r.pages, 'string');
  const parsed = JSON.parse(r.pages);
  assert.equal(parsed[0].name, '主页');
  assert.equal(r.pageList, undefined, '输出不应包含 pageList');
});

test('normalizeRule：pages 字符串 → 原样保留，不含 pageList', () => {
  const r = normalizeRule({
    title: 'test',
    pages: JSON.stringify([{ name: '搜索', path: 'search', rule: '//js:setResult([]);' }]),
  });
  assert.equal(typeof r.pages, 'string');
  const parsed = JSON.parse(r.pages);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].name, '搜索');
  assert.equal(r.pageList, undefined, '输出不应包含 pageList');
});

test('normalizeRule：旧写法 pageList 数组 → 转 pages 字符串（兼容）', () => {
  const r = normalizeRule({
    title: 'test',
    pageList: [{ name: '主页', path: 'home', rule: '//js:setResult([]);' }],
  });
  assert.equal(typeof r.pages, 'string');
  const parsed = JSON.parse(r.pages);
  assert.equal(parsed[0].name, '主页');
  assert.equal(r.pageList, undefined, '输出不应包含 pageList');
});

test('normalizeRule：两者皆无 → pages = "[]"', () => {
  const r = normalizeRule({ title: 'test' });
  assert.equal(r.pages, '[]');
  assert.equal(r.pageList, undefined);
});

test('normalizeRule：pages 与 pageList 同时存在 → 以 pages 为准', () => {
  const r = normalizeRule({
    title: 'test',
    pages: JSON.stringify([{ name: '详情', path: 'detail', rule: '//js:setResult([]);' }]),
    pageList: [{ name: '旧列表', path: 'old', rule: '//js:x;' }],
  });
  const parsed = JSON.parse(r.pages);
  assert.equal(parsed[0].name, '详情', '应以 pages 字段为准');
  assert.equal(r.pageList, undefined);
});

test('normalizeRule：不修改原始对象', () => {
  const original = { title: 'test', pageList: [{ name: '主页', path: 'home' }] };
  const originalPagesRef = original.pageList;
  normalizeRule(original);
  assert.equal(original.pageList, originalPagesRef, '原始对象不应被修改');
  assert.equal(original.pages, undefined, '原始对象不应被新增 pages');
});

test('normalizeRule：空 pages 数组 → "[]"', () => {
  const r = normalizeRule({ title: 'test', pages: [] });
  assert.equal(r.pages, '[]');
});

test('parsePages：字符串/数组/非法值', () => {
  assert.equal(parsePages('[{"name":"a"}]')[0].name, 'a');
  assert.equal(parsePages([{ name: 'b' }])[0].name, 'b');
  assert.deepEqual(parsePages('不是JSON'), []);
  assert.deepEqual(parsePages(null), []);
  assert.deepEqual(parsePages(undefined), []);
  assert.deepEqual(parsePages('{}'), []);
});