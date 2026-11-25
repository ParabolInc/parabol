import type {JSONContent} from '@tiptap/core'
import Link from '@tiptap/extension-link'

const withoutLinkMarks = (node: JSONContent): JSONContent => ({
  ...node,
  marks: node.marks?.filter((mark) => mark.type !== 'link')
})

export const LinkBase = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      // the external service of the issue that a link was drafted from, which shows it as an issue chip
      issueService: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-issue-service'),
        renderHTML: ({issueService}) => (issueService ? {'data-issue-service': issueService} : {})
      }
    }
  },
  parseMarkdown: (token, helpers) =>
    helpers.applyMark('link', helpers.parseInline(token.tokens ?? []).map(withoutLinkMarks), {
      href: token.href,
      title: token.title || null
    })
})
