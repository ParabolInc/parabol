import {GapCursor} from '@tiptap/pm/gapcursor'
import {Plugin, TextSelection} from '@tiptap/pm/state'
import {isNodeSelection, ReactNodeViewRenderer, type JSONContent} from '@tiptap/react'

import {PageLinkBlockBase} from '../../../shared/tiptap/extensions/PageLinkBlockBase'
import {PageLinkBlockView} from './PageLinkBlockView'
export const PageLinkBlock = PageLinkBlockBase.extend({
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
      auto: {
        default: false,
        parseHTML: (element) => {
          return element.getAttribute('data-auto') === '' ? true : false
        },
        renderHTML: (attributes) => {
          return {
            'data-auto': attributes.auto ? '' : undefined
          }
        }
      }
    }
  },
  addCommands() {
    return {
      setPageLinkBlock:
        (attrs) =>
        ({commands}) => {
          const content = [{type: 'pageLinkBlock', attrs}, {type: 'paragraph'}] as JSONContent[]
          return commands.insertContent(content)
        }
    }
  },

  addNodeView() {
    // By convention, components rendered here are named with a *View suffix
    return ReactNodeViewRenderer(PageLinkBlockView, {
      className: 'group',
      stopEvent() {
        // TipTap is being bad about intercepting drag/drop handling
        //github.com/ueberdosis/tiptap/issues/3199#issuecomment-1438873110
        return false
      }
    })
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleKeyDown(view, event) {
            const isBackspace = event.key === 'Backspace'
            const isDelete = event.key === 'Delete'
            if (!isBackspace && !isDelete) return false
            const {state, dispatch} = view
            const {selection, tr} = state
            const {$from, empty} = selection
            // if the pageLinkBlock is currently selected, then that's our node
            // if backspace is hit, look at the nodeBefore
            // if delete is hit, look at the nodeAfter
            const nextNode = empty
              ? isBackspace
                ? $from.nodeBefore
                : $from.nodeAfter
              : isNodeSelection(selection)
                ? selection.node
                : null
            if (!nextNode || nextNode.type.name !== 'pageLinkBlock') return false
            const offset = isBackspace
              ? $from.pos - nextNode.nodeSize
              : $from.pos + nextNode.nodeSize
            // if hitting backspace would put us between 2 nodes with no gap, use a GapCursor
            const pos = state.doc.resolve(offset)
            const isGap = GapCursor.findFrom(pos, -1, false)
            const nextSelection = isGap
              ? new GapCursor(pos)
              : TextSelection.create(state.doc, offset)
            dispatch(tr.setSelection(nextSelection).scrollIntoView())
            return true
          }
        }
      })
    ]
  }
})
