import {TableHeader as TiptapTableHeader} from '@tiptap/extension-table'

export const TableHeader = TiptapTableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      active: {
        default: null,
        renderHTML: (attributes) => {
          const {active} = attributes
          if (active) {
            return {'data-active': active}
          }
          return {}
        }
        /*
        parseHTML: (element) => {
          return element.style.backgroundColor.replace(/['"]+/g, '')
        },
        */
      }
    }
  },
  renderHTML({HTMLAttributes}) {
    return [
      'th',
      {
        ...HTMLAttributes,
        class:
          'px-2 py-1.5 text-left relative text-bold text-middle border-1 border-slate-300 bg-slate-100'
      },
      0
    ]
  }
})
