/**
 * MCP 经验记忆库（本地文件持久化）。
 *
 * 用途：AI 写源时遇到的问题 → 记录为「教训」（问题/原因/正确做法/关键词），
 * 下次写源前按关键词检索，避免重复犯错。
 *
 * 存储：memory/lessons.json（本机文件，已加入 .gitignore 不提交）。
 * 测试可用 HIKER_MEMORY_FILE 环境变量重定向存储文件。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DIR = path.join(__dirname, '..', 'memory');
const DEFAULT_FILE = path.join(DEFAULT_DIR, 'lessons.json');
const MAX_LESSONS = 500;

export function memoryFilePath() {
  return process.env.HIKER_MEMORY_FILE || DEFAULT_FILE;
}

/**
 * 读取全部教训。
 * @returns {Array<object>}
 */
export function loadLessons() {
  try {
    const data = JSON.parse(fs.readFileSync(memoryFilePath(), 'utf-8'));
    return Array.isArray(data.lessons) ? data.lessons : [];
  } catch {
    return [];
  }
}

function saveLessons(lessons) {
  const file = memoryFilePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify({ version: 1, lessons }, null, 2), 'utf-8');
}

function randomId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const norm = (s) => String(s || '').trim().replace(/\s+/g, ' ');

/**
 * 记录一条教训（同 problem 自动去重更新）。
 * @param {object} params
 * @param {string} params.problem 问题描述（必填）
 * @param {string} [params.cause] 根因
 * @param {string} [params.fix] 正确做法/教训（建议含代码示例）
 * @param {string[]} [params.keywords] 场景关键词（站点类型/API名/技术点等）
 * @param {string} [params.title] 一句话标题（默认取 problem 前 40 字）
 * @returns {{added: 'created'|'updated', lesson: object}}
 */
export function addLesson({ problem, cause, fix, keywords = [], title } = {}) {
  const p = norm(problem);
  if (!p) throw new Error('problem 不能为空');
  const lessons = loadLessons();
  const pk = p.slice(0, 50);
  const idx = lessons.findIndex((l) => norm(l.problem).slice(0, 50) === pk);

  const lesson = {
    id: idx >= 0 ? lessons[idx].id : randomId(),
    title: norm(title) || p.slice(0, 40),
    keywords: Array.isArray(keywords) ? [...new Set(keywords.map(norm).filter(Boolean))] : [],
    problem: p,
    cause: norm(cause),
    fix: norm(fix),
    createdAt: idx >= 0 ? lessons[idx].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hitCount: idx >= 0 ? lessons[idx].hitCount || 0 : 0,
  };
  let added = 'created';
  if (idx >= 0) {
    lessons[idx] = lesson;
    added = 'updated';
  } else {
    lessons.unshift(lesson);
  }
  if (lessons.length > MAX_LESSONS) lessons.length = MAX_LESSONS;
  saveLessons(lessons);
  return { added, lesson };
}

/**
 * 按关键词检索教训（匹配 problem/cause/fix/keywords 全文；命中数+1）。
 * @param {string} keyword 关键词（空格分隔多词，任一词命中即算）
 * @param {number} [limit=5]
 * @returns {Array<object>}
 */
export function findLessons(keyword, limit = 5) {
  const kw = String(keyword || '').trim().toLowerCase();
  if (!kw) return [];
  const terms = kw.split(/\s+/).filter(Boolean);
  const lessons = loadLessons();
  const hits = [];
  for (const l of lessons) {
    const hay = [l.problem, l.cause, l.fix, (l.keywords || []).join(' ')].join(' ').toLowerCase();
    if (terms.some((t) => hay.includes(t))) {
      l.hitCount = (l.hitCount || 0) + 1;
      hits.push(l);
    }
  }
  if (hits.length) saveLessons(lessons);
  return hits.slice(0, limit);
}

/**
 * 列出全部教训（按命中次数/更新时间倒序）。
 */
export function listLessons() {
  return loadLessons().sort(
    (a, b) => (b.hitCount || 0) - (a.hitCount || 0) || (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || '')
  );
}

/**
 * 按 id 删除教训。
 * @returns {boolean} 是否删除成功
 */
export function removeLesson(id) {
  const lessons = loadLessons();
  const next = lessons.filter((l) => l.id !== id);
  if (next.length === lessons.length) return false;
  saveLessons(next);
  return true;
}

export { DEFAULT_FILE, MAX_LESSONS };