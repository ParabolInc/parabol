import {JSONContent} from '@tiptap/core'

const LIST_SPACING = '   '

const tiptapNodeHandlersLookup: {[type: string]: (node: JSONContent, depth?: number) => string} = {
  doc: (node) => (node.content || []).map((node) => convertToMarkdown(node)).join('\n'),
  paragraph: (node) => (node.content || []).map((node) => convertToMarkdown(node)).join(''),
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
  heading: (node) => `*${(node.content || []).map((node) => convertToMarkdown(node)).join('')}*`,
  bulletList: (node, depth = 0) =>
    (node.content || [])
      .map((n) => `${LIST_SPACING.repeat(depth)}- ${convertToMarkdown(n, depth + 1)}`)
      .join('\n'),
  orderedList: (node, depth = 0) =>
    (node.content || [])
      .map(
        (n, idx) => `${LIST_SPACING.repeat(depth)}${idx + 1}. ${convertToMarkdown(n, depth + 1)}`
      )
      .join('\n'),
  listItem: (node, depth = 0) =>
    (node.content || []).map((n) => convertToMarkdown(n, depth)).join('\n'),
  codeBlock: (node) => {
    const content = (node.content || []).map((node) => convertToMarkdown(node)).join('')
    return `\`\`\`${content}\`\`\`` // Triple backticks to denote a code block in Slack
  }
}

const textMarkHandlersLookup: {
  [type: string]: (text: string, mark: {type: string; attrs?: any}) => string
} = {
  bold: (text) => `*${text}*`,
  italic: (text) => `_${text}_`,
  link: (text, mark) => (mark.attrs && mark.attrs.href ? `<${mark.attrs.href}|${text}>` : text),
  strike: (text) => `~${text}~`
}

export const convertToMarkdown = (node: JSONContent, depth?: number): string => {
  const handler = tiptapNodeHandlersLookup[node.type!]
  if (handler) {
    return handler(node, depth)
  } else {
    // If the node type isn't specifically handled (like an unsupported custom type), just iterate through its content if any
    return (node.content || []).map((n) => convertToMarkdown(n)).join('')
  }
}
