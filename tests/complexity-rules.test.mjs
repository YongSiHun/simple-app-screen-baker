import { it } from 'node:test';
import assert from 'node:assert/strict';
import { Linter } from 'eslint';
import {
  cognitiveComplexity,
  noNestedControl,
} from '../scripts/complexity-rules.mjs';

function lint(code) {
  return new Linter().verify(code, [
    {
      plugins: {
        project: {
          rules: { complexity: cognitiveComplexity, nesting: noNestedControl },
        },
      },
      rules: {
        'project/complexity': ['error', { max: 5 }],
        'project/nesting': 'error',
      },
    },
  ]);
}

it('accepts five independent branches and rejects a sixth', () => {
  assert.deepEqual(
    lint('function work(a) { if(a){} if(a){} if(a){} if(a){} if(a){} }'),
    [],
  );
  assert.equal(
    lint(
      'function work(a) { if(a){} if(a){} if(a){} if(a){} if(a){} if(a){} }',
    )[0].messageId,
    'exceedsLimit',
  );
});

it('charges nesting more than sequential branches and flags nested ifs', () => {
  const messages = lint('function work(a) { if(a) { if(a) { if(a) {} } } }');
  assert.equal(
    messages.filter((message) => message.messageId === 'nested').length,
    2,
  );
  assert.ok(messages.some((message) => message.message.includes('6')));
});

it('checks loops while keeping nested callback functions independent', () => {
  assert.equal(
    lint(
      'function work(items) { for (const a of items) { for (const b of items) {} } }',
    ).filter((message) => message.messageId === 'nested').length,
    1,
  );
  assert.deepEqual(
    lint('function work(a) { if(a) { return () => { if(a) {} }; } }'),
    [],
  );
});

it('counts conditional and logical expressions, including nullish defaults', () => {
  const messages = lint(
    'const work = (a) => (a ?? a ?? a ?? a ?? a ?? a ?? a);',
  );
  assert.equal(messages[0].messageId, 'exceedsLimit');
  assert.equal(
    lint('function work(a) { return a ? (a ? (a ? 1 : 2) : 3) : 4; }')[0]
      .messageId,
    'exceedsLimit',
  );
});
