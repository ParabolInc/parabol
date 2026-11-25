import tipTapContentToMarkdown, {withMarkdownContent} from '../tipTapContentToMarkdown'

const text = (value: string) => ({type: 'text', text: value})
const paragraph = (...content: object[]) => ({type: 'paragraph', content})
const listItem = (value: string) => ({type: 'listItem', content: [paragraph(text(value))]})
const doc = (...content: object[]) => JSON.stringify({type: 'doc', content})

test('a bullet list reads back as a markdown list', () => {
  const content = doc({type: 'bulletList', content: [listItem('one'), listItem('two')]})
  expect(tipTapContentToMarkdown(content, 'fallback')).toBe('- one\n- two')
})

test('a paragraph and an ordered list read back with one blank line between them', () => {
  const content = doc(paragraph(text('Intro')), {
    type: 'orderedList',
    content: [listItem('one'), listItem('two')]
  })
  expect(tipTapContentToMarkdown(content, 'fallback')).toBe('Intro\n\n1. one\n2. two')
})

test('a mention reads back as the name the editor shows, without its user id', () => {
  const content = doc(
    paragraph(
      text('Ask '),
      {type: 'mention', attrs: {id: 'local|abc', label: 'Ann'}},
      text(' to review')
    )
  )
  const markdown = tipTapContentToMarkdown(content, 'fallback')
  expect(markdown).toBe('Ask Ann to review')
  expect(markdown).not.toContain('local|abc')
})

test('a task tag reads back as the hashtag the editor shows', () => {
  const content = doc(paragraph(text('Old idea '), {type: 'taskTag', attrs: {id: 'archived'}}))
  expect(tipTapContentToMarkdown(content, 'fallback')).toBe('Old idea #archived')
})

test('content that is not editor JSON reads back as the fallback', () => {
  expect(tipTapContentToMarkdown('{not json', 'fallback')).toBe('fallback')
})

test('content that writes no markdown reads back as the fallback', () => {
  expect(tipTapContentToMarkdown(doc({type: 'paragraph'}), 'fallback')).toBe('fallback')
})

test('every object with content and plaintextContent gets markdown content in their place', () => {
  const content = doc({type: 'bulletList', content: [listItem('one'), listItem('two')]})
  const result = withMarkdownContent({
    data: {
      shared: {
        responses: [
          {id: 'r1', content, plaintextContent: 'one\n\ntwo'},
          {id: 'r2', sharedAt: 'now'}
        ]
      }
    }
  })
  expect(result).toEqual({
    data: {
      shared: {
        responses: [
          {id: 'r1', content: '- one\n- two'},
          {id: 'r2', sharedAt: 'now'}
        ]
      }
    }
  })
})

test('errors and missing data pass through unchanged', () => {
  const errors = [{message: 'Nope', extensions: {code: 'FORBIDDEN'}}]
  expect(withMarkdownContent({errors})).toEqual({errors})
  expect(withMarkdownContent({data: null, errors})).toEqual({data: null, errors})
})
