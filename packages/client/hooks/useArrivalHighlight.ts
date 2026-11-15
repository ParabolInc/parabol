import type {Editor} from '@tiptap/core'
import {useEffect} from 'react'
import {findMovedBlockPositions} from '../tiptap/blockMove/findMovedBlockPositions'
import {peekPendingArrival, takePendingArrival} from '../tiptap/blockMove/pendingArrivals'
import {clearBlockArrival, showBlockArrival} from '../tiptap/extensions/BlockArrival'

const HIGHLIGHT_MS = 1500
const GIVE_UP_MS = 10_000

export const useArrivalHighlight = (editor: Editor | null, pageId: string) => {
  useEffect(() => {
    if (!editor) return
    const moved = peekPendingArrival(pageId)
    if (!moved) return
    let highlightTimeout: number | undefined
    let giveUpTimeout: number | undefined
    const clear = () => {
      if (!editor.isDestroyed) clearBlockArrival(editor.view)
    }
    const tryApply = () => {
      const positions = findMovedBlockPositions(editor, moved)
      if (positions.length === 0) return false
      showBlockArrival(editor.view, positions)
      const first = editor.view.nodeDOM(positions[0]!)
      if (first instanceof HTMLElement) first.scrollIntoView({block: 'center'})
      highlightTimeout = window.setTimeout(() => {
        clear()
        takePendingArrival(pageId)
      }, HIGHLIGHT_MS)
      return true
    }
    const onUpdate = () => {
      if (!tryApply()) return
      editor.off('update', onUpdate)
      window.clearTimeout(giveUpTimeout)
    }
    if (!tryApply()) {
      editor.on('update', onUpdate)
      giveUpTimeout = window.setTimeout(() => {
        editor.off('update', onUpdate)
        takePendingArrival(pageId)
      }, GIVE_UP_MS)
    }
    return () => {
      editor.off('update', onUpdate)
      window.clearTimeout(highlightTimeout)
      window.clearTimeout(giveUpTimeout)
      clear()
    }
  }, [editor, pageId])
}
