import type {Editor} from '@tiptap/core'
import {type RefObject, useEffect, useState} from 'react'
import {getSelectedBlockRange} from '../../tiptap/blockSelection/blockSelectionState'
import {countBlocks} from '../../tiptap/blockSelection/blockUnits'

export type BlockSelectionBox = {
  top: number
  left: number
  width: number
  height: number
  count: number
}

const isSameBox = (a: BlockSelectionBox | null, b: BlockSelectionBox | null) =>
  a === b ||
  (!!a &&
    !!b &&
    a.top === b.top &&
    a.left === b.left &&
    a.width === b.width &&
    a.height === b.height &&
    a.count === b.count)

const measureBlockSelection = (editor: Editor, container: HTMLElement) => {
  if (editor.isDestroyed) return null
  const {state, view} = editor
  const range = getSelectedBlockRange(state)
  if (!range) return null
  const lastNode = state.doc.resolve(range.to).nodeBefore
  const first = view.nodeDOM(range.from)
  const last = lastNode ? view.nodeDOM(range.to - lastNode.nodeSize) : null
  if (!(first instanceof HTMLElement) || !(last instanceof HTMLElement)) return null
  const origin = container.getBoundingClientRect()
  const top = first.getBoundingClientRect()
  const bottom = last.getBoundingClientRect()
  const left = Math.min(top.left, bottom.left)
  const right = Math.max(top.right, bottom.right)
  return {
    top: top.top - origin.top,
    left: left - origin.left,
    width: right - left,
    height: bottom.bottom - top.top,
    count: countBlocks(state.doc, range)
  }
}

export const useBlockSelectionBox = (
  editor: Editor,
  containerRef: RefObject<HTMLElement | null>
) => {
  const [box, setBox] = useState<BlockSelectionBox | null>(null)
  useEffect(() => {
    const measure = () => {
      const container = containerRef.current
      const next = container ? measureBlockSelection(editor, container) : null
      setBox((prev) => (isSameBox(prev, next) ? prev : next))
    }
    measure()
    editor.on('transaction', measure)
    const observer = new ResizeObserver(measure)
    observer.observe(editor.view.dom)
    window.addEventListener('resize', measure)
    return () => {
      editor.off('transaction', measure)
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [editor, containerRef])
  return box
}
