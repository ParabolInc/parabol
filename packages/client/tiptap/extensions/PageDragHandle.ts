import {type Editor, Extension} from '@tiptap/core'
import DragHandle from '@tiptap/extension-drag-handle'
import type {Node, ResolvedPos} from '@tiptap/pm/model'
import {NodeSelection, Plugin, PluginKey, Selection} from '@tiptap/pm/state'
import type {EditorView} from '@tiptap/pm/view'
import {isNodeSelection, ReactRenderer} from '@tiptap/react'
import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate} from 'relay-runtime'
import type {PageDragHandleQuery} from '../../__generated__/PageDragHandleQuery.graphql'
import type Atmosphere from '../../Atmosphere'
import {lookupPageViewerGrant} from '../../hooks/usePageViewerAccess'
import type {PageLinkBlockAttrs} from '../../shared/tiptap/extensions/PageLinkBlockBase'
import {GQLID} from '../../utils/GQLID'
import {endBlockDrag, startBlockDrag} from '../blockMove/blockDragSession'
import {prepareBlockDrag} from '../blockMove/prepareBlockDrag'
import type {TrackedRange} from '../blockMove/trackRange'
import {
  createBlockSelection,
  getBlockSelectionAround,
  getDroppedBlockRange,
  isBlockRun,
  selectBlocksThrough
} from '../blockSelection/blockSelectionState'
import {type BlockRange, countBlocks} from '../blockSelection/blockUnits'
import DragHandleMenu from './DragHandleMenu'
import {duplicateSyncedBlockAsPlain} from './pageLinkBlock/duplicateSyncedBlockAsPlain'

const queryNode = graphql`
  query PageDragHandleQuery($pageId: ID!) {
    public {
      page(pageId: $pageId) {
        isPrivate
        title
        isDatabase
        isMeetingTOC
        isSyncedBlock
        access {
          viewer
        }
      }
    }
  }
`

// Approximates a text line so the handle sits at the top of a media block
const DRAG_HANDLE_ANCHOR_HEIGHT = 24
const SYNCED_BLOCK_HANDLE_OFFSET = 26
const SYNCED_BLOCK_LINE_HANDLE_INSET = 8

function isEmptyParagraph(node: Node) {
  return node.type.name === 'paragraph' && node.textContent.length === 0
}

function isInside($pos: ResolvedPos, depth: number, typeName: string) {
  for (let d = depth - 1; d >= 0; d--) {
    if ($pos.node(d).type.name === typeName) return true
  }
  return false
}

const setDragImage = (dataTransfer: DataTransfer, view: EditorView, positions: number[]) => {
  const imageWrapper = document.createElement('div')
  positions.forEach((pos) => {
    const domNode = view.nodeDOM(pos)
    if (domNode instanceof HTMLElement) {
      imageWrapper.appendChild(domNode.cloneNode(true))
    }
  })
  imageWrapper.style.position = 'absolute'
  imageWrapper.style.top = '-10000px'
  document.body.appendChild(imageWrapper)
  dataTransfer.clearData()
  dataTransfer.setDragImage(imageWrapper, 0, 0)
  const removeImage = () => {
    imageWrapper.remove()
    document.removeEventListener('drop', removeImage)
    document.removeEventListener('dragend', removeImage)
  }
  document.addEventListener('drop', removeImage)
  document.addEventListener('dragend', removeImage)
}

const prepareSelectionDrop = (view: EditorView, draggedRange: TrackedRange | null) => {
  const {doc, selection} = view.state
  const current = draggedRange?.current()
  const range = current && {...current, depth: doc.resolve(current.from).depth}
  if (range && isBlockRun(doc, range)) {
    const run = createBlockSelection(doc, range)
    if (!run.eq(selection)) view.dispatch(view.state.tr.setSelection(run))
    view.dragging = {slice: doc.slice(range.from, range.to), move: true}
    return
  }
  const $pos = doc.resolve(selection.from)
  const caret = Selection.findFrom($pos, 1, true) ?? Selection.findFrom($pos, -1, true)
  if (caret) view.dispatch(view.state.tr.setSelection(caret))
}

const getChildPositions = (view: EditorView, range: BlockRange) => {
  const $from = view.state.doc.resolve(range.from)
  const positions: number[] = []
  for (let pos = range.from, index = $from.index(); pos < range.to; index++) {
    positions.push(pos)
    pos += $from.parent.child(index).nodeSize
  }
  return positions
}

interface NodeChangeData {
  editor: Editor
  node: Node | null
  pos: number
}

