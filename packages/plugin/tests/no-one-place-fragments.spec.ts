import { join } from 'node:path';
import { GraphQLRuleTester } from '../src';
import { rule } from '../src/rules/no-one-place-fragments';

const ruleTester = new GraphQLRuleTester();

ruleTester.runGraphQLTests('no-one-place-fragments', rule, {
  valid: [
    {
      name: 'ok when spread 2 times',
      code: ruleTester.fromMockFile('no-one-place-fragments.graphql'),
      parserOptions: {
        documents: join(__dirname, 'mocks/no-one-place-fragments.graphql'),
      },
    },
  ],
  invalid: [
    {
      name: 'should error fragment used in one place',
      code: ruleTester.fromMockFile('user-fields.graphql'),
      errors: [
        { message: 'Fragment `UserFields` used only once. Inline him in "-877628611.graphql".' },
      ],
      parserOptions: {
        documents: /* GraphQL */ `
          {
            user {
              ...UserFields
            }
          }
        `,
      },
    },
  ],
});
