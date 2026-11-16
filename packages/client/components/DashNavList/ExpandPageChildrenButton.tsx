import {memo, useRef} from 'react'
import {ChevronRight as ChevronRightIcon, Description as DescriptionIcon} from '~/ui/icons'
import useEventCallback from '../../hooks/useEventCallback'
import {cn} from '../../ui/cn'

interface Props {
  expandChildPages: () => void
  showChildren: boolean
  isDragging: boolean
  icon?: typeof DescriptionIcon
  emoji?: string | null
}
export const ExpandPageChildrenButton = memo((props: Props) => {
  const {isDragging, showChildren, expandChildPages, icon, emoji} = props
  const timeoutRef = useRef<number | null>(null)
  const isDraggingOverExpandButton = useRef(false)
  const DefaultIcon = icon ?? DescriptionIcon
  const handleDragExpandEnter = useEventCallback(() => {
    if (!isDragging || isDraggingOverExpandButton.current || showChildren) return
    isDraggingOverExpandButton.current = true

    timeoutRef.current = window.setTimeout(() => {
      expandChildPages()
    }, 1000)
  })

  const dragCounterRef = useRef(0)
  const handleDragExpandLeave = useEventCallback(() => {
    isDraggingOverExpandButton.current = false
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  })
  return (
    <div
      onPointerEnter={handleDragExpandEnter}
      onPointerLeave={handleDragExpandLeave}
      onDragEnter={() => {
        dragCounterRef.current++
        handleDragExpandEnter()
      }}
      onDragLeave={() => {
        if (--dragCounterRef.current > 0) return
        dragCounterRef.current = 0
        handleDragExpandLeave()
      }}
      onDrop={() => {
        dragCounterRef.current = 0
        handleDragExpandLeave()
      }}
      className={cn(
        'flex size-6 shrink-0 items-center justify-center rounded-sm bg-surface-app text-fg-nav-muted hover:bg-surface-nav-button-hover group-hover:bg-surface-nav-hover group-data-highlighted:bg-surface-nav-active',
        isDragging && 'bg-inherit hover:bg-sky-300 group-hover:bg-sky-300'
      )}
    >
      {emoji ? (
        <span className='no-hover:hidden text-base leading-none group-hover:hidden'>{emoji}</span>
      ) : (
        <DefaultIcon className='no-hover:hidden size-5 group-hover:hidden' />
      )}
      <ChevronRightIcon
        className={cn(
          'sm no-hover:block hidden size-5 transition-transform group-hover:block',
          showChildren && 'rotate-90'
        )}
        onClick={(e: React.MouseEvent) => {
          e.preventDefault()
          expandChildPages()
        }}
      />
    </div>
  )
})
