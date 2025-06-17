import {mergeAttributes, Node} from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageLinkBlock: {
      setPageLinkBlock: (attributes: {pageId: number; title: string}) => ReturnType
    }
  }
}

export const PageLinkBlockBase = Node.create({
  name: 'pageLinkBlock',

  group: 'block',

  defining: true,

  isolating: true,
  atom: true,

  parseHTML() {
    return [
      {
        tag: `div[data-type="${this.name}"]`
      }
    ]
  },

  renderHTML({HTMLAttributes}) {
    return ['div', mergeAttributes(HTMLAttributes, {'data-type': this.name})]
  },
  renderText({node}) {
    const pageId = node.attrs.pageId as string
    const title = node.attrs.title || ('<<Unknown>>' as string)
    return `[${title}](/pages/${pageId})`
  }
})
