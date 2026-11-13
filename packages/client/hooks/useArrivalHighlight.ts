import type {Editor} from '@tiptap/core'
import {useEffect} from 'react'
import {findMovedBlockPositions} from '../tiptap/blockMove/findMovedBlockPositions'
import {peekPendingArrival, takePendingArrival} from '../tiptap/blockMove/pendingArrivals'

const HIGHLIGHT_MS = 1500
const GIVE_UP_MS = 10_000

export const useArrivalHighlight = (editor: Editor | null, pageId: string) => {
  useEffect(() => {
    if (!editor) return
    const moved = peekPendingArrival(pageId)
    if (!moved) return
    let elements: HTMLElement[] = []
    let highlightTimeout: number | undefined
    let giveUpTimeout: number | undefined
    const tryApply = () => {
      elements = findMovedBlockPositions(editor, moved).flatMap((pos) => {
        const dom = editor.view.nodeDOM(pos)
        return dom instanceof HTMLElement ? [dom] : []
      })
      if (elements.length === 0) return false
      elements.forEach((el) => {
        el.classList.add('block-arrived')
      })
      elements[0]?.scrollIntoView({block: 'center'})
      highlightTimeout = window.setTimeout(() => {
        elements.forEach((el) => {
          el.classList.remove('block-arrived')
        })
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
      elements.forEach((el) => {
        el.classList.remove('block-arrived')
      })
    }
  }, [editor, pageId])
}
