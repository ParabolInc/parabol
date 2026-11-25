import getOperationKind from '../getOperationKind'

test('a query is a query', () => {
  expect(getOperationKind('{viewer{id}}')).toBe('query')
  expect(getOperationKind('query Me {viewer{id}}')).toBe('query')
})

test('a mutation is a mutation', () => {
  expect(getOperationKind('mutation {logout}')).toBe('mutation')
})

test('a subscription is a subscription', () => {
  expect(getOperationKind('subscription {taskSubscription{__typename}}')).toBe('subscription')
})

test('two operations need an operationName', () => {
  const document = 'query A {viewer{id}} mutation B {logout}'
  expect(getOperationKind(document)).toBe('invalid')
  expect(getOperationKind(document, 'B')).toBe('mutation')
  expect(getOperationKind(document, 'A')).toBe('query')
  expect(getOperationKind(document, 'C')).toBe('invalid')
})

test('garbage is invalid', () => {
  expect(getOperationKind('not graphql {')).toBe('invalid')
  expect(getOperationKind('fragment F on User {id}')).toBe('invalid')
})
