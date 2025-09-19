import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {Link} from 'react-router-dom'
import type {LeftNavPageLink_page$key} from '../../__generated__/LeftNavPageLink_page.graphql'
import {useDraggablePage} from '../../hooks/useDraggablePage'
import {getPageSlug} from '../../tiptap/getPageSlug'
import {cn} from '../../ui/cn'
import {ExpandPageChildrenButton} from './ExpandPageChildrenButton'
import {LeftNavItem} from './LeftNavItem'
import {PageActions} from './PageActions'
import {SubPagesRoot} from './SubPagesRoot'

export type PageConnectionKey = 'User_privatePages' | 'User_sharedPages' | 'User_pages'
interface Props {
  pageRef: LeftNavPageLink_page$key
  pageAncestors: string[]
  draggingPageId: string | null | undefined
  draggingPageIsPrivate: boolean | null
  dropIdx: number
  isLastChild: boolean
  nextPeerId: string | null
  connectionKey: PageConnectionKey
}
export const LeftNavPageLink = (props: Props) => {
  const {
    pageRef,
    pageAncestors,
    draggingPageId,
    draggingPageIsPrivate,
    dropIdx,
    isLastChild,
    nextPeerId,
    connectionKey
  } = props
  const depth = pageAncestors.length
  const page = useFragment(
    graphql`
      fragment LeftNavPageLink_page on Page {
        ...PageActions_page
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
      }
    `,
    pageRef
  )
  const {
    title,
    id,
    parentPageId,
    isDraggingFirstChild,
    isDraggingLastChild,
    teamId,
    isPrivate,
    currentPageAncestorDepth,
    userSortOrder
  } = page
  const pageCode = id.split(':')[1]
  const slug = getPageSlug(Number(pageCode), title)

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
  const canDropIn = draggingPageId && !isSourceDragParent && !isSelf && !isDraggingLastChild
  const canDropBelow =
    draggingPageId &&
    !isSourceDragParent &&
    !isSelf &&
    !isDraggingFirstChild &&
    !isNextPeer &&
    !isPrivateToTopLevelShared
  const isActive = (currentPageAncestorDepth && !showChildren) || currentPageAncestorDepth === 0
  return (
    <div className='relative rounded-md' ref={ref}>
      <div
        onPointerDown={onPointerDown}
        data-highlighted={isActive ? '' : undefined}
        style={{paddingLeft: depth * 8}}
        data-drop-in={canDropIn ? id : undefined}
        className={cn(
          'peer group relative my-0.5 flex w-full min-w-full cursor-pointer items-center space-x-2 rounded-md py-1 pr-1 pl-1 text-slate-700 text-sm leading-8 outline-hidden data-[drop-in]:hover:bg-sky-300/70',
          // when in dragging mode, hide hover/focus/active slate background so you only see blue
          !draggingPageId &&
            'hover:bg-slate-300 focus:bg-slate-300 data-highlighted:bg-slate-300 data-highlighted:text-slate-900',
          draggingPageId && (isDraggingLastChild ? 'cursor-no-drop' : 'cursor-pointer')
        )}
      >
        <div
          className={cn(
            '-bottom-0.5 absolute left-0 z-20 hidden h-1 w-full hover:bg-sky-500/80 data-[drop-below]:flex',
            canDropBelow && 'cursor-pointer'
          )}
          data-drop-below={canDropBelow ? (showChildren ? id : parentSection) : undefined}
          data-drop-idx={showChildren ? -1 : dropIdx}
          aria-expanded={showChildren}
        ></div>
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
          <ExpandPageChildrenButton
            showChildren={showChildren}
            expandChildPages={expandChildPages}
            draggingPageId={isSelf ? null : draggingPageId}
          />
          <LeftNavItem>
            <span className='pl-1'>
              {title || '<Untitled>'} {userSortOrder}
            </span>
          </LeftNavItem>
          <PageActions expandChildren={() => setShowChildren(true)} pageRef={page} />
        </Link>
      </div>
      {showChildren && (
        <div
          className={cn('rounded-md', canDropIn && 'peer-hover:bg-sky-200/70')}
          data-pages-connection={'User_pages'}
        >
          <SubPagesRoot
            parentPageId={id}
            pageAncestors={nextPageAncestors}
            draggingPageId={draggingPageId}
            draggingPageIsPrivate={draggingPageIsPrivate}
          />
        </div>
      )}
    </div>
  )
}
