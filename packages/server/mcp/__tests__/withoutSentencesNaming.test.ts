import withoutSentencesNaming from '../withoutSentencesNaming'

test('drops each sentence that names a hidden tool and keeps the rest in order', () => {
  const text =
    'Create a template. To share it, call graphql_mutate. It refuses a duplicate name. Needs templates:write.'
  expect(withoutSentencesNaming(text, ['graphql_mutate'])).toBe(
    'Create a template. It refuses a duplicate name. Needs templates:write.'
  )
})

test('drops a paragraph left empty and keeps the others apart', () => {
  const text =
    'Start with get_me.\n\nFor anything else, use graphql_query. Learn the schema with describe_graphql.\n\nErrors carry a code.'
  expect(withoutSentencesNaming(text, ['graphql_query', 'describe_graphql'])).toBe(
    'Start with get_me.\n\nErrors carry a code.'
  )
})

test('leaves text that names no hidden tool unchanged', () => {
  const text = 'Read a page. Then edit it with edit_page.'
  expect(withoutSentencesNaming(text, ['graphql_query'])).toBe(text)
})
