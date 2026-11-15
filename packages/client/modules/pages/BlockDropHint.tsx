import {useEffect, useState} from 'react'
import {useClientQuery} from 'react-relay'
import pageDropTargetQuery, {
  type PageDropTargetQuery
} from '../../__generated__/PageDropTargetQuery.graphql'
import {getBlockDropHintText} from '../../tiptap/blockMove/getBlockDropHintText'
import {cn} from '../../ui/cn'

interface Hint {
  x: number
  y: number
  text: string
  isRefused: boolean
}

export const BlockDropHint = () => {
  const data = useClientQuery<PageDropTargetQuery>(pageDropTargetQuery, {})
  const {draggingBlocksSourcePageId, draggingBlocksRefusal, draggingBlocksCount} = data.viewer ?? {}
  const isBlockDrag = !!draggingBlocksSourcePageId
  const [hint, setHint] = useState<Hint | null>(null)
  useEffect(() => {
    if (!isBlockDrag) {
      setHint(null)
      return
    }
    const onDragOver = (e: DragEvent) => {
      const target = e.target instanceof Element ? e.target : null
      const dropTarget = target?.closest('[data-drop-title]')
      if (!dropTarget) {
        setHint(null)
        return
      }
      const isAllowed = dropTarget.hasAttribute('data-drop-in')
      const refusal = dropTarget.getAttribute('data-drop-refused') || draggingBlocksRefusal
      if (!isAllowed && !refusal) {
        setHint(null)
        return
      }
      const next: Hint = {
        x: e.clientX,
        y: e.clientY,
        text: getBlockDropHintText({
          title: dropTarget.getAttribute('data-drop-title') ?? '',
          refusal: isAllowed ? dropTarget.getAttribute('data-drop-refused') : refusal,
          count: draggingBlocksCount
        }),
        isRefused: !isAllowed || !!dropTarget.getAttribute('data-drop-refused')
      }
      setHint((prev) =>
        prev &&
        prev.x === next.x &&
        prev.y === next.y &&
        prev.text === next.text &&
        prev.isRefused === next.isRefused
          ? prev
          : next
      )
    }
    const onDragLeave = (e: DragEvent) => {
      if (!e.relatedTarget) setHint(null)
    }
    const clear = () => setHint(null)
    document.addEventListener('dragover', onDragOver, true)
    document.addEventListener('dragleave', onDragLeave, true)
    document.addEventListener('drop', clear, true)
    document.addEventListener('dragend', clear, true)
    return () => {
      document.removeEventListener('dragover', onDragOver, true)
      document.removeEventListener('dragleave', onDragLeave, true)
      document.removeEventListener('drop', clear, true)
      document.removeEventListener('dragend', clear, true)
    }
  }, [isBlockDrag, draggingBlocksRefusal, draggingBlocksCount])
  if (!hint) return null
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none fixed z-snackbar flex select-none items-center rounded-sm p-2',
        hint.isRefused
          ? 'border border-current bg-surface-raised text-fg-error'
          : 'bg-slate-700 shadow-snackbar'
      )}
      style={{left: hint.x + 16, top: hint.y + 20}}
    >
      <div className={cn('px-2 py-1.5 text-sm leading-[normal]', !hint.isRefused && 'text-white')}>
        {hint.text}
      </div>
    </div>
  )
}
