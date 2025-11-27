import StorageIcon from '@mui/icons-material/Storage'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {Link} from 'react-router-dom'
import type {LeftNavPageLink_page$key} from '../../__generated__/LeftNavPageLink_page.graphql'
import type {PageRoleEnum} from '../../__generated__/NotificationSubscription.graphql'
import {useDraggablePage} from '../../hooks/useDraggablePage'
import {PageDropTarget} from '../../modules/pages/PageDropTarget'
import {getPageSlug} from '../../tiptap/getPageSlug'
import {cn} from '../../ui/cn'
import {ExpandPageChildrenButton} from './ExpandPageChildrenButton'
import {LeftNavItem} from './LeftNavItem'
import {PageActions} from './PageActions'
import {SubPagesRoot} from './SubPagesRoot'

export type PageConnectionKey = 'User_privatePages' | 'User_sharedPages' | 'User_pages'
export type PageParentSection = 'User_privatePages' | 'User_sharedPages' | `User_pages:${string}`

interface Props {
  pageRef: LeftNavPageLink_page$key
  pageAncestors: string[]
  draggingPageId: string | null | undefined
  draggingPageIsPrivate: boolean | null
  draggingPageParentSection: PageParentSection | null
  draggingPageViewerAccess: PageRoleEnum | null
  dropIdx: number
  isLastChild: boolean
  nextPeerId: string | null
  connectionKey: PageConnectionKey
  // pass this down from the parent to reduce query complexity, since it's only needed in dragging edge cases
  parentPageViewerAccess?: PageRoleEnum
}
export const LeftNavPageLink = (props: Props) => {
  const {
    pageRef,
    pageAncestors,
    draggingPageId,
    draggingPageIsPrivate,
    draggingPageParentSection,
    draggingPageViewerAccess,
    dropIdx,
    isLastChild,
    nextPeerId,
    connectionKey,
    parentPageViewerAccess
  } = props
  const depth = pageAncestors.length
  const page = useFragment(
    graphql`
      fragment LeftNavPageLink_page on Page {
        ...PageActions_page
        access {
          viewer
        }
        id
        title
        parentPageId
        teamId
        isPrivate
        isDraggingFirstChild
        isDraggingLastChild
        currentPageAncestorDepth
        userSortOrder
        sortOrder # used implicityly in store traversal by useDraggingPage
        isDatabase
      }
    `,
    pageRef
  )
  const {
    access,
    title,
    id,
    parentPageId,
    isDraggingFirstChild,
    isDraggingLastChild,
    teamId,
    isPrivate,
    currentPageAncestorDepth,
    isDatabase
  } = page
  const {viewer: viewerAccess} = access

  const pageCode = id.split(':')[1]
  const slug = getPageSlug(Number(pageCode), title)
  const isViewerPageEditor = ['owner', 'editor'].includes(viewerAccess!)
  const isViewerParentPageEditor = ['owner', 'editor'].includes(parentPageViewerAccess!)

  const [showChildren, setShowChildren] = useState(false)
  const expandChildPages = () => {
    setShowChildren(!showChildren)
  }
  const isTopLevelShared = connectionKey === 'User_sharedPages'
  const parentSection = isTopLevelShared ? '' : parentPageId || teamId || ''
  const {onPointerDown, ref} = useDraggablePage(
    id,
    isPrivate,
    parentPageId || null,
    teamId,
    connectionKey,
    dropIdx === 0,
    isLastChild
  )
  const nextPageAncestors = [...pageAncestors, id]
  const isSourceDragParent = draggingPageId && nextPageAncestors.includes(draggingPageId)
  const isSelf = draggingPageId === id
  const isNextPeer = draggingPageId === nextPeerId && !showChildren
  const isPrivateToTopLevelShared = isTopLevelShared && draggingPageIsPrivate
  const isViewerOwnerOfDraggingPage = draggingPageViewerAccess === 'owner'
  const dropInSection = `User_pages:${id}`
  const dropBelowSection =
    connectionKey === 'User_pages' ? `${connectionKey}:${parentPageId || teamId}` : connectionKey

  const isDropInReorder = draggingPageParentSection === dropInSection
  const isDropBelowReorder = draggingPageParentSection === dropBelowSection
  const hasDragAccess = isViewerOwnerOfDraggingPage || isDropInReorder
  const hasDragDropInAccess = hasDragAccess && isViewerPageEditor
  const isEditorOfDroppingSection =
    connectionKey !== 'User_pages' ? true : teamId ? true : isViewerParentPageEditor
  const hasDragDropBelowAccess =
    isDropBelowReorder || (isViewerOwnerOfDraggingPage && isEditorOfDroppingSection)

  const canDropIn =
    draggingPageId && !isSourceDragParent && !isSelf && !isDraggingLastChild && hasDragDropInAccess
  const hasDragDropInOrBelow = showChildren ? hasDragDropInAccess : hasDragDropBelowAccess

  const canDropBelow =
    draggingPageId &&
    !isSourceDragParent &&
    !isSelf &&
    !isDraggingFirstChild &&
    !isNextPeer &&
    !isPrivateToTopLevelShared &&
    hasDragDropInOrBelow
  const isActive = (currentPageAncestorDepth && !showChildren) || currentPageAncestorDepth === 0
  return (
    <div className='relative rounded-md' ref={ref}>
      <PageDropTarget
        draggingPageId={draggingPageId}
        draggingPageParentSection={draggingPageParentSection}
        onPointerDown={onPointerDown}
        data-highlighted={isActive ? '' : undefined}
        style={{paddingLeft: depth * 8}}
        data-drop-in={canDropIn ? id : undefined}
        className={cn(
          'peer group relative my-0.5 flex w-full min-w-full cursor-pointer items-center space-x-2 rounded-md py-1 pr-1 pl-1 text-slate-700 text-sm leading-8 outline-hidden',
          // when in dragging mode, hide hover/focus/active slate background so you only see blue
          !draggingPageId &&
            'hover:bg-slate-300 focus:bg-slate-300 data-highlighted:bg-slate-300 data-highlighted:text-slate-900',
          draggingPageId && (isDraggingLastChild ? 'cursor-no-drop' : 'cursor-pointer')
        )}
      >
        <PageDropTarget
          draggingPageId={draggingPageId}
          draggingPageParentSection={draggingPageParentSection}
          className={cn(
            '-bottom-0.5 absolute left-0 z-20 hidden h-1 w-full data-drop-below:flex',
            canDropBelow && 'cursor-pointer'
          )}
          data-drop-below={canDropBelow ? (showChildren ? id : parentSection) : undefined}
          data-drop-idx={showChildren ? -1 : dropIdx}
          aria-expanded={showChildren}
        ></PageDropTarget>
        <Link
          draggable={false}
          to={`/pages/${slug}`}
          key={slug}
          className={'ml-1 flex w-full items-center'}
          onClick={(e) => {
            if (draggingPageId) {
              e.preventDefault()
            }
          }}
        >
          {isDatabase ? (
            <div className='flex size-6 shrink-0 items-center justify-center rounded-sm bg-slate-200 text-slate-600 group-data-highlighted:bg-slate-300'>
              <StorageIcon className='size-5' />
            </div>
          ) : (
            <ExpandPageChildrenButton
              showChildren={showChildren}
              expandChildPages={expandChildPages}
              draggingPageId={isSelf ? null : draggingPageId}
            />
          )}
          <LeftNavItem>
            <span className='pl-1'>{title || '<Untitled>'}</span>
          </LeftNavItem>
          <PageActions expandChildren={() => setShowChildren(true)} pageRef={page} />
        </Link>
      </PageDropTarget>
      {showChildren && (
        <div
          className={cn('rounded-md', canDropIn && 'peer-hover:bg-sky-200/70')}
          data-pages-connection={'User_pages'}
        >
          <SubPagesRoot
            parentPageId={id}
            pageAncestors={nextPageAncestors}
            parentPageViewerAccess={viewerAccess ?? undefined}
          />
        </div>
      )}
    </div>
  )
}
