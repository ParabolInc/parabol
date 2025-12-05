import {useRef} from 'react'
import useAtmosphere from '../../hooks/useAtmosphere'
import {rawOnPointerUp} from '../../hooks/useDraggablePage'
import {useUpdatePageMutation} from '../../mutations/useUpdatePageMutation'
import {cn} from '../../ui/cn'

interface Props
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  draggingPageId: string | null | undefined
  draggingPageParentSection: string | null | undefined
}
export const PageDropTarget = (props: Props) => {
  const {children, className, draggingPageId, draggingPageParentSection, ...rest} = props
  const atmosphere = useAtmosphere()
  const [executeUpdatePage] = useUpdatePageMutation()
  const onDrop =
    draggingPageId && draggingPageParentSection
      ? rawOnPointerUp({
          atmosphere,
          executeUpdatePage,
          pageId: draggingPageId,
          sourceConnectionKey: 'User_pages',
          sourceParentPageId: draggingPageParentSection.slice('User_pages'.length + 1) ?? null
        })
      : undefined
  const dragCounterRef = useRef(0)

  return (
    <div
      onDragEnter={(e) => {
        // Since we must support the browser native Drag API, we can't use the pseudo :hover since that won't fire while dragging
        e.preventDefault()
        e.currentTarget.setAttribute('data-hover', '')
        const [dropCursor] = document.getElementsByClassName('prosemirror-dropcursor-block')
        // Never display a dropCursor at the same time as the hover state, they can only drop in, not below
        dropCursor?.classList.add('hidden')
        dragCounterRef.current++
      }}
      onDragOver={(e) => {
        // This is required for onDrop to fire
        e.preventDefault()
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        // safari sets e.relatedTarget = null, so we use a counter as a workaround
        if (--dragCounterRef.current === 0) {
          e.currentTarget.removeAttribute('data-hover')
          const [dropCursor] = document.getElementsByClassName('prosemirror-dropcursor-block')
          dropCursor?.classList.remove('hidden')
        }
      }}
      onDrop={(e) => {
        e.preventDefault()
        // since drop-below PageDropTargets are nested inside drop-in targets, we want to stop event propagation
        e.stopPropagation()
        onDrop?.(e)
        if (--dragCounterRef.current === 0) {
          e.currentTarget.removeAttribute('data-hover')
          const [dropCursor] = document.getElementsByClassName('prosemirror-dropcursor-block')
          dropCursor?.classList.remove('hidden')
        }
      }}
      className={cn(
        'rounded-sm data-drop-below:data-hover:bg-sky-500/80 data-drop-in:data-hover:bg-sky-300/70 data-drop-below:hover:bg-sky-500/80 data-drop-in:hover:bg-sky-300/70',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
