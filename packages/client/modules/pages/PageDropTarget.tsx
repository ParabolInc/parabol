import graphql from 'babel-plugin-relay/macro'
import {useRef} from 'react'
import {useClientQuery} from 'react-relay'
import pageDropTargetQuery, {
  type PageDropTargetQuery
} from '../../__generated__/PageDropTargetQuery.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import {rawOnPointerUp} from '../../hooks/useDraggablePage'
import {useUpdatePageMutation} from '../../mutations/useUpdatePageMutation'
import {hasMinPageRole} from '../../shared/hasMinPageRole'
import {cn} from '../../ui/cn'

interface Props
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

graphql`
  query PageDropTargetQuery {
    viewer {
      draggingPageId
      draggingPageParentSection
      draggingPageViewerAccess
    }
  }
`

export const PageDropTarget = (props: Props) => {
  const {children, className, ...rest} = props
  const data = useClientQuery<PageDropTargetQuery>(pageDropTargetQuery, {})
  const {viewer} = data
  const {draggingPageId, draggingPageParentSection, draggingPageViewerAccess} = viewer ?? {}
  const canEdit = hasMinPageRole('editor', draggingPageViewerAccess)
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
  const completeDragAttempt = (e: React.DragEvent) => {
    e.preventDefault()
    // safari sets e.relatedTarget = null, so we use a counter as a workaround
    if (--dragCounterRef.current > 0) return
    e.currentTarget.removeAttribute('data-hover')
    if (!draggingPageId || !canEdit) return
    const dropCursor = document.getElementsByClassName('prosemirror-dropcursor-block')[0]
    dropCursor?.classList.remove('hidden')
  }
  return (
    <div
      onDragEnter={(e) => {
        // Since we must support the browser native Drag API, we can't use the pseudo :hover since that won't fire while dragging
        e.preventDefault()
        dragCounterRef.current++
        e.currentTarget.setAttribute('data-hover', '')
        if (!draggingPageId || !canEdit) return
        const dropCursor = document.getElementsByClassName('prosemirror-dropcursor-block')[0]
        // Never display a dropCursor at the same time as the hover state, they can only drop in, not below
        dropCursor?.classList.add('hidden')
      }}
      onDragOver={(e) => {
        // This is required for onDrop to fire
        e.preventDefault()
      }}
      onDragLeave={completeDragAttempt}
      onDrop={(e) => {
        // since drop-below PageDropTargets are nested inside drop-in targets, we want to stop event propagation
        e.stopPropagation()
        onDrop?.(e)
        completeDragAttempt(e)
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
