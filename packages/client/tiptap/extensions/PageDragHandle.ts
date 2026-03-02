import {type Editor, Extension} from '@tiptap/core'
import DragHandle from '@tiptap/extension-drag-handle'
import type {Node} from '@tiptap/pm/model'
import {NodeSelection} from '@tiptap/pm/state'
import {isNodeSelection, ReactRenderer} from '@tiptap/react'
import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate} from 'relay-runtime'
import type {PageDragHandleQuery} from '../../__generated__/PageDragHandleQuery.graphql'
import type Atmosphere from '../../Atmosphere'
import type {PageLinkBlockAttrs} from '../../shared/tiptap/extensions/PageLinkBlockBase'
import {GQLID} from '../../utils/GQLID'
import DragHandleMenu from './DragHandleMenu'

const queryNode = graphql`
  query PageDragHandleQuery($pageId: ID!) {
    public {
      page(pageId: $pageId) {
        isPrivate
        title
        isDatabase
        isMeetingTOC
        access {
          viewer
        }
      }
    }
  }
`

function isEmptyParagraph(node: Node) {
  return node.type.name === 'paragraph' && node.textContent.length === 0
}

interface NodeChangeData {
  editor: Editor
  node: Node | null
  pos: number
}

type Options = {
  atmosphere: Atmosphere
  pageId: string
}
export const PageDragHandle = Extension.create<Options>({
  name: 'PageDragHandle',

  addStorage() {
    return {
      dragHandleElement: null as HTMLDivElement | null,
      closeMenu: null as (() => void) | null
    }
  },

  onDestroy() {
    this.storage.closeMenu?.()
  },

  addKeyboardShortcuts() {
    return {
      'Mod-d': ({editor}) => {
        const {$from} = editor.state.selection
        if ($from.depth < 1) return false
        const blockPos = $from.before(1)
        const blockNode = editor.state.doc.nodeAt(blockPos)
        if (!blockNode) return false

        const json = blockNode.toJSON()
        if (json.type === 'pageLinkBlock' && json.attrs?.canonical) {
          json.attrs = {...json.attrs, canonical: false}
        }
        editor.commands.insertContentAt(blockPos + blockNode.nodeSize, json)
        return true
      },
      Delete: ({editor}) => {
        const {selection} = editor.state
        if (!isNodeSelection(selection)) return false

        const node = selection.node
        const pos = selection.from
        if (node.type.name === 'pageLinkBlock' && node.attrs.canonical) return false
        if (pos === 1) return false

        editor.view.dispatch(editor.state.tr.delete(pos, pos + node.nodeSize))
        return true
      }
    }
  },

  addExtensions() {
    const dragHandleElement = document.createElement('div')
    this.storage.dragHandleElement = dragHandleElement
    let dragHandleNode: Node | null = null
    let dragHandleNodePos: number = -1
    let menuRenderer: ReactRenderer<typeof DragHandleMenu> | null = null
    let editorRef: Editor | null = null
    const {atmosphere, pageId} = this.options

    const closeMenu = () => {
      if (!menuRenderer) return
      menuRenderer.element.remove()
      menuRenderer.destroy()
      menuRenderer = null
      editorRef?.commands.unlockDragHandle()
    }

    this.storage.closeMenu = closeMenu

    const handleDragHandleClick = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (menuRenderer) {
        closeMenu()
        return
      }

      if (!dragHandleNode || dragHandleNodePos < 0 || !editorRef) return

      editorRef.commands.lockDragHandle()

      const node = dragHandleNode
      const pos = dragHandleNodePos

      menuRenderer = new ReactRenderer(DragHandleMenu, {
        editor: editorRef,
        props: {editor: editorRef, node, pos, onClose: closeMenu, anchorElement: dragHandleElement}
      })

      document.body.appendChild(menuRenderer.element)
    }

    dragHandleElement.addEventListener('click', handleDragHandleClick)

    // WORKAROUND: The DragHandle extension adds a dragstart listener to the element
    // inside DragHandlePlugin(), but removes it in the plugin view's destroy() during
    // ProseMirror plugin lifecycle rebuilds (e.g. Collaboration syncs). Because
    // the listener is never re-added after destroy, the extension's dragHandler never
    // fires, so view.dragging is never set and ProseMirror treats every drop as external.
    //
    // Our listener here, attached in addExtensions() (called once during extension
    // resolution), persists across plugin rebuilds because it's on the element itself,
    // not managed by any plugin view lifecycle.
    dragHandleElement.addEventListener('dragstart', (e) => {
      if (!editorRef || !dragHandleNode || dragHandleNodePos < 0) return
      if (!e.dataTransfer) return
      const {view} = editorRef
      if (view.dragging) return
      const {doc} = view.state
      const from = dragHandleNodePos
      const to = dragHandleNodePos + dragHandleNode.nodeSize
      const slice = doc.slice(from, to)

      const imageWrapper = document.createElement('div')
      const domNode = view.nodeDOM(from)
      if (domNode instanceof HTMLElement) {
        imageWrapper.appendChild(domNode.cloneNode(true))
      }
      imageWrapper.style.position = 'absolute'
      imageWrapper.style.top = '-10000px'
      document.body.appendChild(imageWrapper)

      e.dataTransfer.clearData()
      e.dataTransfer.setDragImage(imageWrapper, 0, 0)

      // Tells ProseMirror this is an internal drag-move so drop deletes the source
      view.dragging = {slice, move: true}

      const selection = NodeSelection.create(doc, from)
      const {tr} = view.state
      tr.setSelection(selection)
      view.dispatch(tr)

      document.addEventListener('drop', () => imageWrapper.remove(), {once: true})

      // pageLinkBlock: update Relay store so sidebar drop targets can respond
      if (dragHandleNode.type.name === 'pageLinkBlock') {
        const attrs = dragHandleNode.attrs as PageLinkBlockAttrs
        if (!attrs.canonical) return
        const pageKey = GQLID.toKey(attrs.pageCode, 'page')
        e.dataTransfer.setData('text/plain', '__dummy__')
        e.dataTransfer.effectAllowed = 'copyMove'
        atmosphere.fetchQuery<PageDragHandleQuery>(queryNode, {pageId: pageKey}).then((res) => {
          if (attrs.pageCode !== dragHandleNode?.attrs.pageCode) return
          if (res instanceof Error) return
          const {page} = res.public
          if (!page) return
          const {access, isPrivate} = page
          commitLocalUpdate(atmosphere, (store) => {
            store
              .getRoot()
              .getLinkedRecord('viewer')
              ?.setValue(pageKey, 'draggingPageId')
              .setValue(isPrivate, 'draggingPageIsPrivate')
              .setValue(`User_pages:${pageId}`, 'draggingPageParentSection')
              .setValue(access.viewer, 'draggingPageViewerAccess')
            const parent = pageId ? store.get(pageId) : null
            parent?.setValue(false, 'isDraggingFirstChild').setValue(false, 'isDraggingLastChild')
          })
        })
      }
    })

    dragHandleElement.addEventListener('dragend', () => {
      commitLocalUpdate(atmosphere, (store) => {
        store
          .getRoot()
          .getLinkedRecord('viewer')
          ?.setValue(null, 'draggingPageId')
          .setValue(null, 'draggingPageIsPrivate')
          .setValue(null, 'draggingPageParentSection')
          .setValue(null, 'draggingPageViewerAccess')
        const parent = store.get(pageId)
        parent?.setValue(null, 'isDraggingFirstChild').setValue(null, 'isDraggingLastChild')
      })
    })

    return [
      DragHandle.configure({
        computePositionConfig: {
          placement: 'left'
        },
        getReferencedVirtualElement: () => {
          if (!editorRef || dragHandleNodePos < 0) return null
          const dom = editorRef.view.nodeDOM(dragHandleNodePos)
          if (!(dom instanceof HTMLElement)) return null
          // For list items, use the parent <ul>/<ol> rect so the handle is in the gutter
          // (with list-style-position: outside, the bullet marker sits between the ul and li edges)
          const horizontalRef = dom.tagName === 'LI' && dom.parentElement ? dom.parentElement : dom
          const horizontalRect = horizontalRef.getBoundingClientRect()
          const walker = document.createTreeWalker(dom, NodeFilter.SHOW_TEXT, {
            acceptNode: (node) =>
              node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
          })
          const textNode = walker.nextNode()
          if (!textNode) return null
          const range = document.createRange()
          range.setStart(textNode, 0)
          range.setEnd(textNode, 1)
          const lineRect = range.getBoundingClientRect()
          return {
            getBoundingClientRect: () => ({
              x: horizontalRect.x,
              y: lineRect.y,
              width: horizontalRect.width,
              height: lineRect.height,
              top: lineRect.top,
              right: horizontalRect.right,
              bottom: lineRect.bottom,
              left: horizontalRect.left
            }),
            contextElement: horizontalRef
          }
        },
        nested: {
          edgeDetection: 'none',
          rules: [
            {
              id: 'detailsStructure',
              evaluate: ({$pos, depth, node}) => {
                // Exclude detailsSummary and detailsContent themselves
                const name = node.type.name
                if (name === 'detailsSummary' || name === 'detailsContent') return 1000
                // Exclude children nested inside detailsSummary
                for (let d = depth - 1; d >= 0; d--) {
                  if ($pos.node(d).type.name === 'detailsSummary') return 1000
                }
                // Allow children of detailsContent (they should be independently draggable)
                return 0
              }
            }
          ]
        },
        render: () => {
          dragHandleElement.classList.add('drag-handle', 'hide')
          return dragHandleElement
        },
        onNodeChange: (data) => {
          const {editor, node, pos} = data as NodeChangeData
          editorRef = editor ?? editorRef
          dragHandleNode = node
          dragHandleNodePos = pos ?? -1
          if (menuRenderer) {
            closeMenu()
          }
          const isEmpty = node ? isEmptyParagraph(node) : false
          const isHidden = dragHandleElement.classList.contains('hide')
          if (isEmpty !== isHidden) {
            if (isEmpty) {
              dragHandleElement.classList.add('hide')
            } else {
              dragHandleElement.classList.remove('hide')
            }
          }
        }
      })
    ]
  }
})
