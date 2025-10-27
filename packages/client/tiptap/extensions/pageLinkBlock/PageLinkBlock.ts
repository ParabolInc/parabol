import {GapCursor} from '@tiptap/pm/gapcursor'
import {Fragment, type Node, Slice} from '@tiptap/pm/model'
import {Plugin, TextSelection} from '@tiptap/pm/state'
import {isNodeSelection, type JSONContent, ReactNodeViewRenderer} from '@tiptap/react'
import type * as Y from 'yjs'
import {PageLinkBlockBase} from '../../../shared/tiptap/extensions/PageLinkBlockBase'
import {PageLinkBlockView} from './PageLinkBlockView'

declare module '@tiptap/core' {
  // interface Commands<ReturnType> {
  //   exampleMethod: {
  //     exampleMethod: (params: {fromIndex: number; toIndex: number}) => ReturnType
  //   }
  // }
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
        }
    }
  },
  addNodeView() {
    // By convention, components rendered here are named with a *View suffix
    return ReactNodeViewRenderer(PageLinkBlockView, {
      className: 'group',
      attrs: {
        'data-type': 'pageLinkBlock'
      },
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
          // if a canonical link gets pasted, make sure it doesn't already exist in the doc. There can only be 1!
          // if it's pasted from different doc, then the server will handle this as a move
          transformPasted(slice, view) {
            const {state} = view
            let canonicals: Set<number> | undefined = undefined

            const checkIfExists = (pageCode: number) => {
              if (!canonicals) {
                canonicals = new Set()
                // collect all canonical pageLinkBlocks in the current doc
                state.doc.descendants((node: Node) => {
                  if (node.type.name === 'pageLinkBlock' && node.attrs.canonical) {
                    canonicals!.add(node.attrs.pageCode)
                  }
                })
              }
              return canonicals.has(pageCode)
            }

            function decanonPageLinks(frag: Fragment): Fragment {
              const newChildren: Node[] = []
              frag.forEach((child) => {
                if (child.type.name === 'pageLinkBlock' && child.attrs.canonical === true) {
                  const alreadyExists = checkIfExists(child.attrs.pageCode)
                  if (alreadyExists) {
                    const linkChild = child.type.create(
                      {...child.attrs, canonical: false},
                      child.content,
                      child.marks
                    )
                    newChildren.push(linkChild)
                  } else {
                    newChildren.push(child)
                  }
                } else if (child.content?.size) {
                  // recurse into nested fragments
                  const newContent = decanonPageLinks(child.content)
                  newChildren.push(child.copy(newContent))
                } else {
                  newChildren.push(child)
                }
              })
              return Fragment.fromArray(newChildren)
            }
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
