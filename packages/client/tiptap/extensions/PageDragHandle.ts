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
        nested: true,
        render: () => {
          dragHandleElement.classList.add('drag-handle', 'hide')
          return dragHandleElement
        },
        onNodeChange: (data) => {
          const {editor, node, pos} = data as NodeChangeData
          editorRef = editor ?? editorRef
          dragHandleNode = node
          dragHandleNodePos = pos ?? -1
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
    // dataTransfer must have at least one item for browsers to fire 'drop'.
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
