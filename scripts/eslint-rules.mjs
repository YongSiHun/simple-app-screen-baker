import { cognitiveComplexity, noNestedControl } from './complexity-rules.mjs';
export const readabilityRules = {
  rules: {
    'cognitive-complexity': cognitiveComplexity,
    'no-nested-control-flow': noNestedControl,
    'named-boolean-condition': {
      meta: {
        type: 'suggestion',
        schema: [],
        messages: {
          extractCondition: 'if 조건은 의미 있는 boolean 변수로 분리해주세요.',
        },
      },
      /** 가독성 룰 등록 */
      create(context) {
        return {
          /** if 조건의 명명 변수 여부 검사 */
          IfStatement(node) {
            const usesNamedCondition = node.test.type === 'Identifier';

            if (usesNamedCondition) {
              return;
            }

            context.report({ node: node.test, messageId: 'extractCondition' });
          },
        };
      },
    },
  },
};
