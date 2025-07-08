import TiptapTableHeader from '@tiptap/extension-table-header'

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
  }
})
