import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DescriptionIcon from '@mui/icons-material/Description'
import {memo, useRef} from 'react'
import useEventCallback from '../../hooks/useEventCallback'
import {cn} from '../../ui/cn'

interface Props {
  expandChildPages: () => void
  showChildren: boolean
  draggingPageId: string | null | undefined
  icon?: typeof DescriptionIcon
  emoji?: string | null
}
export const ExpandPageChildrenButton = memo((props: Props) => {
  const {draggingPageId, showChildren, expandChildPages, icon, emoji} = props
  const timeoutRef = useRef<number | null>(null)
  const isDraggingOverExpandButton = useRef(false)
  const DefaultIcon = icon ?? DescriptionIcon
  const handleDragExpandEnter = useEventCallback(() => {
    if (!draggingPageId || isDraggingOverExpandButton.current || showChildren) return
    isDraggingOverExpandButton.current = true

    timeoutRef.current = window.setTimeout(() => {
      expandChildPages()
    }, 1000)
  })

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
      className={cn(
        'flex size-6 shrink-0 items-center justify-center rounded-sm bg-surface-app text-fg-nav-muted hover:bg-surface-nav-button-hover group-hover:bg-surface-nav-hover group-data-highlighted:bg-surface-nav-active',
        draggingPageId && 'bg-inherit hover:bg-sky-300 group-hover:bg-sky-300'
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
