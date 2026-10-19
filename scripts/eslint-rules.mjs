export const readabilityRules = {
  rules: {
    'named-boolean-condition': {
      meta: {
        type: 'suggestion',
        schema: [],
        messages: {
          extractCondition: 'if 조건은 의미 있는 boolean 변수로 분리해주세요.',
        },
      },
      /**
       * 프로젝트의 가독성 린트 규칙을 등록합니다.
       */
      create(context) {
        return {
          /**
           * if 조건이 이름 있는 변수인지 검사합니다.
           */
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
