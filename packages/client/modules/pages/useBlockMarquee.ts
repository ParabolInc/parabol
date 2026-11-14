import type {Editor} from '@tiptap/core'
import {type EditorState, Selection} from '@tiptap/pm/state'
import {type RefObject, useEffect, useState} from 'react'
import {
  createBlockSelection,
  getAnchorBlockUnit,
  getCaretAfterBlocks,
  getSelectedBlockRange,
  getTextCaretNear
} from '../../tiptap/blockSelection/blockSelectionState'
import type {BlockRange} from '../../tiptap/blockSelection/blockUnits'
import {
  getBlocksInRect,
  getRunFromBoxes,
  getUnitBoxes,
  isRunBackward,
  type UnitBox
} from '../../tiptap/blockSelection/getBlocksInRect'

export type MarqueeBox = {left: number; top: number; width: number; height: number}

const IGNORED_TARGETS =
  'a, button, input, textarea, [role=button], .drag-handle, [data-starter-actions], [data-page-header]'
const CLICK_SLOP = 4
const EDGE_ZONE = 40
const SCROLL_STEP = 12

export const isMarqueeStart = (target: Element, editorDom: Element): boolean => {
  if (target === editorDom || target.closest(IGNORED_TARGETS)) return false
  return target.contains(editorDom)
}

const getScrollParent = (element: HTMLElement): HTMLElement => {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const {overflowY} = getComputedStyle(node)
    if (/(auto|scroll|overlay)/.test(overflowY) && node.scrollHeight > node.clientHeight) {
      return node
    }
  }
  return (document.scrollingElement as HTMLElement | null) ?? document.documentElement
}

const getViewportEdges = (scroller: HTMLElement) =>
  scroller === document.scrollingElement || scroller === document.documentElement
    ? {top: 0, bottom: window.innerHeight}
    : scroller.getBoundingClientRect()

type Session = {
  pointerId: number
  startX: number
  startContentY: number
  x: number
  y: number
  isDragging: boolean
  isDirty: boolean
  anchor: {from: number; to: number} | null
  originalState: EditorState | null
  lastRange: BlockRange | null
  frameId: number
  scroller: HTMLElement
  boxes: UnitBox[]
  boxesDoc: EditorState['doc'] | null
  boxesScrollTop: number
}

