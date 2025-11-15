import {TableCell as TiptapTableCell} from '@tiptap/extension-table'

export const TableCell = TiptapTableCell.extend({
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
    return ['td', {...HTMLAttributes, class: 'px-2 py-1.5 border-1 border-slate-300'}, 0]
  }
})
