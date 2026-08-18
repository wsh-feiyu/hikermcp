/**
 * 经验记忆库（memory.js）单元测试。
 * 使用 HIKER_MEMORY_FILE 重定向到临时文件，不污染真实记忆库。
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { addLesson, findLessons, listLessons, removeLesson, loadLessons, memoryFilePath } from '../src/memory.js';

let tmpFile;

before(() => {
  tmpFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'hiker-memory-')), 'lessons.json');
  process.env.HIKER_MEMORY_FILE = tmpFile;
});

after(() => {
  delete process.env.HIKER_MEMORY_FILE;
  try { fs.rmSync(path.dirname(tmpFile), { recursive: true, force: true }); } catch { /* 忽略 */ }
});

test('memoryFilePath 返回重定向路径', () => {
  assert.equal(memoryFilePath(), tmpFile);
});

test('addLesson：创建并持久化', () => {
  const r = addLesson({
    problem: '图片源 type 写 picture 被校验器拒绝',
    cause: '校验器 type 白名单不完整',
    fix: 'type 白名单已修复，直接用 picture',
    keywords: ['picture', '图片源', 'type'],
    title: '图片源 type 校验失败',
  });
  assert.equal(r.added, 'created');
  assert.ok(r.lesson.id);
  assert.equal(r.lesson.keywords.length, 3);
  // 已落盘
  assert.equal(loadLessons().length, 1);
});

test('addLesson：同 problem 自动去重更新', () => {
  const r = addLesson({
    problem: '图片源 type 写 picture 被校验器拒绝',
    fix: '更新后的做法',
  });
  assert.equal(r.added, 'updated');
  assert.equal(loadLessons().length, 1, '不应新增，应更新原教训');
  assert.ok(loadLessons()[0].fix.includes('更新后的做法'));
});

test('addLesson：缺少 problem 抛错', () => {
  assert.throws(() => addLesson({ fix: 'x' }), /problem/);
});

test('findLessons：按关键词命中', () => {
  addLesson({ problem: 'setResult 与 return 混用导致列表空白', keywords: ['setResult', 'return'], fix: 'js: 格式用 setResult(d)' });
  const hits = findLessons('setResult');
  assert.ok(hits.length >= 1);
  const hit = hits.find((h) => h.problem.includes('setResult 与 return'));
  assert.ok(hit, '应命中 setResult 教训');
  assert.ok(hit.hitCount >= 1, '命中次数应累计');
});

test('findLessons：多关键词任一命中 + 无命中返回空', () => {
  assert.ok(findLessons('不存在 的关键词xyz').length === 0);
  const hits = findLessons('return 列表', 1);
  assert.equal(hits.length, 1, '应为 limit 限制');
  assert.ok(hits[0].hitCount >= 2, '多次命中后次数继续累计');
});

test('listLessons：按命中次数排序', () => {
  addLesson({ problem: '冷门教训 aaaa', keywords: ['cold'] });
  const all = listLessons();
  // 命中次数高的（setResult 教训）应排前面
  const top = all[0];
  assert.ok(top.problem.includes('setResult') || top.hitCount > all[all.length - 1].hitCount, '应按命中次数倒序');
});

test('removeLesson：删除与幂等', () => {
  const before_ = listLessons().length;
  const target = listLessons()[0];
  assert.equal(removeLesson(target.id), true);
  assert.equal(listLessons().length, before_ - 1);
  assert.equal(removeLesson(target.id), false, '重复删除返回 false');
});