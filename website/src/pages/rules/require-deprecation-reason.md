# `require-deprecation-reason`

✅ The `"extends": "plugin:@graphql-eslint/schema-recommended"` property in a configuration file
enables this rule.

- Category: `Schema`
- Rule name: `@graphql-eslint/require-deprecation-reason`
- Requires GraphQL Schema: `false`
  [ℹ️](/docs/getting-started#extended-linting-rules-with-graphql-schema)
- Requires GraphQL Operations: `false`
  [ℹ️](/docs/getting-started#extended-linting-rules-with-siblings-operations)

Require all deprecation directives to specify a reason.

## Usage Examples

### Incorrect

```graphql
# eslint @graphql-eslint/require-deprecation-reason: 'error'

type MyType {
  name: String @deprecated
}
```

### Incorrect

```graphql
# eslint @graphql-eslint/require-deprecation-reason: 'error'

type MyType {
  name: String @deprecated(reason: "")
}
```

### Correct

```graphql
# eslint @graphql-eslint/require-deprecation-reason: 'error'

type MyType {
  name: String @deprecated(reason: "no longer relevant, please use fullName field")
}
```

## Resources

- [Rule source](https://github.com/B2o5T/graphql-eslint/tree/master/packages/plugin/src/rules/require-deprecation-reason.ts)
- [Test source](https://github.com/B2o5T/graphql-eslint/tree/master/packages/plugin/tests/require-deprecation-reason.spec.ts)
