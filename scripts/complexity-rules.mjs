const functionNodes = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
]);
const functionSelector = [...functionNodes].join(', ');
const functionExitSelector = ':matches(' + functionSelector + '):exit';
const structures = [
  'IfStatement',
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement',
  'CatchClause',
  'ConditionalExpression',
  'SwitchStatement',
];
const loops = new Set([
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement',
]);

/** 자체 복잡도 지표 · 중첩 가중·외부 의존성 없음 */
export const cognitiveComplexity = {
  meta: {
    type: 'suggestion',
    schema: [
      {
        type: 'object',
        properties: { max: { type: 'integer', minimum: 0 } },
        additionalProperties: false,
      },
    ],
    messages: {
      exceedsLimit:
        '인지복잡도 {{score}}: 함수별 {{max}} 이하로 역할을 분리해주세요.',
    },
  },
  create(context) {
    const max = context.options[0]?.max ?? 5;
    const frames = [];

    function enterFunction(node) {
      frames.push({ node, score: 0, nesting: 0 });
    }

    function exitFunction() {
      const frame = frames.pop();
      const exceedsLimit = frame.score > max;

      if (exceedsLimit) {
        context.report({
          node: frame.node,
          messageId: 'exceedsLimit',
          data: { score: frame.score, max },
        });
      }
    }

    function addStructure() {
      const frame = frames.at(-1);
      const isOutsideFunction = !frame;

      if (isOutsideFunction) {
        return;
      }

      frame.score += 1 + frame.nesting;
      frame.nesting++;
    }

    function exitStructure() {
      const frame = frames.at(-1);

      if (frame) {
        frame.nesting--;
      }
    }

    function addLogicalExpression() {
      const frame = frames.at(-1);

      if (frame) {
        frame.score++;
      }
    }

    return {
      [functionSelector]: enterFunction,
      [functionExitSelector]: exitFunction,
      [structures.join(', ')]: addStructure,
      [':matches(' + structures.join(', ') + '):exit']: exitStructure,
      LogicalExpression: addLogicalExpression,
    };
  },
};

function hasNestedControl(context, node) {
  const ancestors = context.sourceCode.getAncestors(node);
  const functionIndex = ancestors.findLastIndex((ancestor) =>
    functionNodes.has(ancestor.type),
  );
  const localAncestors = ancestors.slice(functionIndex + 1);
  const isIf = node.type === 'IfStatement';

  return localAncestors.some((ancestor) =>
    isIf ? ancestor.type === 'IfStatement' : loops.has(ancestor.type),
  );
}

export const noNestedControl = {
  meta: {
    type: 'suggestion',
    schema: [],
    messages: {
      nested: '중첩 {{kind}}문은 조기 반환 또는 역할별 함수로 분리해주세요.',
    },
  },
  create(context) {
    return {
      ['IfStatement, ' + [...loops].join(', ')](node) {
        const isNested = hasNestedControl(context, node);

        if (isNested) {
          context.report({
            node,
            messageId: 'nested',
            data: { kind: node.type === 'IfStatement' ? 'if' : '반복' },
          });
        }
      },
    };
  },
};
