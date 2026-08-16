/**
 * validateRule 单元测试
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateRule } from '../src/tools/validateRule.js';

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