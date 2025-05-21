import AddIcon from '@mui/icons-material/Add'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DescriptionIcon from '@mui/icons-material/Description'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {ConnectionHandler, useFragment} from 'react-relay'
import {useHistory, useRouteMatch} from 'react-router'
import {Link} from 'react-router-dom'
import type {LeftNavPageLink_page$key} from '../../__generated__/LeftNavPageLink_page.graphql'
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
  depth: number
}
export const LeftNavPageLink = (props: Props) => {
  const {pageRef, depth} = props
  const page = useFragment(
    graphql`
      fragment LeftNavPageLink_page on Page {
        id
        title
      }
    `,
    pageRef
  )
  const {title, id} = page
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
  return (
    <div className=''>
      <Link to={`/pages/${slug}`} key={slug} className='my-0.5 flex'>
        <div
          data-highlighted={isActive ? '' : undefined}
          style={{paddingLeft: depth * 8}}
          className={
            'pl- group flex w-full cursor-pointer items-center space-x-2 rounded-md px-1 py-1 text-sm leading-8 text-slate-700 outline-hidden hover:bg-slate-300 focus:bg-slate-300 data-highlighted:bg-slate-300 data-highlighted:text-slate-900'
          }
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
        </div>
      </Link>
      {showChildren && <SubPagesRoot parentPageId={id} depth={depth} />}
    </div>
  )
}
