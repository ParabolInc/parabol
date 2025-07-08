import TiptapTableCell from '@tiptap/extension-table-cell'

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
  }
})
