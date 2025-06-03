import AddIcon from '@mui/icons-material/Add'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {useHistory, useRouteMatch} from 'react-router'
import {Link} from 'react-router-dom'
import type {LeftNavPageLink_page$key} from '../../__generated__/LeftNavPageLink_page.graphql'
import {useDraggablePage} from '../../hooks/useDraggablePage'
import {useCreatePageMutation} from '../../mutations/useCreatePageMutation'
import {toSlug} from '../../shared/toSlug'
import {cn} from '../../ui/cn'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'
import {ExpandPageChildrenButton} from './ExpandPageChildrenButton'
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
  const depth = pageAncestors.length - 1
  const page = useFragment(
    graphql`
      fragment LeftNavPageLink_page on Page {
        id
        title
        parentPageId
        teamId
        isPrivate
        isDraggingFirstChild
        isDraggingLastChild
        sortOrder # used implicityly in store traveral by useDraggingPage
      }
    `,
    pageRef
  )
  const {title, id, parentPageId, isDraggingFirstChild, isDraggingLastChild, teamId, isPrivate} =
    page
  const pageIdNum = id.split(':')[1]
  const titleSlug = toSlug(title || '')
  const slug = titleSlug ? `${titleSlug}-${pageIdNum}` : pageIdNum
  const match = useRouteMatch(`/pages/:slug(.*)${pageIdNum}`)
  const isActive = match?.isExact ?? false
  const [showChildren, setShowChildren] = useState(false)
  const expandChildPages = () => {
    setShowChildren(!showChildren)
  }
  const history = useHistory()
  const [execute, submitting] = useCreatePageMutation()
  const {onPointerDown, ref} = useDraggablePage(
    id,
    isPrivate,
    parentPageId || null,
    teamId,
    connectionKey,
    dropIdx === 0,
    isLastChild
  )
  const addChildPage = (e: React.MouseEvent) => {
    e.preventDefault()
    if (submitting) return
    execute({
      variables: {parentPageId: id},
      onCompleted: (response) => {
        const {createPage} = response
        const {page} = createPage
        const {id} = page
        const [_, pageId] = id.split(':')
        history.push(`/pages/${pageId}`)
        setShowChildren(true)
      }
    })
  }
  const nextPageAncestors = [...pageAncestors, id]
  const isSourceDragParent = draggingPageId && nextPageAncestors.includes(draggingPageId)
  const isSelf = draggingPageId === id
  const isNextPeer = draggingPageId === nextPeerId && !showChildren
  const isTopLevelShared = connectionKey === 'User_sharedPages'
  const isPrivateToTopLevelShared = isTopLevelShared && draggingPageIsPrivate
  const canDropIn = draggingPageId && !isSourceDragParent && !isSelf && !isDraggingLastChild
  const canDropBelow =
    draggingPageId &&
    !isSourceDragParent &&
    !isSelf &&
    !isDraggingFirstChild &&
    !isNextPeer &&
    !isPrivateToTopLevelShared
  return (
    <div className='relative rounded-md' ref={ref}>
      <div
        onPointerDown={onPointerDown}
        data-highlighted={isActive ? '' : undefined}
        style={{paddingLeft: depth * 8}}
        data-drop-in={canDropIn ? id : undefined}
        className={cn(
          'peer group relative my-0.5 flex w-max min-w-full cursor-pointer items-center space-x-2 rounded-md px-1 py-1 text-sm leading-8 text-slate-700 outline-hidden data-[drop-in]:hover:bg-sky-300/70',
          // when in dragging mode, hide hover/focus/active slate background so you only see blue
          !draggingPageId &&
            'hover:bg-slate-300 focus:bg-slate-300 data-highlighted:bg-slate-300 data-highlighted:text-slate-900',
          draggingPageId && (isDraggingLastChild ? 'cursor-no-drop' : 'cursor-pointer')
        )}
      >
        <div
          className={cn(
            'absolute -bottom-0.5 left-0 z-20 hidden h-1 w-full hover:bg-sky-500/80 data-[drop-below]:flex',
            canDropBelow && 'cursor-pointer'
          )}
          data-drop-below={
            canDropBelow ? (showChildren ? id : parentPageId || teamId || '') : undefined
          }
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
          <div className='flex flex-col text-sm font-medium'>
            <span>{title || '<Untitled>'}</span>
          </div>
          <div className='flex flex-1 items-center justify-end'>
            <div className='flex size-6 items-center justify-center rounded-sm hover:bg-slate-400'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AddIcon className='hidden size-5 group-hover:block' onClick={addChildPage} />
                </TooltipTrigger>
                <TooltipContent side={'bottom'}>{'Add a page inside'}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </Link>
      </div>
      {showChildren && (
        <div className={cn('rounded-md', canDropIn && 'peer-hover:bg-sky-200/70')}>
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
