import {GapCursor} from '@tiptap/pm/gapcursor'
import {Fragment, type Node, Slice} from '@tiptap/pm/model'
import {Plugin, TextSelection} from '@tiptap/pm/state'
import {isNodeSelection, type JSONContent, ReactNodeViewRenderer} from '@tiptap/react'
import type * as Y from 'yjs'
import {PageLinkBlockBase} from '../../../shared/tiptap/extensions/PageLinkBlockBase'
import {PageLinkBlockView} from './PageLinkBlockView'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    movePageLink: {
      movePageLink: (params: {fromIndex: number; toIndex: number}) => ReturnType
    }
  }
  interface Storage {
    pageLinkBlock: PageLinkBlockStorage
  }
}

interface PageLinkBlockStorage {
  yDoc: Y.Doc
}
export const PageLinkBlock = PageLinkBlockBase.extend<{yDoc: Y.Doc}, PageLinkBlockStorage>({
  addOptions: () => ({
    // hack to enforce document
    yDoc: undefined as any
  }),
  addStorage(this) {
    const {options} = this
    return {
      yDoc: options.yDoc
    }
  },
  addCommands() {
    return {
      setPageLinkBlock:
        (attrs) =>
        ({commands}) => {
          const content = [{type: 'pageLinkBlock', attrs}, {type: 'paragraph'}] as JSONContent[]
          return commands.insertContent(content)
        },
      movePageLink:
        ({fromIndex, toIndex}) =>
        ({state, dispatch}) => {
          const blocks = state.doc.content.content
          const blockCount = blocks.length

          if (fromIndex < 0 || fromIndex >= blockCount) {
            console.error(`movePageLink: Invalid fromIndex ${fromIndex}`)
            return false
          }

          const block = blocks[fromIndex]!

          // Calculate delete range
          const fromPos = blocks.slice(0, fromIndex).reduce((pos, node) => pos + node.nodeSize, 0)
          const toDeleteEnd = fromPos + block.nodeSize

          let tr = state.tr.replace(fromPos, toDeleteEnd, Slice.empty)

          // Adjust toIndex if the delete shifts subsequent positions
          let adjustedToIndex = toIndex > fromIndex ? toIndex - 1 : toIndex
          adjustedToIndex = Math.max(0, Math.min(tr.doc.childCount, adjustedToIndex))

          // Compute insertion position
          const newBlocks = tr.doc.content.content
          const insertPos = newBlocks
            .slice(0, adjustedToIndex)
            .reduce((pos, node) => pos + node.nodeSize, 0)

          tr = tr.insert(insertPos, block.copy())
          dispatch?.(tr)
          return true
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
          /**
           * Intercept slice being copied to the clipboard.
           * We walk the slice, and if any node is a pageLinkBlock with canonical=true,
           * we clone it with canonical=false.
           * That way folks don't accidentally copy a canon page link block & paste it on another page
           * Which would trigger a move
           */
          transformCopied(slice: Slice): Slice {
            function decanonPageLinks(frag: Fragment): Fragment {
              const newChildren: Node[] = []
              frag.forEach((child) => {
                if (child.type.name === 'pageLinkBlock' && child.attrs.canonical) {
                  console.log('setting to false')
                  const newAttrs = {...child.attrs, canonical: false}
                  newChildren.push(child.type.create(newAttrs, null, child.marks))
                } else {
                  newChildren.push(child)
                }
              })
              return Fragment.fromArray(newChildren)
            }
            // return slice
            const newContent = decanonPageLinks(slice.content)
            return new Slice(newContent, slice.openStart, slice.openEnd)
          },
          handleKeyDown(view, event) {
            // return false // false means you can backspace to delete pagelinks
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
            // non-canonical pageLinks can be deleted like normal nodes
            if (!nextNode || nextNode.type.name !== 'pageLinkBlock' || !nextNode.attrs.canonical)
              return false
            const offset = isBackspace
              ? // hitting backspace when the first node is a canonical page link blcok could result in offset = -1
                Math.max(0, $from.pos - nextNode.nodeSize)
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
