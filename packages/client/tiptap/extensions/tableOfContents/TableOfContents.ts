import {ReactNodeViewRenderer} from '@tiptap/react'
import {TableOfContentsBase} from '../../../shared/tiptap/extensions/TableOfContentsBase'
import {TableOfContentsView} from './TableOfContentsView'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableOfContents: {
      setTableOfContents: () => ReturnType
    }
  }
}

export const TableOfContents = TableOfContentsBase.extend({
  addCommands() {
    return {
      setTableOfContents:
        () =>
        ({commands}) =>
          commands.insertContent({type: this.name})
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(TableOfContentsView, {className: 'group'})
  }
})