type Options = {
  atmosphere: Atmosphere
  pageId: string
  isNested?: boolean
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
        const {selection} = editor.state
        if (
          isNodeSelection(selection) &&
          selection.node.type.name === 'pageLinkBlock' &&
          selection.node.attrs.synced
        ) {
          duplicateSyncedBlockAsPlain(editor, selection.from, Number(selection.node.attrs.pageCode))
          return true
        }
        const {$from} = selection
        if ($from.depth < 1) return false
        // Find the innermost listItem/taskItem ancestor so we duplicate just the item
        let targetDepth = 1
        for (let d = $from.depth; d > 1; d--) {
          const name = $from.node(d).type.name
          if (name === 'listItem' || name === 'taskItem') {
            targetDepth = d
            break
          }
        }
        const blockPos = $from.before(targetDepth)
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
        if (pos === 0) return true

        editor.view.dispatch(editor.state.tr.delete(pos, pos + node.nodeSize))
        return true
      }
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('pageTargetDrop'),
        props: {
          handleDrop: (_view, event) =>
            event.target instanceof Element &&
            !!event.target.closest('[data-drop-in], [data-drop-refused]')
        }
      })
    ]
  },

  addExtensions() {
    const dragHandleElement = document.createElement('div')
    this.storage.dragHandleElement = dragHandleElement
    if (!this.options.isNested) dragHandleElement.dataset.hostHandle = ''
    let dragHandleNode: Node | null = null
    let dragHandleNodePos: number = -1
    let menuRenderer: ReactRenderer<typeof DragHandleMenu> | null = null
    let editorRef: Editor | null = null
    let didStartDrag = false
    let isDraggingSelection = false
    let draggedRange: TrackedRange | null = null
    const {atmosphere, pageId, isNested} = this.options

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

      const node = dragHandleNode
      const pos = dragHandleNodePos
      const {state, view} = editorRef

      if (e.shiftKey) {
        const extended = selectBlocksThrough(state, {from: pos, to: pos + node.nodeSize})
        if (!extended) return
        view.dispatch(state.tr.setSelection(extended))
        view.dom.focus({preventScroll: true})
        return
      }

      const selected = getBlockSelectionAround(state, pos, pos + node.nodeSize)
      const isSelectedAlone = selected?.from === pos && selected.to === pos + node.nodeSize
      const selection =
        selected && !isSelectedAlone
          ? {range: selected, count: countBlocks(state.doc, selected)}
          : null

      editorRef.commands.lockDragHandle()

      menuRenderer = new ReactRenderer(DragHandleMenu, {
        editor: editorRef,
        props: {
          editor: editorRef,
          node,
          pos,
          onClose: closeMenu,
          anchorElement: dragHandleElement,
          canCreateSubPage:
            !isNested && !!lookupPageViewerGrant(atmosphere, GQLID.fromKey(pageId)[0]),
          selection
        }
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
      endBlockDrag(atmosphere)
      if (!editorRef || !dragHandleNode || dragHandleNodePos < 0) return
      if (!e.dataTransfer) return
      const {view} = editorRef
      if (view.dragging) return
      const plan = prepareBlockDrag({
        editor: editorRef,
        node: dragHandleNode,
        pos: dragHandleNodePos,
        pageId,
        atmosphere
      })
      if (plan.kind === 'refuse') {
        e.preventDefault()
        e.stopImmediatePropagation()
        return
      }
      const {doc} = view.state
      if (plan.kind === 'blocks' && plan.selection) {
        // the drag handle's own listener re-selects a nested run at depth 0
        e.stopImmediatePropagation()
        const {from, to} = plan.selection
        setDragImage(e.dataTransfer, view, getChildPositions(view, plan.selection))
        e.dataTransfer.setData('text/plain', '__dummy__')
        e.dataTransfer.effectAllowed = 'copyMove'
        didStartDrag = true
        isDraggingSelection = true
        draggedRange = plan.session.range
        view.dragging = {slice: doc.slice(from, to), move: true}
        setTimeout(() => {
          dragHandleElement.style.pointerEvents = 'none'
        })
        startBlockDrag(atmosphere, plan.session, plan.refusal)
        return
      }
      const from = dragHandleNodePos
      const to = dragHandleNodePos + dragHandleNode.nodeSize
      const slice = doc.slice(from, to)

      setDragImage(e.dataTransfer, view, [from])

      // Tells ProseMirror this is an internal drag-move so drop deletes the source
      didStartDrag = true
      view.dragging = {slice, move: true}

      const selection = NodeSelection.create(doc, from)
      const {tr} = view.state
      tr.setSelection(selection)
      view.dispatch(tr)

      if (plan.kind === 'blocks') {
        e.dataTransfer.setData('text/plain', '__dummy__')
        e.dataTransfer.effectAllowed = 'copyMove'
        startBlockDrag(atmosphere, plan.session, plan.refusal)
        return
      }

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
      endBlockDrag(atmosphere)
      if (editorRef && didStartDrag) editorRef.view.dragging = null
      dragHandleElement.style.pointerEvents = 'auto'
      didStartDrag = false
      isDraggingSelection = false
      draggedRange = null
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

    const preventShiftClickSelection = (e: MouseEvent) => {
      if (e.shiftKey) e.preventDefault()
    }

    const selectionDrag = Extension.create({
      name: 'selectionDrag',
      addProseMirrorPlugins: () => [
        new Plugin({
          key: new PluginKey('selectionDrag'),
          view: () => {
            dragHandleElement.addEventListener('mousedown', preventShiftClickSelection)
            return {
              destroy: () => {
                dragHandleElement.removeEventListener('mousedown', preventShiftClickSelection)
              }
            }
          },
          props: {
            handleDOMEvents: {
              drop: (view) => {
                if (isDraggingSelection && view.dragging) prepareSelectionDrop(view, draggedRange)
                return false
              }
            }
          },
          appendTransaction: (transactions, _oldState, newState) => {
            if (!isDraggingSelection) return null
            const range = getDroppedBlockRange(transactions)
            if (!range) return null
            isDraggingSelection = false
            return newState.tr.setSelection(createBlockSelection(newState.doc, range))
          }
        })
      ]
    })

    return [
      selectionDrag,
      DragHandle.configure({
        computePositionConfig: {
          placement: 'left'
        },
        getReferencedVirtualElement: () => {
          if (!editorRef || dragHandleNodePos < 0) return null
          const dom = editorRef.view.nodeDOM(dragHandleNodePos)
          if (!(dom instanceof HTMLElement)) return null
          // Walk up one DOM level for horizontal positioning so the handle stays in the
          // gutter even when the extension detects a deeply nested node (e.g. a second <p>
          // inside an <li>). For <li> elements, walk up to the parent <ul>/<ol> so the
          // handle sits in the list gutter (outside the bullet marker area).
          let horizontalRef: HTMLElement = dom
          if (dom.parentElement && dom.parentElement !== editorRef.view.dom) {
            horizontalRef = dom.parentElement
          }
          if (horizontalRef.tagName === 'LI' && horizontalRef.parentElement) {
            horizontalRef = horizontalRef.parentElement
          }
          const handleNode = editorRef.state.doc.nodeAt(dragHandleNodePos)
          const syncedBlock = isNested
            ? editorRef.view.dom.closest<HTMLElement>('[data-synced-block]')
            : handleNode?.type.name === 'pageLinkBlock' && handleNode.attrs.synced
              ? dom.querySelector<HTMLElement>('[data-synced-block]')
              : null
          const {right} = horizontalRef.getBoundingClientRect()
          const handleWidth = dragHandleElement.offsetWidth
          const blockLeft = syncedBlock?.getBoundingClientRect().left
          const fitsInsideBlock =
            !!syncedBlock &&
            parseFloat(getComputedStyle(syncedBlock).paddingLeft) >=
              SYNCED_BLOCK_LINE_HANDLE_INSET * 2 + handleWidth
          const left =
            blockLeft === undefined
              ? horizontalRef.getBoundingClientRect().left
              : isNested && fitsInsideBlock
                ? blockLeft + SYNCED_BLOCK_LINE_HANDLE_INSET + handleWidth
                : blockLeft - SYNCED_BLOCK_HANDLE_OFFSET + handleWidth
          // Media blocks carry no text to anchor to. Without this the walker below finds
          // nothing and the handle never renders for an iframe embed, and anchors to the
          // title line rather than the block top for a card.
          if (handleNode?.type.name === 'embedBlock') {
            const blockRect = dom.getBoundingClientRect()
            const anchorHeight = Math.min(blockRect.height, DRAG_HANDLE_ANCHOR_HEIGHT)
            return {
              getBoundingClientRect: () => ({
                x: left,
                y: blockRect.y,
                width: right - left,
                height: anchorHeight,
                top: blockRect.top,
                right,
                bottom: blockRect.top + anchorHeight,
                left
              }),
              contextElement: horizontalRef
            }
          }
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
          if (!lineRect.height) return null
          return {
            getBoundingClientRect: () => ({
              x: left,
              y: lineRect.y,
              width: right - left,
              height: lineRect.height,
              top: lineRect.top,
              right,
              bottom: lineRect.bottom,
              left
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
                if (isInside($pos, depth, 'detailsSummary')) return 1000
                // Allow children of detailsContent (they should be independently draggable)
                return 0
              }
            },
            {
              id: 'calloutStructure',
              evaluate: ({node}) => (node.type.name === 'calloutTitle' ? 1000 : 0)
            },
            {
              // A quote is one block. Without this the target flips between a line and the
              // whole quote depending on how the pointer approaches the handle.
              id: 'quoteStructure',
              evaluate: ({$pos, depth}) => (isInside($pos, depth, 'blockquote') ? 1000 : 0)
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