export const useBlockMarquee = (
  editor: Editor,
  containerRef: RefObject<HTMLElement | null>
): MarqueeBox | null => {
  const [box, setBox] = useState<MarqueeBox | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const root = container.closest<HTMLElement>('[data-page-surface]') ?? container
    let session: Session | null = null
    let lastPointerType = 'mouse'

    const clearBlockSelection = () => {
      const {state, view} = editor
      const range = getSelectedBlockRange(state)
      if (range) view.dispatch(state.tr.setSelection(getCaretAfterBlocks(state.doc, range)))
    }

    const restoreSelection = (original: EditorState) => {
      const {state, view} = editor
      try {
        view.dispatch(
          state.tr.setSelection(Selection.fromJSON(state.doc, original.selection.toJSON()))
        )
      } catch {
        const anchorPos = Math.min(original.selection.anchor, state.doc.content.size)
        view.dispatch(state.tr.setSelection(getTextCaretNear(state.doc.resolve(anchorPos))))
      }
    }

    const update = (current: Session) => {
      const {startX, startContentY, x, y, scroller, anchor} = current
      const startY = startContentY - scroller.scrollTop
      const rect = {
        left: Math.min(startX, x),
        right: Math.max(startX, x),
        top: Math.min(startY, y),
        bottom: Math.max(startY, y)
      }
      setBox({
        left: rect.left,
        top: rect.top,
        width: rect.right - rect.left,
        height: rect.bottom - rect.top
      })
      const {state, view} = editor
      if (current.boxesDoc !== state.doc) {
        current.boxes = getUnitBoxes(view)
        current.boxesDoc = state.doc
        current.boxesScrollTop = scroller.scrollTop
      }
      const shift = scroller.scrollTop - current.boxesScrollTop
      const hit = getBlocksInRect(current.boxes, {
        ...rect,
        top: rect.top + shift,
        bottom: rect.bottom + shift
      })
      if (!hit) {
        if (current.originalState) {
          if (current.lastRange) restoreSelection(current.originalState)
        } else {
          clearBlockSelection()
        }
        current.lastRange = null
        return
      }
      const range = getRunFromBoxes(state.doc, hit.first, hit.last, anchor)
      if (!range) return
      const last = current.lastRange
      if (last && last.from === range.from && last.to === range.to && last.depth === range.depth) {
        return
      }
      current.lastRange = range
      const isBackward = anchor ? isRunBackward(range, anchor) : y < startY
      view.dispatch(state.tr.setSelection(createBlockSelection(state.doc, range, isBackward)))
    }

    const onFrame = () => {
      if (!session) return
      const {top, bottom} = getViewportEdges(session.scroller)
      const before = session.scroller.scrollTop
      if (session.y < top + EDGE_ZONE) session.scroller.scrollTop -= SCROLL_STEP
      else if (session.y > bottom - EDGE_ZONE) session.scroller.scrollTop += SCROLL_STEP
      if (session.scroller.scrollTop !== before) session.isDirty = true
      if (session.isDirty) {
        session.isDirty = false
        update(session)
      }
      session.frameId = requestAnimationFrame(onFrame)
    }

    const endSession = (pointerId: number) => {
      if (!session) return
      cancelAnimationFrame(session.frameId)
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerup', onPointerEnd)
      document.removeEventListener('pointercancel', onPointerEnd)
      document.removeEventListener('lostpointercapture', onPointerEnd)
      if (root.hasPointerCapture(pointerId)) root.releasePointerCapture(pointerId)
      session = null
      setBox(null)
    }

    const placeCaret = (clientX: number, clientY: number) => {
      const {view} = editor
      const rect = view.dom.getBoundingClientRect()
      const left = Math.min(Math.max(clientX, rect.left + 1), rect.right - 1)
      const top = Math.min(Math.max(clientY, rect.top), rect.bottom)
      const pos = view.posAtCoords({left, top})?.pos ?? view.state.doc.content.size
      view.dispatch(view.state.tr.setSelection(getTextCaretNear(view.state.doc.resolve(pos))))
      view.focus()
    }

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0 || lastPointerType === 'touch') return
      if (!(e.target instanceof Element) || !isMarqueeStart(e.target, editor.view.dom)) return
      e.preventDefault()
    }

    const onPointerDown = (e: PointerEvent) => {
      lastPointerType = e.pointerType
      if (e.button !== 0 || !e.isPrimary || e.pointerType === 'touch' || session) return
      if (!(e.target instanceof Element) || !isMarqueeStart(e.target, editor.view.dom)) return
      const scroller = getScrollParent(root)
      const {state} = editor
      session = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startContentY: e.clientY + scroller.scrollTop,
        x: e.clientX,
        y: e.clientY,
        isDragging: false,
        isDirty: false,
        anchor: e.shiftKey ? getAnchorBlockUnit(state) : null,
        originalState: e.shiftKey ? state : null,
        lastRange: null,
        frameId: 0,
        scroller,
        boxes: [],
        boxesDoc: null,
        boxesScrollTop: scroller.scrollTop
      }
      document.addEventListener('pointermove', onPointerMove)
      document.addEventListener('pointerup', onPointerEnd)
      document.addEventListener('pointercancel', onPointerEnd)
      document.addEventListener('lostpointercapture', onPointerEnd)
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!session || e.pointerId !== session.pointerId) return
      if (e.buttons === 0) {
        endSession(e.pointerId)
        return
      }
      session.x = e.clientX
      session.y = e.clientY
      if (!session.isDragging) {
        const startY = session.startContentY - session.scroller.scrollTop
        if (Math.hypot(e.clientX - session.startX, e.clientY - startY) < CLICK_SLOP) return
        session.isDragging = true
        root.setPointerCapture(e.pointerId)
        window.getSelection()?.removeAllRanges()
        if (!session.originalState) clearBlockSelection()
        session.frameId = requestAnimationFrame(onFrame)
      }
      session.isDirty = true
    }

    const onPointerEnd = (e: PointerEvent) => {
      if (!session || e.pointerId !== session.pointerId) return
      const {isDragging, lastRange, anchor} = session
      endSession(e.pointerId)
      if (isDragging) {
        if (lastRange) editor.view.dom.focus({preventScroll: true})
      } else if (e.type === 'pointerup' && !anchor) {
        placeCaret(e.clientX, e.clientY)
      }
    }

    root.addEventListener('mousedown', onMouseDown)
    root.addEventListener('pointerdown', onPointerDown)
    return () => {
      root.removeEventListener('mousedown', onMouseDown)
      root.removeEventListener('pointerdown', onPointerDown)
      if (session) endSession(session.pointerId)
    }
  }, [editor, containerRef])

  return box
}
