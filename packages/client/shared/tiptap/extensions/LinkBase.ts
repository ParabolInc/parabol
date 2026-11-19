import Link from '@tiptap/extension-link'

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
  }
})
