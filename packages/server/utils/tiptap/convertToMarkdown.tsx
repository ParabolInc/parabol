import {JSONContent} from '@tiptap/core'

const LIST_SPACING = '   '

const NodeTypes = [
  'doc',
  'paragraph',
  'text',
  'heading',
  'bulletList',
  'orderedList',
  'listItem',
  'codeBlock',
  'blockquote',
  'mention',
  'horizontalRule'
]
type NodeType = (typeof NodeTypes)[number]
type NodeTypeHandler = (node: JSONContent, depth?: number) => string

const isSupportedNodeType = (value?: string): value is NodeType => {
  if (!value) return false
  return NodeTypes.includes(value)
}

const tiptapNodeHandlersLookup: Record<NodeType, NodeTypeHandler> = {
  doc: ({content = []}) => content.map((node) => convertToMarkdown(node)).join('\n'),
  paragraph: ({content = []}) => content.map((node) => convertToMarkdown(node)).join(''),
  text: (node) => {
    let textContent = node.text || ''
    if (node.marks) {
      textContent = node.marks.reduce((accText, mark) => {
        const handler = textMarkHandlersLookup[mark.type]
        return handler ? handler(accText, mark) : accText
      }, textContent)
    }
    return textContent
  },
  // for now lets just make headings bold
  heading: ({content = []}) => `*${content.map((node) => convertToMarkdown(node)).join('')}*`,
  bulletList: ({content = []}, depth = 0) =>
    content
      .map((node) => `${LIST_SPACING.repeat(depth)}• ${convertToMarkdown(node, depth + 1)}`)
      .join('\n'),
  orderedList: ({content = []}, depth = 0) =>
    content
      .map(
        (node, idx) =>
          `${LIST_SPACING.repeat(depth)}${idx + 1}. ${convertToMarkdown(node, depth + 1)}`
      )
      .join('\n'),
  listItem: ({content = []}, depth = 0) =>
    content.map((node) => convertToMarkdown(node, depth)).join('\n'),
  codeBlock: ({content = []}) => {
    const markdownContent = content.map((node) => convertToMarkdown(node)).join('')
    return `\`\`\`${markdownContent}\`\`\`` // Triple backticks to denote a code block in Slack
  },
  blockquote: ({content = []}) => `> ${content.map((node) => convertToMarkdown(node)).join('')}`,
  mention: ({attrs}) => {
    const {
      /** id - TODO: here our internal Parabol user id would need to bo mapped to Slack user id */
      label
    } = attrs!
    return `\`@${label}\``
  },
  horizontalRule: () => '---'
}

const MarkTypes = ['bold', 'italic', 'link', 'strike', 'code']
type MarkType = (typeof MarkTypes)[number]
type MarkTypeHandler = (text: string, mark: {type: string; attrs?: any}) => string

const textMarkHandlersLookup: Record<MarkType, MarkTypeHandler> = {
  bold: (text) => `*${text}*`,
  italic: (text) => `_${text}_`,
  link: (text, mark) => (mark.attrs && mark.attrs.href ? `<${mark.attrs.href}|${text}>` : text),
  strike: (text) => `~${text}~`,
  code: (text) => `\`${text}\``
}

/**
 * Converts a tiptap JSONContent node to a markdown string supported by Slack
 * See Slack markdown reference for limitations and features - https://api.slack.com/reference/surfaces/formatting#basics
 * @param node - tiptap output in JSONContent format
 * @param depth - used for nested lists
 */
export const convertToMarkdown = (node: JSONContent, depth?: number): string => {
  const type = node.type
  if (!isSupportedNodeType(type))
    return node.content?.map((n) => convertToMarkdown(n)).join('') || ''

  const handler = tiptapNodeHandlersLookup[type]!
  return handler(node, depth)
}
