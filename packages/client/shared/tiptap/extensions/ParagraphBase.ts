import type {JSONContent, MarkdownParseHelpers, MarkdownToken} from '@tiptap/core'
import {Paragraph} from '@tiptap/extension-paragraph'

const isBlankInline = (node: JSONContent | undefined) =>
  !!node && (node.type === 'hardBreak' || (node.type === 'text' && !node.text?.trim()))

const trimInline = (content: JSONContent[]) => {
  const trimmed = [...content]
  while (isBlankInline(trimmed.at(0))) trimmed.shift()
  while (isBlankInline(trimmed.at(-1))) trimmed.pop()
  const first = trimmed.at(0)
  if (first?.text) trimmed[0] = {...first, text: first.text.trimStart()}
  const last = trimmed.at(-1)
  if (last?.text) trimmed[trimmed.length - 1] = {...last, text: last.text.trimEnd()}
  return trimmed
}

const toParagraphs = (inlineTokens: MarkdownToken[], helpers: MarkdownParseHelpers) => {
  const content = trimInline(helpers.parseInline(inlineTokens))
  return content.length > 0 ? [helpers.createNode('paragraph', undefined, content)] : []
}

const toImageBlock = (image: MarkdownToken, helpers: MarkdownParseHelpers) =>
  helpers.createNode('imageBlock', {
    src: image.href,
    alt: image.text || null,
    title: image.title || null
  })

export const ParagraphBase = Paragraph.extend({
  parseMarkdown(token, helpers) {
    const inlineTokens = token.tokens ?? []
    if (!inlineTokens.some((inline) => inline.type === 'image')) {
      return this.parent?.(token, helpers) ?? []
    }
    const blocks: JSONContent[] = []
    let textRun: MarkdownToken[] = []
    inlineTokens.forEach((inline) => {
      if (inline.type !== 'image') {
        textRun.push(inline)
        return
      }
      blocks.push(...toParagraphs(textRun, helpers), toImageBlock(inline, helpers))
      textRun = []
    })
    return [...blocks, ...toParagraphs(textRun, helpers)]
  }
})
