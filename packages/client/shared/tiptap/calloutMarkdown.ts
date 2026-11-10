import type {
  JSONContent,
  MarkdownParseHelpers,
  MarkdownRendererHelpers,
  MarkdownToken,
  MarkdownTokenizer
} from '@tiptap/core'
import {
  CALLOUT_ALERT_MARKERS,
  CALLOUT_CHILD_TYPES,
  calloutToneFromAlertType,
  toCalloutTone
} from './calloutTones'

const ALERT = /^ {0,3}> ?\[!([A-Za-z]+)\][ \t]*([^\n]*)(?:\n|$)((?: {0,3}>[^\n]*(?:\n|$))*)/
const QUOTE_PREFIX = /^ {0,3}> ?/
const QUOTE_MARKER = '>'

const calloutChildTypes = new Set<string>(CALLOUT_CHILD_TYPES)

export const calloutMarkdownTokenizer: MarkdownTokenizer = {
  name: 'callout',
  level: 'block',
  start: (src) => src.search(/^ {0,3}> ?\[!/m),
  tokenize: (src, _tokens, helper) => {
    const match = ALERT.exec(src)
    if (!match) return undefined
    const [raw, alertType = '', title = '', quotedBody = ''] = match
    const body = quotedBody
      .split('\n')
      .map((line) => line.replace(QUOTE_PREFIX, ''))
      .join('\n')
    return {
      type: 'callout',
      raw,
      tone: calloutToneFromAlertType(alertType),
      title: title.trim(),
      tokens: helper.blockTokens(body)
    }
  }
}

export const parseCalloutMarkdown = (token: MarkdownToken, helpers: MarkdownParseHelpers) => {
  const parseBlockChildren = helpers.parseBlockChildren ?? helpers.parseChildren
  const children = parseBlockChildren(token.tokens ?? [])
  const body = children.filter((child) => calloutChildTypes.has(child.type ?? ''))
  const movedOut = children.filter((child) => !calloutChildTypes.has(child.type ?? ''))
  const title = typeof token.title === 'string' ? token.title : ''
  const titleNodes = title
    ? [
        helpers.createNode(
          'calloutTitle',
          undefined,
          helpers.tokenizeInline
            ? helpers.parseInline(helpers.tokenizeInline(title))
            : [helpers.createTextNode(title)]
        )
      ]
    : []
  const content = [...titleNodes, ...(body.length > 0 ? body : [helpers.createNode('paragraph')])]
  return [helpers.createNode('callout', {tone: toCalloutTone(token.tone)}, content), ...movedOut]
}

const quoteLines = (markdown: string) =>
  markdown
    .split('\n')
    .map((line) => (line.trim() === '' ? QUOTE_MARKER : `${QUOTE_MARKER} ${line}`))
    .join('\n')

export const renderCalloutMarkdown = (node: JSONContent, h: MarkdownRendererHelpers) => {
  const children = node.content ?? []
  const titleNode = children.find((child) => child.type === 'calloutTitle')
  const title = titleNode?.content
    ? h
        .renderChildren(titleNode.content)
        .replace(/\s*\n\s*/g, ' ')
        .trim()
    : ''
  const marker = CALLOUT_ALERT_MARKERS[toCalloutTone(node.attrs?.tone)]
  const header = `${QUOTE_MARKER} [!${marker}]${title ? ` ${title}` : ''}`
  const renderedBody = children.flatMap((child, index) =>
    child.type === 'calloutTitle'
      ? []
      : [h.renderChild?.(child, index) ?? h.renderChildren([child])]
  )
  if (renderedBody.every((rendered) => rendered.trim() === '')) return header
  return `${header}\n${renderedBody.map(quoteLines).join(`\n${QUOTE_MARKER}\n`)}`
}
