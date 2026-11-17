import type {JSONContent} from '@tiptap/core'
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
