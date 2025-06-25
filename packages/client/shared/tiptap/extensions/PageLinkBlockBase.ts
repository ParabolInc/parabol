import {mergeAttributes, Node} from '@tiptap/core'

export type PageLinkBlockAttributes = {
  pageCode: number
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
    const attrs = node.attrs as PageLinkBlockAttributes
    const pageCode = attrs.pageCode
    const title = attrs.title || '<Untitled>'
    return `[${title}](/pages/${pageCode})`
  }
})
