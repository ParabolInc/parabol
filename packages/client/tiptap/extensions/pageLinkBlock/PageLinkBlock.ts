import {GapCursor} from '@tiptap/pm/gapcursor'
import {Fragment, type Node, Slice} from '@tiptap/pm/model'
import {NodeSelection, Plugin, TextSelection} from '@tiptap/pm/state'
import type {EditorView} from '@tiptap/pm/view'
import {isNodeSelection, type JSONContent, ReactNodeViewRenderer} from '@tiptap/react'
import type * as Y from 'yjs'
import type {TierEnum} from '../../../__generated__/useTipTapPageEditor_viewer.graphql'
import {PageLinkBlockBase} from '../../../shared/tiptap/extensions/PageLinkBlockBase'
import {isValidPageCode} from './isValidPageCode'
import {keepFocusInHost} from './keepFocusInHost'
import {type GetPageViewerAccess, keepUnownedPageLinksPlugin} from './keepUnownedPageLinksPlugin'
import {PageLinkNodeView} from './PageLinkNodeView'
import {serializeSyncedBlock} from './serializeSyncedBlock'
import {stopPageLinkBlockEvent} from './stopPageLinkBlockEvent'
import {getNestedEditor, syncedBlockEntryPlugin} from './syncedBlockFocus'

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
  preferredName?: string
  highestTier?: TierEnum
  pageId?: string
}
interface PageLinkBlockOptions {
  yDoc: Y.Doc
  getViewerAccess: GetPageViewerAccess
  preferredName?: string
  highestTier?: TierEnum
  pageId?: string
  pastedLinksAreCopies?: boolean
}

const isSyncedLink = (node: Node) => node.type.name === 'pageLinkBlock' && !!node.attrs.synced

const syncedLinksAsCopies = (fragment: Fragment): Fragment => {
  const children: Node[] = []
  fragment.forEach((child) => {
    children.push(
      isSyncedLink(child)
        ? child.type.create({...child.attrs, canonical: false}, child.content, child.marks)
        : child.content.size
          ? child.copy(syncedLinksAsCopies(child.content))
          : child
    )
  })
  return Fragment.fromArray(children)
}

const serializeSyncedLinksAsCopies = (view: EditorView, slice: Slice) => {
  let hasSyncedLink = false
  slice.content.descendants((node) => {
    hasSyncedLink ||= isSyncedLink(node)
    return !hasSyncedLink
  })
  if (!hasSyncedLink) return null
  const copies = new Slice(syncedLinksAsCopies(slice.content), slice.openStart, slice.openEnd)
  const {dom, text} = view.serializeForClipboard(copies)
  return {html: dom.innerHTML, text}
}

export const PageLinkBlock = PageLinkBlockBase.extend<PageLinkBlockOptions, PageLinkBlockStorage>({
  addOptions: () => ({
    // hack to enforce document
    yDoc: undefined as any,
    getViewerAccess: () => undefined
  }),
  addStorage(this) {
    const {options} = this
    return {
      yDoc: options.yDoc,
      preferredName: options.preferredName,
      highestTier: options.highestTier,
      pageId: options.pageId
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
    const renderer = ReactNodeViewRenderer(PageLinkNodeView, {
      className: 'group',
      attrs: {
        'data-type': 'pageLinkBlock'
      }
    })
    return (props) => {
      const nodeView = renderer(props)
      const selectNode = nodeView.selectNode?.bind(nodeView)
      nodeView.selectNode = () => {
        keepFocusInHost(nodeView.dom)
        selectNode?.()
      }
      nodeView.stopEvent = (event: Event) =>
        nodeView.dom instanceof HTMLElement && stopPageLinkBlockEvent(event, nodeView.dom)
      return nodeView
    }
  },
  addProseMirrorPlugins() {
    const {pastedLinksAreCopies} = this.options
    return [
      keepUnownedPageLinksPlugin(this.options.getViewerAccess),
      syncedBlockEntryPlugin(),
      new Plugin({
        props: {
          // if a canonical link gets pasted, make sure it doesn't already exist in the doc. There can only be 1!
          // if it's pasted from different doc, then the server will handle this as a move
          transformPasted(slice, view) {
            // return slice
            const {state} = view
            let canonicals: Set<number> | undefined = undefined

            const checkIfExists = (slicedNode: Node) => {
              const {pageCode} = slicedNode.attrs
              if (!canonicals) {
                canonicals = new Set()
                // collect all canonical pageLinkBlocks in the current doc
                state.doc.descendants((node: Node) => {
                  // node === slicedNode when dragging & dropping since the add happens before the delete
                  if (
                    node.type.name === 'pageLinkBlock' &&
                    node.attrs.canonical &&
                    node !== slicedNode
                  ) {
                    canonicals!.add(node.attrs.pageCode)
                  }
                })
              }
              return canonicals.has(pageCode)
            }

            function decanonPageLinks(frag: Fragment): Fragment {
              const newChildren: Node[] = []
              frag.forEach((child) => {
                if (child.type.name === 'pageLinkBlock') {
                  const pageCode = Number(child.attrs.pageCode)
                  if (!view.dragging && !isValidPageCode(pageCode)) return
                  const isCopy =
                    pastedLinksAreCopies || (child.attrs.canonical === true && checkIfExists(child))
                  newChildren.push(
                    child.type.create(
                      {
                        ...child.attrs,
                        canonical: isCopy ? false : child.attrs.canonical,
                        // copying will turn numbers to text, but not boolean
                        pageCode
                      },
                      child.content,
                      child.marks
                    )
                  )
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
          handleDOMEvents: {
            copy(view, event) {
              const {selection} = view.state
              if (!event.clipboardData) return false
              const clipboard =
                selection instanceof NodeSelection && isSyncedLink(selection.node)
                  ? serializeSyncedBlock(
                      {
                        pageCode: Number(selection.node.attrs.pageCode),
                        title: selection.node.attrs.title
                      },
                      getNestedEditor(view, selection.from)
                    )
                  : serializeSyncedLinksAsCopies(view, selection.content())
              if (!clipboard) return false
              event.preventDefault()
              event.clipboardData.clearData()
              event.clipboardData.setData('text/html', clipboard.html)
              event.clipboardData.setData('text/plain', clipboard.text)
              return true
            }
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
