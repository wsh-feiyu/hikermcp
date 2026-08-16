/**
 * normalizeRule 单元测试
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRule } from '../src/ruleNormalize.js';

test('normalizeRule pageList 数组 → 补 pages 字符串', () => {
  const r = normalizeRule({
    title: 'test',
    pageList: [{ name: '主页', path: 'home', rule: 'js:setResult([]);' }],
  });
  assert.ok(Array.isArray(r.pageList));
  assert.equal(r.pageList.length, 1);
  assert.equal(typeof r.pages, 'string');
  const parsed = JSON.parse(r.pages);
  assert.equal(parsed[0].name, '主页');
});

test('normalizeRule pages 字符串 → 反向补 pageList', () => {
  const r = normalizeRule({
    title: 'test',
    pages: JSON.stringify([{ name: '搜索', path: 'search', rule: 'js:setResult([]);' }]),
  });
  assert.equal(typeof r.pages, 'string');
  assert.ok(Array.isArray(r.pageList));
  assert.equal(r.pageList.length, 1);
  assert.equal(r.pageList[0].name, '搜索');
});

test('normalizeRule 两者都无 → 空数组', () => {
  const r = normalizeRule({ title: 'test' });
  assert.ok(Array.isArray(r.pageList));
  assert.equal(r.pageList.length, 0);
  assert.equal(r.pages, '[]');
});

test('normalizeRule 两者都存在 → 以 pageList 为准', () => {
  const r = normalizeRule({
    title: 'test',
    pageList: [{ name: '详情', path: 'detail', rule: 'js:setResult([]);' }],
    pages: '[]',
  });
  assert.equal(r.pageList.length, 1);
  assert.equal(typeof r.pages, 'string');
  const parsed = JSON.parse(r.pages);
  assert.equal(parsed[0].name, '详情');
});

test('normalizeRule 不修改原始对象', () => {
  const original = { title: 'test', pageList: [{ name: '主页', path: 'home' }] };
  const originalPages = original.pageList;
  normalizeRule(original);
  // 原始对象不应被修改
  assert.equal(original.pageList, originalPages);
});