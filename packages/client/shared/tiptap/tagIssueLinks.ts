import type {JSONContent} from '@tiptap/core'

// A link that shows its own URL is left alone: a chip does not wrap, and a URL is longer than a line
const tagIssueLinks = (
  node: JSONContent,
  serviceByUrl: ReadonlyMap<string, string>
): JSONContent => {
  if (node.content) {
    return {...node, content: node.content.map((child) => tagIssueLinks(child, serviceByUrl))}
  }
  if (!node.marks) return node
  return {
    ...node,
    marks: node.marks.map((mark) => {
      const href = mark.attrs?.href
      const issueService =
        mark.type === 'link' && node.text !== href ? serviceByUrl.get(href) : undefined
      return issueService ? {...mark, attrs: {...mark.attrs, issueService}} : mark
    })
  }
}

export default tagIssueLinks
