import AddIcon from '@mui/icons-material/Add'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DescriptionIcon from '@mui/icons-material/Description'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {ConnectionHandler, useFragment} from 'react-relay'
import {useHistory, useRouteMatch} from 'react-router'
import {Link} from 'react-router-dom'
import type {LeftNavPageLink_page$key} from '../../__generated__/LeftNavPageLink_page.graphql'
import {useDraggablePage} from '../../hooks/useDraggablePage'
import safePutNodeInConn from '../../mutations/handlers/safePutNodeInConn'
import {useCreatePageMutation} from '../../mutations/useCreatePageMutation'
import {toSlug} from '../../shared/toSlug'
import {cn} from '../../ui/cn'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'
import {SubPagesRoot} from './SubPagesRoot'
interface Props {
  pageRef: LeftNavPageLink_page$key
  pageAncestors: string[]
  draggingPageId: string | null | undefined
  isFirstChild: boolean
}
export const LeftNavPageLink = (props: Props) => {
  const {pageRef, pageAncestors, draggingPageId, isFirstChild} = props
  const depth = pageAncestors.length - 1
  const page = useFragment(
    graphql`
      fragment LeftNavPageLink_page on Page {
        id
        title
        parentPageId
        isDraggingFirstChild
      }
    `,
    pageRef
  )
  const {title, id, parentPageId, isDraggingFirstChild} = page
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
  const {onPointerDown, ref} = useDraggablePage(id, parentPageId, isFirstChild)
  const addChildPage = () => {
    if (submitting) return
    execute({
      variables: {parentPageId: id},
      updater: (store) => {
        const viewer = store.getRoot().getLinkedRecord('viewer')
        if (!viewer) return
        const conn = ConnectionHandler.getConnection(viewer, 'SubPages_pages', {
          parentPageId: id
        })
        if (!conn) return
        const node = store.getRootField('createPage')?.getLinkedRecord('page')
        safePutNodeInConn(conn, node, store, 'sortOrder', false)
      },
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
  const isSourceDragParent = draggingPageId ? nextPageAncestors.includes(draggingPageId) : false
  const canDropIn =
    draggingPageId && !isSourceDragParent && draggingPageId !== id && !isDraggingFirstChild
  const canDropBelow =
    draggingPageId && !nextPageAncestors.includes(draggingPageId) && !isDraggingFirstChild
  return (
    <div className='relative rounded-md' ref={ref}>
      <div
        onPointerDown={onPointerDown}
        data-highlighted={isActive ? '' : undefined}
        style={{paddingLeft: depth * 8}}
        data-drop-in={canDropIn ? '' : undefined}
        className={
          'peer group relative my-0.5 flex w-full cursor-pointer items-center space-x-2 rounded-md px-1 py-1 text-sm leading-8 text-slate-700 outline-hidden hover:bg-slate-300 focus:bg-slate-300 data-highlighted:bg-slate-300 data-highlighted:text-slate-900 data-[drop-in]:hover:bg-sky-300/70'
        }
      >
        <div
          className='absolute -bottom-0.5 left-0 z-20 hidden h-1 w-full hover:bg-sky-500/80 data-[drop-below]:flex'
          data-drop-below={canDropBelow ? '' : undefined}
        ></div>
        <Link
          draggable={false}
          to={`/pages/${slug}`}
          key={slug}
          className={cn(
            'flex w-full cursor-pointer items-center',
            // this is so a drop on itself does not result in a click. draggingPageId in an onClick will be null before
            // we can call preventDefault
            draggingPageId && 'pointer-events-none'
          )}
        >
          <div className='flex size-6 items-center justify-center rounded-sm bg-slate-200 group-hover:bg-slate-300 group-data-highlighted:bg-slate-300 hover:bg-slate-400'>
            <DescriptionIcon className='size-5 group-hover:hidden no-hover:hidden' />
            <ChevronRightIcon
              className={cn(
                'sm hidden size-5 transition-transform group-hover:block no-hover:block',
                showChildren && 'rotate-90'
              )}
              onClick={expandChildPages}
            />
          </div>
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
        <div className={cn(canDropIn && 'peer-hover:bg-sky-200/70')}>
          <SubPagesRoot
            parentPageId={id}
            pageAncestors={nextPageAncestors}
            draggingPageId={draggingPageId}
          />
        </div>
      )}
    </div>
  )
}
