import type {Editor} from '@tiptap/core'
import {useEffect} from 'react'
import {useLocation} from 'react-router'
import {findMovedBlockPositions} from '../tiptap/blockMove/findMovedBlockPositions'
import {peekPendingArrival, takePendingArrival} from '../tiptap/blockMove/pendingArrivals'
import {clearBlockArrival, showBlockArrival} from '../tiptap/extensions/BlockArrival'
import {findSyncedBlockPositions} from '../tiptap/extensions/pageLinkBlock/findSyncedBlockPositions'
import {keepArrivalInView} from '../tiptap/keepArrivalInView'
import {parseSyncedBlockHash} from '../tiptap/syncedBlockHash'

const HIGHLIGHT_MS = 1500
const GIVE_UP_MS = 10_000

export const isArrivalPending = (pageId: string, hash: string) =>
  !!peekPendingArrival(pageId) || parseSyncedBlockHash(hash) !== null

const getArrivalTarget = (
  editor: Editor,
  moved: ReturnType<typeof peekPendingArrival>,
  hash: string
) => {
  if (moved) return () => findMovedBlockPositions(editor, moved)
  const syncedBlockCode = parseSyncedBlockHash(hash)
  if (syncedBlockCode === null) return null
  return () => findSyncedBlockPositions(editor.state.doc, syncedBlockCode).slice(0, 1)
}

export const useArrivalHighlight = (editor: Editor | null, pageId: string) => {
  const {hash} = useLocation()
  useEffect(() => {
    if (!editor) return
    const moved = peekPendingArrival(pageId)
    const findPositions = getArrivalTarget(editor, moved, hash)
    if (!findPositions) return
    const settle = () => {
      if (moved) takePendingArrival(pageId)
    }
    let highlightTimeout: number | undefined
    let giveUpTimeout: number | undefined
    let stopKeepingInView: (() => void) | undefined
    const clear = () => {
      if (!editor.isDestroyed) clearBlockArrival(editor.view)
    }
    const getArrivedBlock = () => {
      if (editor.isDestroyed) return null
      const [first] = findPositions()
      const dom = first === undefined ? null : editor.view.nodeDOM(first)
      return dom instanceof HTMLElement ? dom : null
    }
    const tryApply = () => {
      const positions = findPositions()
      if (positions.length === 0) return false
      showBlockArrival(editor.view, positions)
      stopKeepingInView = keepArrivalInView(getArrivedBlock, editor.view.dom, GIVE_UP_MS)
      highlightTimeout = window.setTimeout(() => {
        clear()
        settle()
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
        settle()
      }, GIVE_UP_MS)
    }
    return () => {
      editor.off('update', onUpdate)
      stopKeepingInView?.()
      window.clearTimeout(highlightTimeout)
      window.clearTimeout(giveUpTimeout)
      clear()
    }
  }, [editor, pageId, hash])
}
