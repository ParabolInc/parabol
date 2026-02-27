import {type Editor, Extension} from '@tiptap/core'
import DragHandle from '@tiptap/extension-drag-handle'
import type {Node} from '@tiptap/pm/model'
import {NodeSelection, Plugin} from '@tiptap/pm/state'
import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate} from 'relay-runtime'
import type {PageDragHandleQuery} from '../../__generated__/PageDragHandleQuery.graphql'
import type Atmosphere from '../../Atmosphere'
import type {PageLinkBlockAttrs} from '../../shared/tiptap/extensions/PageLinkBlockBase'
import {GQLID} from '../../utils/GQLID'

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

type Options = {
  atmosphere: Atmosphere
  pageId: string
}
export const PageDragHandle = Extension.create<Options>({
  name: 'PageDragHandle',

  addStorage() {
    return {
      dragHandleElement: null as HTMLDivElement | null
    }
  },

  addExtensions() {
    const dragHandleElement = document.createElement('div')
    this.storage.dragHandleElement = dragHandleElement
    let dragHandleNode: Node | null = null
    let dragHandleNodePos: number = -1
    let editorRef: Editor | null = null
    const {atmosphere, pageId} = this.options

    // The extension's dragstart listener on the element gets removed during
    // ProseMirror plugin lifecycle rebuilds and never re-added (known issue,
    // see "TODO: Kills even on hot reload" in extension source). We add our
    // own persistent listener that replicates the extension's dragHandler.
    dragHandleElement.addEventListener('dragstart', (e) => {
      if (!editorRef || !dragHandleNode || dragHandleNodePos < 0) return
      if (!e.dataTransfer) return
      const {view} = editorRef
      if (view.dragging) return // extension handled it (defensive guard)
      const {doc} = view.state
      const from = dragHandleNodePos
      const to = dragHandleNodePos + dragHandleNode.nodeSize
      const slice = doc.slice(from, to)

      // Create drag image from cloned DOM node
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

      // Tell ProseMirror this is an internal drag-move
      view.dragging = {slice, move: true}

      // Select the node being dragged
      const selection = NodeSelection.create(doc, from)
      const {tr} = view.state
      tr.setSelection(selection)
      view.dispatch(tr)

      document.addEventListener('drop', () => imageWrapper.remove(), {once: true})

      // pageLinkBlock: also update Relay store for sidebar drop targets
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
        nested: true,
        render: () => {
          dragHandleElement.classList.add('drag-handle', 'hide')
          return dragHandleElement
        },
        onNodeChange: (data) => {
          const {node} = data
          const pos: number = (data as any).pos ?? -1
          editorRef = (data as any).editor ?? editorRef
          dragHandleNode = node
          dragHandleNodePos = pos
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
  },

  addProseMirrorPlugins() {
    // Ensure dataTransfer has data after clearData() calls.
    // Some browsers won't fire 'drop' without at least one data item.
    return [
      new Plugin({
        view() {
          const onDragStart = (e: DragEvent) => {
            const target = e.target as HTMLElement
            if (!target?.classList?.contains('drag-handle')) return
            if (e.dataTransfer && !e.dataTransfer.types.length) {
              e.dataTransfer.setData('text/plain', '')
            }
          }
          window.addEventListener('dragstart', onDragStart)
          return {
            destroy() {
              window.removeEventListener('dragstart', onDragStart)
            }
          }
        }
      })
    ]
  }
})
