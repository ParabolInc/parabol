import type {JSONContent} from '@tiptap/core'

const withBold = (node: JSONContent): JSONContent => {
  if (node.type !== 'text') return node
  const marks = node.marks ?? []
  return marks.some((mark) => mark.type === 'bold')
    ? node
    : {...node, marks: [...marks, {type: 'bold'}]}
}

const replaceCallout = (node: JSONContent): JSONContent => {
  if (node.type !== 'callout') {
    return node.content ? {...node, content: replaceCalloutsWithBlockquotes(node.content)} : node
  }
  const children = node.content ?? []
  const title = children.find((child) => child.type === 'calloutTitle')
  const titleParagraphs: JSONContent[] = title?.content?.length
    ? [{type: 'paragraph', content: title.content.map(withBold)}]
    : []
  const body = children.filter((child) => child.type !== 'calloutTitle')
  return {
    type: 'blockquote',
    content: [...titleParagraphs, ...replaceCalloutsWithBlockquotes(body)]
  }
}

export const replaceCalloutsWithBlockquotes = (content: JSONContent[]): JSONContent[] =>
  content.map(replaceCallout)
