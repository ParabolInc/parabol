import {mergeAttributes, Node} from '@tiptap/core'

export type DatabaseBlockAttributes = {
  pageCode: number
  title: string
  canonical?: boolean
  isMoving?: boolean
}
/*
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    databaseBlock: {
      setPageLinkBlock: (attributes: PageLinkBlockAttributes) => ReturnType
    }
  }
}
*/

export const DatabaseBlockBase = Node.create({
  name: 'databaseBlock',

  group: 'block',

  defining: true,

  isolating: true,
  atom: true,
  addAttributes() {
    return {
      pageCode: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-id'),
        renderHTML: (attributes) => ({
          'data-id': attributes.pageCode
        })
      },
      title: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-title'),
        renderHTML: (attributes) => ({
          'data-title': attributes.title
        })
      },
      canonical: {
        parseHTML: (element) => {
          return element.getAttribute('data-canonical') === '' ? true : false
        },
        renderHTML: (attributes) => {
          return {
            'data-canonical': attributes.canonical ? '' : undefined
          }
        }
      }
    }
  },
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
    const attrs = node.attrs as DatabaseBlockAttributes
    const pageCode = attrs.pageCode
    const title = attrs.title || '<Untitled>'
    return `[${title}](/pages/${pageCode})`
  }
})
