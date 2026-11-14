import graphql from 'babel-plugin-relay/macro'
import {useRef} from 'react'
import {useClientQuery} from 'react-relay'
import {useNavigate} from 'react-router'
import pageDropTargetQuery, {
  type PageDropTargetQuery
} from '../../__generated__/PageDropTargetQuery.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import {rawOnPointerUp} from '../../hooks/useDraggablePage'
import {useUpdatePageMutation} from '../../mutations/useUpdatePageMutation'
import {hasMinPageRole} from '../../shared/hasMinPageRole'
import {takeBlockDrag} from '../../tiptap/blockMove/blockDragSession'
import {moveBlocksToPage} from '../../tiptap/blockMove/moveBlocksToPage'
import {showBlockMoveSnack} from '../../tiptap/blockMove/showBlockMoveSnack'
import {cn} from '../../ui/cn'

interface Props
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

graphql`
  query PageDropTargetQuery {
    viewer {
      draggingPageId
      draggingPageParentSection
      draggingPageViewerAccess
      draggingBlocksSourcePageId
      draggingBlocksChildPageIds
      draggingBlocksRefusal
    }
  }
`

export const PageDropTarget = (props: Props) => {
  const {children, className, ...rest} = props
  const data = useClientQuery<PageDropTargetQuery>(pageDropTargetQuery, {})
  const {viewer} = data
  const {
    draggingPageId,
    draggingPageParentSection,
    draggingPageViewerAccess,
    draggingBlocksSourcePageId
  } = viewer ?? {}
  const isBlockDrag = !!draggingBlocksSourcePageId
  const navigate = useNavigate()
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
  const hasDropIn = (e: React.DragEvent) => e.currentTarget.hasAttribute('data-drop-in')
  const dropBlocks = async (e: React.DragEvent) => {
    const targetPageId = e.currentTarget.getAttribute('data-drop-in')
    const targetTitle = e.currentTarget.getAttribute('data-drop-title') ?? ''
    const session = takeBlockDrag()
    if (!targetPageId || !session) return
    const outcome = await moveBlocksToPage({session, targetPageId, targetTitle})
    showBlockMoveSnack({
      atmosphere,
      editor: session.editor,
      navigate,
      outcome,
      count: 1,
      targetPageId,
      targetTitle
    })
  }
  const completeDragAttempt = (e: React.DragEvent) => {
    e.preventDefault()
    // safari sets e.relatedTarget = null, so we use a counter as a workaround
    if (--dragCounterRef.current > 0) return
    e.currentTarget.removeAttribute('data-hover')
    const hidesDropCursor = (draggingPageId && canEdit) || (isBlockDrag && hasDropIn(e))
    if (!hidesDropCursor) return
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
        if (!((draggingPageId && canEdit) || (isBlockDrag && hasDropIn(e)))) return
        const dropCursor = document.getElementsByClassName('prosemirror-dropcursor-block')[0]
        // Never display a dropCursor at the same time as the hover state, they can only drop in, not below
        dropCursor?.classList.add('hidden')
      }}
      onDragOver={(e) => {
        // This is required for onDrop to fire
        e.preventDefault()
        if (!isBlockDrag) return
        const el = e.currentTarget
        const isRefused = el.hasAttribute('data-drop-refused')
        const isInertOutsideEditor =
          !hasDropIn(e) &&
          !el.closest('.ProseMirror') &&
          !el.parentElement?.closest('[data-drop-in]')
        if (isRefused || isInertOutsideEditor) e.dataTransfer.dropEffect = 'none'
      }}
      onDragLeave={completeDragAttempt}
      onDrop={(e) => {
        if (isBlockDrag && !hasDropIn(e)) {
          completeDragAttempt(e)
          return
        }
        // since drop-below PageDropTargets are nested inside drop-in targets, we want to stop event propagation
        e.stopPropagation()
        if (isBlockDrag && hasDropIn(e)) {
          dropBlocks(e).catch((error) => {
            console.error(error)
          })
        } else {
          onDrop?.(e)
        }
        completeDragAttempt(e)
      }}
      className={cn(
        'rounded-sm data-drop-below:data-hover:bg-sky-500/80 data-drop-in:data-hover:bg-sky-300/70 data-drop-below:hover:bg-sky-500/80 data-drop-in:hover:bg-sky-300/70 dark:data-drop-in:data-hover:bg-sky-500/30 dark:data-drop-in:data-hover:ring-2 dark:data-drop-in:data-hover:ring-sky-300 dark:data-drop-in:data-hover:ring-inset dark:data-drop-in:hover:bg-sky-500/30 dark:data-drop-in:hover:ring-2 dark:data-drop-in:hover:ring-sky-300 dark:data-drop-in:hover:ring-inset',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
