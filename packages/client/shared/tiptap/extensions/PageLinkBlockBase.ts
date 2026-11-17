import {
  createBlockMarkdownSpec,
  type JSONContent,
  mergeAttributes,
  Node,
  parseAttributes
} from '@tiptap/core'

export type PageLinkBlockAttrs = {
  pageCode: number
  title: string
  canonical?: boolean
  isMoving?: boolean
  database?: boolean
  synced?: boolean
  content?: JSONContent[] | null
}
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageLinkBlock: {
      setPageLinkBlock: (attributes: PageLinkBlockAttrs) => ReturnType
    }
  }
}

export const PageLinkBlockBase = Node.create({
  name: 'pageLinkBlock',

  group: 'block',

  defining: true,

  isolating: true,
  atom: true,
  draggable: false,
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
      },
      database: {
        parseHTML: (element) => {
          return element.getAttribute('data-database') === '' ? true : false
        },
        renderHTML: (attributes) => {
          return {
            'data-database': attributes.database ? '' : undefined
          }
        }
      },
      synced: {
        parseHTML: (element) => element.getAttribute('data-synced') === '',
        renderHTML: (attributes) => ({
          'data-synced': attributes.synced ? '' : undefined
        })
      },
      content: {
        default: null,
        rendered: false,
        parseHTML: () => null
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
    const {synced, title} = node.attrs as PageLinkBlockAttrs
    return synced ? '' : title || '<Untitled>'
  },
  ...createBlockMarkdownSpec({
    nodeName: 'pageLinkBlock',
    parseAttributes: (attrString) => {
      const {pageCode, ...attrs} = parseAttributes(attrString)
      return pageCode === undefined || pageCode === ''
        ? attrs
        : {...attrs, pageCode: Number(pageCode)}
    }
  })
})
