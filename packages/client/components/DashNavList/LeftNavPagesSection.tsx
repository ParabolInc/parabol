import AddIcon from '@mui/icons-material/Add'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {ConnectionHandler, useFragment} from 'react-relay'
import {useHistory} from 'react-router'
import type {LeftNavPagesSection_page$key} from '../../__generated__/LeftNavPagesSection_page.graphql'
import safePutNodeInConn from '../../mutations/handlers/safePutNodeInConn'
import {useCreatePageMutation} from '../../mutations/useCreatePageMutation'
import {cn} from '../../ui/cn'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'
import {LeftNavPageLink} from './LeftNavPageLink'

interface Props {
  title: string
  pageRef: LeftNavPagesSection_page$key
  draggingPageId: string | null | undefined
  canAdd?: boolean
}
export const LeftNavPagesSection = (props: Props) => {
  const {title, pageRef, draggingPageId, canAdd} = props
  const pageArray = useFragment(
    graphql`
      fragment LeftNavPagesSection_page on Page @relay(plural: true) {
        ...LeftNavPageLink_page
        id
        title
      }
    `,
    pageRef
  )
  const firstPageId = pageArray[0]?.id
  const canDropBelow = draggingPageId && draggingPageId !== firstPageId
  const [execute, submitting] = useCreatePageMutation()
  const history = useHistory()
  const addPrivatePage = (e: React.MouseEvent) => {
    // the parent will toggle show/hide
    e.stopPropagation()
    if (submitting) return
    execute({
      variables: {},
      updater: (store) => {
        const viewer = store.getRoot().getLinkedRecord('viewer')
        if (!viewer) return
        const conn = ConnectionHandler.getConnection(viewer, 'User_pages')
        const node = store.getRootField('createPage')?.getLinkedRecord('page')
        safePutNodeInConn(conn, node, store, 'sortOrder', true)
      },
      onCompleted: (response) => {
        const {createPage} = response
        const {page} = createPage
        const {id} = page
        const [_, pageId] = id.split(':')
        history.push(`/pages/${pageId}`)
      }
    })
  }
  const [showChildren, setShowChildren] = useState(true)
  const toggleChildren = () => {
    setShowChildren(!showChildren)
  }
  return (
    <div>
      <div
        onClick={toggleChildren}
        className='group flex flex-1 cursor-pointer items-center rounded-md py-0.5 pl-3 text-xs leading-5 font-semibold hover:bg-slate-300'
      >
        <div className='flex flex-col text-sm font-medium'>
          <span>{title}</span>
        </div>
        <div className={cn('hidden flex-1 items-center justify-end', canAdd && 'flex')}>
          <div className='mr-1 flex size-5 items-center justify-center rounded-sm hover:bg-slate-400'>
            <Tooltip>
              <TooltipTrigger asChild>
                <AddIcon
                  className='hidden size-4 cursor-pointer group-hover:block'
                  onClick={addPrivatePage}
                />
              </TooltipTrigger>
              <TooltipContent side={'bottom'}>{'Add a private page'}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
      <div className={cn('relative hidden', showChildren && 'block')}>
        <div
          className={cn(
            'absolute -top-0.5 left-0 z-20 hidden h-1 w-full hover:bg-sky-500/80 data-[drop-below]:flex',
            canDropBelow ? 'cursor-grabbing' : 'cursor-no-drop'
          )}
          data-drop-below={canDropBelow ? '' : undefined}
        ></div>
        {pageArray.map((page, idx) => {
          const {id} = page
          return (
            <LeftNavPageLink
              key={id}
              pageRef={page}
              pageAncestors={[page.id]}
              draggingPageId={draggingPageId}
              isFirstChild={idx === 0}
              isLastChild={idx === pageArray.length - 1}
              nextPeerId={pageArray[idx + 1]?.id || null}
            />
          )
        })}
      </div>
    </div>
  )
}
