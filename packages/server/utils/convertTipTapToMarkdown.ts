import type {JSONContent} from '@tiptap/core'
import {NodeHtmlMarkdown} from 'node-html-markdown-cloudflare'
import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
import {generateHTML} from './tiptap/generateHTML'
export const convertTipTapToMarkdown = (content: JSONContent) => {
  const html = generateHTML(content, serverTipTapExtensions)
  const markdown = NodeHtmlMarkdown.translate(html)
  return markdown
}
