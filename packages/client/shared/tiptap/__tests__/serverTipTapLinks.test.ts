import {generateHTML} from '@tiptap/html/server'
import {serverTipTapExtensions} from '../serverTipTapExtensions'

const renderLink = (href: string) =>
  generateHTML(
    {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{type: 'text', text: 'click me', marks: [{type: 'link', attrs: {href}}]}]
        }
      ]
    },
    serverTipTapExtensions
  )

const getRenderedHref = (html: string) =>
  /<a [^>]*href="([^"]*)"[^>]*>click me<\/a>/.exec(html)?.[1]

test.each([
  'javascript:alert(document.cookie)',
  ' JaVaScRiPt:alert(1)',
  'java\tscript:alert(1)',
  '\u0000javascript:alert(1)',
  'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
  'vbscript:msgbox(1)',
  '/relative/path'
])('content stored with a %j link renders an inert link', (href) => {
  expect(getRenderedHref(renderLink(href))).toBe('')
})

test.each(['https://example.com/a?b=c', 'http://example.com', 'mailto:someone@example.com'])(
  'content stored with a %j link keeps its href',
  (href) => {
    expect(getRenderedHref(renderLink(href))).toBe(href)
  }
)
