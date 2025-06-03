import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import DescriptionIcon from '@mui/icons-material/Description'
import UndoIcon from '@mui/icons-material/Undo'
import graphql from 'babel-plugin-relay/macro'
import {usePreloadedQuery, type PreloadedQuery} from 'react-relay'
import type {ArchivedPagesQuery} from '../../__generated__/ArchivedPagesQuery.graphql'
import {useArchivePageMutation} from '../../mutations/useArchivePageMutation'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'
interface Props {
  queryRef: PreloadedQuery<ArchivedPagesQuery>
}

export const ArchivedPages = (props: Props) => {
  const {queryRef} = props
  const query = usePreloadedQuery<ArchivedPagesQuery>(
    graphql`
      query ArchivedPagesQuery {
        viewer {
          archivedPages: pages(first: 500, isArchived: true)
            @connection(key: "User_archivedPages") {
            edges {
              node {
                id
                title
              }
            }
          }
        }
      }
    `,
    queryRef
  )
  const {viewer} = query
  const {archivedPages} = viewer
  const {edges} = archivedPages
  const [execute] = useArchivePageMutation()
  const restorePage = (pageId: string) => {
    execute({
      variables: {
        pageId,
        action: 'restore'
      }
    })
  }
  const deletePage = (pageId: string) => {
    execute({
      variables: {
        pageId,
        action: 'delete'
      }
    })
  }
  return (
    <div className='flex max-h-96 min-h-56 min-w-96 flex-col space-y-1 overflow-x-auto bg-white p-4 pb-0 text-slate-700'>
      {edges.length === 0 && <div>No deleted pages </div>}
      {edges.map(({node}) => {
        const {id: pageId, title} = node
        return (
          <div className='flex items-center justify-between' key={pageId}>
            <div className='flex w-full items-center rounded-md pr-2 pl-1 hover:bg-slate-200'>
              <DescriptionIcon className='mr-0.5 size-4' />
              <div className='flex grow flex-col'>
                <div className='text-sm font-medium text-slate-700'>{title || '<Untitled>'}</div>
              </div>
              <div className='flex items-center justify-end space-x-1'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={
                        'flex size-5 cursor-pointer items-center justify-center rounded-sm bg-slate-200 group-hover:bg-slate-300 group-data-highlighted:bg-slate-300 hover:bg-slate-400'
                      }
                    >
                      <UndoIcon
                        className='size-4'
                        onClick={(e) => {
                          e.preventDefault()
                          restorePage(pageId)
                        }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side={'bottom'}>{'Restore'}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={
                        'flex size-5 cursor-pointer items-center justify-center rounded-sm bg-slate-200 group-hover:bg-slate-300 group-data-highlighted:bg-slate-300 hover:bg-slate-400'
                      }
                    >
                      <DeleteForeverIcon
                        className='size-4'
                        onClick={(e) => {
                          e.preventDefault()
                          deletePage(pageId)
                        }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side={'bottom'}>{'Permanently Delete'}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
