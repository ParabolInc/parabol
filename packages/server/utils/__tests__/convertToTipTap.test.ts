import type {JSONContent} from '@tiptap/core'
import {GraphQLError} from 'graphql'
import {convertToTipTap} from '../convertToTipTap'
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
  '{"type":"paragraph","content":[]}'
])('refuses valid JSON %j that is not a TipTap document', (contentStr) => {
  expect(refusalOf(contentStr)).toMatchObject({extensions: {code: 'BAD_USER_INPUT'}})
})

test.each([undefined, null, ''])('turns %j into an empty document', (contentStr) => {
  expect(convertToTipTap(contentStr)).toEqual({type: 'doc', content: [{type: 'paragraph'}]})
})
