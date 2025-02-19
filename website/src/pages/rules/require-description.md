# `require-description`

✅ The `"extends": "plugin:@graphql-eslint/schema-recommended"` property in a configuration file
enables this rule.

- Category: `Schema`
- Rule name: `@graphql-eslint/require-description`
- Requires GraphQL Schema: `false`
  [ℹ️](/docs/getting-started#extended-linting-rules-with-graphql-schema)
- Requires GraphQL Operations: `false`
  [ℹ️](/docs/getting-started#extended-linting-rules-with-siblings-operations)

Enforce descriptions in type definitions and operations.

## Usage Examples

### Incorrect

```graphql
# eslint @graphql-eslint/require-description: ['error', { types: true, FieldDefinition: true }]

type someTypeName {
  name: String
}
```

### Correct

```graphql
# eslint @graphql-eslint/require-description: ['error', { types: true, FieldDefinition: true }]

"""
Some type description
"""
type someTypeName {
  """
  Name description
  """
  name: String
}
```

### Correct

```graphql
# eslint @graphql-eslint/require-description: ['error', { OperationDefinition: true }]

# Create a new user
mutation createUser {
  # ...
}
```

### Correct

```graphql
# eslint @graphql-eslint/require-description: ['error', { rootField: true }]

type Mutation {
  "Create a new user"
  createUser: User
}

type User {
  name: String
}
```

## Config Schema

The schema defines the following properties:

### `types` (boolean)

Includes:

- `ObjectTypeDefinition`
- `InterfaceTypeDefinition`
- `EnumTypeDefinition`
- `ScalarTypeDefinition`
- `InputObjectTypeDefinition`
- `UnionTypeDefinition`

### `rootField` (boolean)

Definitions within `Query`, `Mutation`, and `Subscription` root types.

### `DirectiveDefinition` (boolean)

Read more about this kind on
[spec.graphql.org](https://spec.graphql.org/October2021/#DirectiveDefinition).

### `EnumTypeDefinition` (boolean)

Read more about this kind on
[spec.graphql.org](https://spec.graphql.org/October2021/#EnumTypeDefinition).

### `EnumValueDefinition` (boolean)

Read more about this kind on
[spec.graphql.org](https://spec.graphql.org/October2021/#EnumValueDefinition).

### `FieldDefinition` (boolean)

Read more about this kind on
[spec.graphql.org](https://spec.graphql.org/October2021/#FieldDefinition).

### `InputObjectTypeDefinition` (boolean)

Read more about this kind on
[spec.graphql.org](https://spec.graphql.org/October2021/#InputObjectTypeDefinition).

### `InputValueDefinition` (boolean)

Read more about this kind on
[spec.graphql.org](https://spec.graphql.org/October2021/#InputValueDefinition).

### `InterfaceTypeDefinition` (boolean)

Read more about this kind on
[spec.graphql.org](https://spec.graphql.org/October2021/#InterfaceTypeDefinition).

### `ObjectTypeDefinition` (boolean)

Read more about this kind on
[spec.graphql.org](https://spec.graphql.org/October2021/#ObjectTypeDefinition).

### `OperationDefinition` (boolean)

Read more about this kind on
[spec.graphql.org](https://spec.graphql.org/October2021/#OperationDefinition).

> You must use only comment syntax `#` and not description syntax `"""` or `"`.

### `ScalarTypeDefinition` (boolean)

Read more about this kind on
[spec.graphql.org](https://spec.graphql.org/October2021/#ScalarTypeDefinition).

### `UnionTypeDefinition` (boolean)

Read more about this kind on
[spec.graphql.org](https://spec.graphql.org/October2021/#UnionTypeDefinition).

## Resources

- [Rule source](https://github.com/B2o5T/graphql-eslint/tree/master/packages/plugin/src/rules/require-description.ts)
- [Test source](https://github.com/B2o5T/graphql-eslint/tree/master/packages/plugin/tests/require-description.spec.ts)
