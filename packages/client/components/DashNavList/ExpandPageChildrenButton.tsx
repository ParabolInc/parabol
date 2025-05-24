import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DescriptionIcon from '@mui/icons-material/Description'
import {memo, useRef} from 'react'
import useEventCallback from '../../hooks/useEventCallback'
import {cn} from '../../ui/cn'
interface Props {
  expandChildPages: () => void
  showChildren: boolean
  draggingPageId: string | null | undefined
}
export const ExpandPageChildrenButton = memo((props: Props) => {
  const {draggingPageId, showChildren, expandChildPages} = props
  const timeoutRef = useRef<number | null>(null)
  const isDraggingOverExpandButton = useRef(false)

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
        'flex size-6 items-center justify-center rounded-sm bg-slate-200 group-hover:bg-slate-300 group-data-highlighted:bg-slate-300 hover:bg-slate-400',
        draggingPageId && 'bg-inherit group-hover:bg-sky-300 hover:bg-sky-300'
      )}
    >
      <DescriptionIcon className='size-5 group-hover:hidden no-hover:hidden' />
      <ChevronRightIcon
        className={cn(
          'sm hidden size-5 transition-transform group-hover:block no-hover:block',
          showChildren && 'rotate-90'
        )}
        onClick={expandChildPages}
      />
    </div>
  )
})
