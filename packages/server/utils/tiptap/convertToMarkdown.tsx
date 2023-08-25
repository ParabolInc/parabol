import {JSONContent} from '@tiptap/core'

const LIST_SPACING = '   '

const tiptapNodeHandlersLookup: {[type: string]: (node: JSONContent, depth?: number) => string} = {
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
      /** id - here's our internal Parabol user id that'd need to bo mapped to Slack user id */
      label
    } = attrs!
    return `<@${label}>`
  },
  horizontalRule: () => '---'
}

const textMarkHandlersLookup: {
  [type: string]: (text: string, mark: {type: string; attrs?: any}) => string
} = {
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
  const handler = tiptapNodeHandlersLookup[node.type!]
  if (handler) {
    return handler(node, depth)
  }
  // If the node type isn't specifically handled (like an unsupported custom type), just iterate through its content if any
  return (node.content || []).map((n) => convertToMarkdown(n)).join('')
}
