import {JSONContent} from '@tiptap/core'
import {generateHTML} from '@tiptap/html'
import {NodeHtmlMarkdown} from 'node-html-markdown-cloudflare'
import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
export const convertTipTapToMarkdown = (content: JSONContent) => {
  const html = generateHTML(content, serverTipTapExtensions)
  const markdown = NodeHtmlMarkdown.translate(html)
  return markdown
}
