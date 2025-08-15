import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import DescriptionIcon from '@mui/icons-material/Description'
import UndoIcon from '@mui/icons-material/Undo'
import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {useHistory} from 'react-router'
import type {ArchivedPagesQuery} from '../../__generated__/ArchivedPagesQuery.graphql'
import {useArchivePageMutation} from '../../mutations/useArchivePageMutation'
import {ArchivedPagesButton} from './ArchivedPagesButton'

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
  const history = useHistory()
  const restorePage = (pageId: string) => {
    execute({
      variables: {
        pageId,
        action: 'restore'
      }
    })
  }
  const deletePage = (pageId: string) => {
    const pageCode = pageId.split('page:')[1]!
    if (location.href.endsWith(pageCode)) {
      history.push('/me')
    }
    execute({
      variables: {
        pageId,
        action: 'delete'
      }
    })
  }
  const header = edges.length === 0 ? 'No deleted pages' : 'Deleted pages'
  return (
    <div className='flex max-h-96 min-h-56 min-w-96 flex-col space-y-1 overflow-x-auto bg-white p-4 pb-0 text-slate-700'>
      <div className='self-center font-semibold text-sm'>{header}</div>
      {edges.map(({node}) => {
        const {id: pageId, title} = node
        return (
          <div className='flex items-center justify-between' key={pageId}>
            <div className='flex w-full items-center rounded-md pr-2 pl-1 hover:bg-slate-200'>
              <DescriptionIcon className='mr-0.5 size-4' />
              <div className='flex grow flex-col'>
                <div className='font-medium text-slate-700 text-sm'>{title || '<Untitled>'}</div>
              </div>
              <div className='flex items-center justify-end space-x-1'>
                <ArchivedPagesButton
                  Icon={UndoIcon}
                  tooltip='Restore'
                  onClick={(e) => {
                    e.preventDefault()
                    restorePage(pageId)
                  }}
                />
                <ArchivedPagesButton
                  Icon={DeleteForeverIcon}
                  tooltip='Permanently Delete'
                  onClick={(e) => {
                    e.preventDefault()
                    deletePage(pageId)
                  }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
