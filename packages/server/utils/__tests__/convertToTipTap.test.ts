import type {JSONContent} from '@tiptap/core'
import {GraphQLError} from 'graphql'
import {plaintextToTipTap} from '../../../client/shared/tiptap/plaintextToTipTap'
import {convertToTipTap, parseEditorDoc, readStoredTipTap} from '../convertToTipTap'
import {stripUnsafeLinks} from '../stripUnsafeLinks'

const linkedText = (href: string): JSONContent => ({
  type: 'text',
  text: 'click me',
  marks: [{type: 'bold'}, {type: 'link', attrs: {href, target: '_blank'}}]
})

const docWithLink = (href: string): JSONContent => ({
  type: 'doc',
  content: [{type: 'paragraph', content: [linkedText(href)]}]
})

test.each([
  'javascript:alert(document.cookie)',
  ' JaVaScRiPt:alert(1)',
  'java\nscript:alert(1)',
  'data:text/html,<script>alert(1)</script>',
  '/relative/path'
])('drops a %j link mark on write and keeps its text', (href) => {
  const content = convertToTipTap(JSON.stringify(docWithLink(href)))
  expect(content.content?.[0]?.content?.[0]).toEqual({
    type: 'text',
    text: 'click me',
    marks: [{type: 'bold'}]
  })
})

test.each(['https://example.com', 'http://example.com', 'mailto:someone@example.com'])(
  'keeps a %j link mark on write',
  (href) => {
    const doc = docWithLink(href)
    expect(convertToTipTap(JSON.stringify(doc))).toEqual(doc)
  }
)

test('strips unsafe links nested in lists and task items', () => {
  const doc: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'taskList',
        content: [
          {
            type: 'taskItem',
            attrs: {checked: false},
            content: [{type: 'paragraph', content: [linkedText('javascript:alert(1)')]}]
          }
        ]
      }
    ]
  }
  expect(JSON.stringify(stripUnsafeLinks(doc))).not.toContain('javascript:')
})

test('leaves content without marks unchanged', () => {
  const doc: JSONContent = {type: 'doc', content: [{type: 'paragraph'}]}
  expect(convertToTipTap(JSON.stringify(doc))).toEqual(doc)
})

const refusalOf = (contentStr: string) => {
  try {
    convertToTipTap(contentStr)
  } catch (error) {
    return error
  }
  return undefined
}

test.each([
  'Did **a thing** & fixed [the link](https://example.com)',
  '## Heading\n\n- one\n- two',
  'plain words',
  '{"type":"doc",',
  '   '
])('refuses %j as content that is not stringified TipTap JSON', (contentStr) => {
  const error = refusalOf(contentStr)
  expect(error).toBeInstanceOf(GraphQLError)
  expect(error).toMatchObject({
    message: expect.stringContaining('stringified TipTap JSON'),
    extensions: {code: 'BAD_USER_INPUT'}
  })
})

test.each([
  '"just a string"',
  '42',
  'true',
  'null',
  '[]',
  '{"blocks":[],"entityMap":{}}',
  '{"type":"paragraph","content":[{"type":"text","text":"x"}]}'
])('refuses valid JSON %j whose top node is not a doc', (contentStr) => {
  const error = refusalOf(contentStr)
  expect(error).toBeInstanceOf(GraphQLError)
  expect(error).toMatchObject({
    message: 'The content is not a valid editor document: the top node must be a doc',
    extensions: {code: 'BAD_USER_INPUT'}
  })
})

test.each([
  ['an unknown node type', '{"type":"doc","content":[{"type":"bogus"}]}', 'bogus'],
  ['content that is not a list', '{"type":"doc","content":"hello"}', 'Fragment.fromJSON'],
  [
    'text straight under the doc',
    '{"type":"doc","content":[{"type":"text","text":"x"}]}',
    'text is not a block'
  ],
  [
    'an unknown mark',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"x","marks":[{"type":"nope"}]}]}]}',
    'nope'
  ],
  [
    'a text key on a paragraph',
    '{"type":"doc","content":[{"type":"paragraph","text":"Hello"}]}',
    'paragraph has a text key'
  ],
  ['a text key on the doc', '{"type":"doc","text":"Hi"}', 'doc has a text key']
])('refuses a doc with %s and says why', (_label, contentStr, reason) => {
  const error = refusalOf(contentStr)
  expect(error).toBeInstanceOf(GraphQLError)
  expect(error).toMatchObject({
    message: expect.stringContaining('The content is not a valid editor document: '),
    extensions: {code: 'BAD_USER_INPUT'}
  })
  expect((error as GraphQLError).message).toContain(reason)
  expect((error as GraphQLError).message).not.toContain('Markdown')
})

test.each(['{"type":"doc","content":[]}', '{"type":"doc"}'])(
  'still takes the empty document %j',
  (contentStr) => {
    expect(convertToTipTap(contentStr)).toEqual(JSON.parse(contentStr))
  }
)

test.each([undefined, null, ''])('turns %j into an empty document', (contentStr) => {
  expect(convertToTipTap(contentStr)).toEqual({type: 'doc', content: [{type: 'paragraph'}]})
})

test.each([
  ['an empty reply box', plaintextToTipTap('')],
  ['a task title with a tag', plaintextToTipTap('Fix it', {taskTags: ['archived']})],
  [
    'a task list',
    {
      type: 'doc',
      content: [
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: {checked: true},
              content: [{type: 'paragraph', content: [{type: 'text', text: 'Done'}]}]
            }
          ]
        }
      ]
    }
  ],
  [
    'a mention',
    {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {type: 'text', text: 'Thanks '},
            {type: 'mention', attrs: {id: 'user1', label: 'Ann'}}
          ]
        }
      ]
    }
  ]
])('takes the editor document for %s', (_label, doc) => {
  expect(convertToTipTap(JSON.stringify(doc))).toEqual(doc)
})

test('still takes a paragraph nested in a paragraph, the shape deployed clients send for archived tasks', () => {
  const doc = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {type: 'text', text: 'Fix it'},
          {
            type: 'paragraph',
            content: [
              {type: 'taskTag', attrs: {id: 'archived', label: null, mentionSuggestionChar: '@'}}
            ]
          }
        ]
      }
    ]
  }
  expect(convertToTipTap(JSON.stringify(doc))).toEqual(doc)
})

test('parseEditorDoc refuses an empty string rather than clearing the content', () => {
  expect(() => parseEditorDoc('')).toThrow(GraphQLError)
})

describe('readStoredTipTap', () => {
  const emptyDoc = {type: 'doc', content: [{type: 'paragraph'}]}

  test('reads stored content without checking it against the schema', () => {
    const stored = JSON.stringify({type: 'doc', content: [{type: 'bogus'}]})
    expect(readStoredTipTap(stored)).toEqual({type: 'doc', content: [{type: 'bogus'}]})
  })

  test('strips unsafe links like a write does', () => {
    const content = readStoredTipTap(JSON.stringify(docWithLink('javascript:alert(1)')))
    expect(content.content?.[0]?.content?.[0]?.marks).toEqual([{type: 'bold'}])
  })

  test.each([undefined, null, '', 'not json'])(
    'falls back to an empty document for %j',
    (stored) => {
      expect(readStoredTipTap(stored)).toEqual(emptyDoc)
    }
  )
})
