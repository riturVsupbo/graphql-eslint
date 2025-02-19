import { join } from 'node:path';
import { GraphQLRuleTester } from '../src';
import { rule as noAnonymousOperations } from '../src/rules/no-anonymous-operations';
import { rule as noTypenamePrefix } from '../src/rules/no-typename-prefix';

const ruleTester = new GraphQLRuleTester();

ruleTester.runGraphQLTests('no-typename-prefix', noTypenamePrefix, {
  valid: [
    {
      name: 'should work with descriptions #942',
      code: /* GraphQL */ `
        type Type {
          "Some description"
          typeName: String! # eslint-disable-line no-typename-prefix
        }
      `,
    },
  ],
  invalid: [],
});

ruleTester.runGraphQLTests('test-directives', noAnonymousOperations, {
  valid: [
    /* GraphQL */ `
      # eslint-disable-next-line
      {
        a
      }
    `,
    /* GraphQL */ `
      # eslint-disable-next-line test-directives
      {
        a
      }
    `,
    '{ a } # eslint-disable-line test-directives',
    '{ a } # eslint-disable-line',
    /* GraphQL */ `
      # eslint-disable
      {
        a
      }
    `,
    {
      filename: join(__dirname, 'mocks/test-directives-with-import.graphql'),
      code: ruleTester.fromMockFile('test-directives-with-import.graphql'),
    },
  ],
  invalid: [
    {
      code: /* GraphQL */ `
        # eslint-disable-next-line non-existing-rule
        {
          a
        }
      `,
      errors: [
        { message: "Definition for rule 'non-existing-rule' was not found." },
        { message: 'Anonymous GraphQL operations are forbidden. Make sure to name your query!' },
      ],
    },
  ],
});
