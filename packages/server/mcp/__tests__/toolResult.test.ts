import {GraphQLError} from 'graphql'
import toolResult from '../toolResult'

test('data comes back as JSON text', () => {
  expect(toolResult({data: {viewer: {id: 'a'}}})).toEqual({
    content: [{type: 'text', text: '{"viewer":{"id":"a"}}'}]
  })
})

test('errors come back with their code and no other detail', () => {
  const result = toolResult({
    errors: [new GraphQLError('nope', {extensions: {code: 'FORBIDDEN', secret: 1}})]
  })
  expect(result.isError).toBe(true)
  expect(JSON.parse((result.content[0] as {text: string}).text)).toEqual([
    {message: 'nope', code: 'FORBIDDEN'}
  ])
})

test('a rate-limit error carries the seconds to wait from Retry-After', () => {
  const result = toolResult({
    errors: [
      new GraphQLError('429 Too Many Requests', {
        extensions: {code: 'TOO_MANY_REQUESTS', http: {status: 429, headers: {'Retry-After': '42'}}}
      })
    ]
  })
  expect(JSON.parse((result.content[0] as {text: string}).text)).toEqual([
    {message: '429 Too Many Requests', code: 'TOO_MANY_REQUESTS', retryAfter: 42}
  ])
})

test('error details are added to every error', () => {
  const result = toolResult(
    {errors: [new GraphQLError('nope', {extensions: {code: 'FORBIDDEN'}})]},
    {pageId: 'page:1'}
  )
  expect(JSON.parse((result.content[0] as {text: string}).text)).toEqual([
    {message: 'nope', code: 'FORBIDDEN', pageId: 'page:1'}
  ])
})

test('a result over 100,000 characters is cut with a notice', () => {
  const result = toolResult({data: {big: 'x'.repeat(150_000)}})
  const {text} = result.content[0] as {text: string}
  expect(text.endsWith('\n…truncated: ask for fewer fields or use pagination arguments')).toBe(true)
  expect(text.length).toBeLessThan(100_100)
})

test('data that arrives with errors comes back with both and is not an error result', () => {
  const result = toolResult({
    data: {viewer: {id: 'a'}},
    errors: [new GraphQLError('nope', {extensions: {code: 'FORBIDDEN'}})]
  })
  expect(result.isError).toBeUndefined()
  expect(JSON.parse((result.content[0] as {text: string}).text)).toEqual({
    data: {viewer: {id: 'a'}},
    errors: [{message: 'nope', code: 'FORBIDDEN'}]
  })
})

test('errors with null data stay an error result', () => {
  const result = toolResult({
    data: null,
    errors: [new GraphQLError('nope', {extensions: {code: 'FORBIDDEN'}})]
  })
  expect(result.isError).toBe(true)
})
