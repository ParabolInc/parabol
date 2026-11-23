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

test('a result over 100,000 characters is cut with a notice', () => {
  const result = toolResult({data: {big: 'x'.repeat(150_000)}})
  const {text} = result.content[0] as {text: string}
  expect(text.endsWith('\n…truncated: ask for fewer fields or use pagination arguments')).toBe(true)
  expect(text.length).toBeLessThan(100_100)
})
