import {mergeAttributes, Node} from '@tiptap/core'

export type PageLinkBlockAttributes = {
  pageId: number
  title: string
  auto?: boolean
}
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageLinkBlock: {
      setPageLinkBlock: (attributes: PageLinkBlockAttributes) => ReturnType
    }
  }
}

export const PageLinkBlockBase = Node.create({
  name: 'pageLinkBlock',

  group: 'block',

  defining: true,

  isolating: true,
  atom: true,
  selectable: true,

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
    const title = node.attrs.title || ('<Untitled>' as string)
    return `[${title}](/pages/${pageId})`
  }
})
