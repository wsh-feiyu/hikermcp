/**
 * validateRule 单元测试
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateRule } from '../src/tools/validateRule.js';
import { RULE_TYPES } from '../src/tools/format.js';

test('validateRule 简单合法规则应通过', async () => {
  const r = await validateRule({
    rule: {
      title: '测试规则',
      type: 'video',
      find_rule: 'js:setResult([]);',
    },
  });
  assert.equal(r.ok, true);
  assert.ok(r.bodyLength > 0);
  assert.equal(r.errors.length, 0);
});

// ★ 回归测试：官方 10 个 type 值必须全部放行（曾误拒 music/cartoon/read/picture/news/tool/other）
test('validateRule 官方 10 个 type 值全部应通过', async () => {
  const official = ['all', 'video', 'music', 'live', 'cartoon', 'read', 'picture', 'news', 'tool', 'other'];
  assert.deepEqual(RULE_TYPES, official, 'RULE_TYPES 应与官方 hiker.d.ts 枚举一致');
  for (const type of official) {
    const r = await validateRule({
      rule: {
        title: `测试-${type}`,
        type,
        version: 1,
        url: 'https://example.com',
        col_type: 'movie_3',
        detail_col_type: 'movie_1',
        find_rule: 'js:var d=[];setResult(d);',
      },
    });
    assert.equal(r.ok, true, `type="${type}" 应校验通过，实际错误: ${r.errors.join('; ')}`);
    assert.ok(!r.errors.some((e) => e.includes('type 字段值异常')), `type="${type}" 不应报 type 异常`);
  }
});

test('validateRule 非法 type 值应报 type 字段值异常', async () => {
  const r = await validateRule({
    rule: {
      title: '测试规则',
      type: 'image', // 官方无 image 类型（官方为 picture）
      find_rule: 'js:setResult([]);',
    },
  });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes('type 字段值异常')), '非法 type 应被拦截');
});

test('validateRule 含 pageList 应通过', async () => {
  const r = await validateRule({
    rule: {
      title: '测试规则',
      type: 'video',
      pageList: [
        { name: '主页', path: 'home', rule: '//js:setResult([]);' },
      ],
    },
  });
  assert.equal(r.ok, true);
});

test('validateRule 缺少 title 应失败', async () => {
  const r = await validateRule({
    rule: { type: 'video', find_rule: 'js:setResult([]);' },
  });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes('title')));
});

test('validateRule 代码语法错误应失败', async () => {
  const r = await validateRule({
    rule: { title: 'test', find_rule: 'js:var x = ;' },
  });
  assert.equal(r.ok, false);
});

test('validateRule undefined 规则应失败', async () => {
  const r = await validateRule({ rule: undefined });
  assert.equal(r.ok, false);
});

test('validateRule js: 格式误用 return list 应给出软警告', async () => {
  // find_rule 为原生 js: 格式但以 return d; 结尾且无 setResult → 应产生 warning
  const r = await validateRule({
    rule: {
      title: '测试规则',
      type: 'video',
      find_rule: 'js:var d = [];\nd.push({title:"a", url:"http://x.com"});\nreturn d;',
    },
  });
  assert.equal(r.ok, true, 'warning 不应阻塞校验通过');
  assert.ok(r.warnings.some((w) => w.includes('return 结尾')), `应提示 return 无效，实际: ${r.warnings}`);
});

test('validateRule js: 格式 push 构建但无 setResult 应给出软警告', async () => {
  const r = await validateRule({
    rule: {
      title: '测试规则',
      type: 'video',
      find_rule: 'js:var d = [];\nd.push({title:"a", url:"http://x.com"});',
    },
  });
  assert.equal(r.ok, true);
  assert.ok(r.warnings.some((w) => w.includes('setResult(d)')), '应提示缺少 setResult');
});

test('validateRule js: 格式正确 setResult(d) 结尾应无警告', async () => {
  const r = await validateRule({
    rule: {
      title: '测试规则',
      type: 'video',
      find_rule: 'js:var d = [];\nd.push({title:"a", url:"http://x.com"});\nsetResult(d);',
    },
  });
  assert.equal(r.ok, true);
  assert.equal(r.warnings.length, 0, `不应有警告，实际: ${r.warnings}`);
});

test('validateRule var Rule 框架风格 return 不应触发警告', async () => {
  // 青豆框架风格：方法体内 return d 是正确写法，但 find_rule 不应是 js: 前缀的裸函数体
  const r = await validateRule({
    rule: {
      title: '测试规则',
      type: 'video',
      find_rule: 'js:$.require(\'主页\').主页()',
      pageList: [{ name: '主页', path: '主页', rule: '//js:var Rule={主页:function(){var d=[];d.push({title:"a",url:"http://x.com"});return d;}};\n$.exports=Rule;' }],
    },
  });
  assert.equal(r.ok, true);
  assert.equal(r.warnings.length, 0, `框架风格不应有警告，实际: ${r.warnings}`);
});