import * as graphqlESLint from '@graphql-eslint/eslint-plugin';
import js from '@eslint/js';

export default [
  {
    files: ['**/*.js'],
    processor: graphqlESLint.processors.graphql,
    rules: js.configs.recommended.rules,
  },
  {
    files: ['**/*.graphql'],
    plugins: {
      '@graphql-eslint': graphqlESLint,
    },
    languageOptions: {
      parser: graphqlESLint,
    },
    rules: {
      '@graphql-eslint/require-id-when-available': 'error',
      '@graphql-eslint/no-anonymous-operations': 'error',
      '@graphql-eslint/naming-convention': [
        'error',
        {
          OperationDefinition: {
            style: 'PascalCase',
            forbiddenPrefixes: ['Query', 'Mutation', 'Subscription', 'Get'],
            forbiddenSuffixes: ['Query', 'Mutation', 'Subscription'],
          },
        },
      ],
    },
  },
];
