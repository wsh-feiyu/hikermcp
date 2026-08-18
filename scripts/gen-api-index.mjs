#!/usr/bin/env node
/**
 * 从 docs/hiker.d.ts 生成 API 速查索引（docs/hiker-api-index.md）。
 *
 * 用法: node scripts/gen-api-index.mjs
 * 产物: 按区域分组的所有 API（函数/常量/命名空间）名称 + 一句话用途。
 * 用途: AI 先读索引（几 KB）定位 API 名，再用 get_rule_docs({doc:'hiker-dts', keyword:'函数名'})
 *       精准提取声明片段，避免一次读取 80KB 的 d.ts。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DTS = path.join(__dirname, '..', 'docs', 'hiker.d.ts');
const OUT = path.join(__dirname, '..', 'docs', 'hiker-api-index.md');

const lines = fs.readFileSync(DTS, 'utf-8').split('\n');

// 提取声明与 JSDoc 摘要
const entries = []; // {region, name, sig, desc}
let region = '通用';
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const regionMatch = line.match(/\/\/#region\s+(.+)/);
  if (regionMatch) region = regionMatch[1].trim();

  const decl = line.match(/^declare\s+(?:async\s+)?(function|const|class|namespace)\s+([A-Za-z0-9_$]+)/);
  if (!decl) continue;
  const kind = decl[1];
  const name = decl[2];
  // 函数签名（含参数与返回类型，截断）
  let sig = name;
  if (kind === 'function') {
    const rest = line.slice(line.indexOf(name) + name.length);
    sig = name + rest.split(';')[0].trim();
  }
  // 向上找最近 JSDoc 描述（第一句）
  let desc = '';
  for (let j = i - 1; j >= 0 && j >= i - 12; j--) {
    const prev = lines[j].trim();
    if (prev === '*/') continue; // 跳过注释闭合行
    if (prev.startsWith('/**')) {
      const cleaned = prev.replace(/^\s*\/\*\*?\s?/, '').trim();
      if (cleaned && !cleaned.startsWith('@')) { desc = cleaned; break; }
    } else if (prev.startsWith('*')) {
      const cleaned = prev.replace(/^\s*\*\s?/, '').trim();
      if (cleaned && !cleaned.startsWith('@') && !cleaned.startsWith('```')) {
        desc = cleaned;
        break;
      }
    } else if (prev && !prev.startsWith('//')) {
      break; // 离开注释区
    }
  }
  // 去掉末尾句号后截断
  desc = desc.replace(/[。.]+$/, '');
  entries.push({ region, name, sig, desc: desc.slice(0, 60) });
}

// 按区域分组输出
const byRegion = new Map();
for (const e of entries) {
  if (!byRegion.has(e.region)) byRegion.set(e.region, []);
  byRegion.get(e.region).push(e);
}

const md = [];
md.push('# 海阔视界 API 速查索引');
md.push('');
md.push(`> 由 docs/hiker.d.ts（${lines.length} 行）自动生成，共 ${entries.length} 个 API。`);
md.push('> **用法**：先读本索引定位 API 名，再用 `get_rule_docs({ doc: \'hiker-dts\', keyword: \'函数名\' })` 精准提取声明，不要一次读全文。');
md.push('> 重新生成：`node scripts/gen-api-index.mjs`');
md.push('');
for (const [r, list] of byRegion) {
  md.push(`## ${r}`);
  md.push('');
  for (const e of list) {
    md.push(`- \`${e.sig}\`${e.desc ? ` — ${e.desc}` : ''}`);
  }
  md.push('');
}
md.push('---');
md.push('*索引为名称速查，详细签名/参数/示例见 hiker.d.ts 原文。*');

fs.writeFileSync(OUT, md.join('\n'), 'utf-8');
console.log(`已生成 ${OUT}`);
console.log(`共 ${entries.length} 个 API，${byRegion.size} 个区域，${md.join('\n').length} 字符`);
