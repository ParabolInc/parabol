import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {useNavigate} from 'react-router'
import {Autorenew as AutorenewIcon, Description as DescriptionIcon} from '~/ui/icons'
import menuSectionTitleClass from '~/ui/Menu/menuSectionTitleClass'
import type {ArchivedPagesQuery} from '../../__generated__/ArchivedPagesQuery.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import {snackOnError} from '../../mutations/handlers/snackOnError'
import {useArchivePageMutation} from '../../mutations/useArchivePageMutation'
import {GQLID} from '../../utils/GQLID'
import {ArchivedPageRow} from './ArchivedPageRow'

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
                isSyncedBlock
                parentPage {
                  title
                  deletedAt
                }
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
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const restorePage = (pageId: string) => {
    execute({
      variables: {
        pageId,
        action: 'restore'
      },
      onCompleted: (_res, errors) => {
        const [error] = errors ?? []
        if (error) snackOnError(atmosphere, 'archivedPageRestoreFailed')(error)
      }
    })
  }
  const deletePage = (pageId: string) => {
    const pageCode = GQLID.fromKey(pageId)[0]
    if (location.href.endsWith(`${pageCode}`)) {
      navigate('/me')
    }
    execute({
      variables: {
        pageId,
        action: 'delete'
      }
    })
  }
  const pages = edges.filter(({node}) => !node.isSyncedBlock)
  const blocks = edges.filter(({node}) => node.isSyncedBlock)
  const renderRow = ({node}: (typeof edges)[number]) => {
    const {id: pageId, title, isSyncedBlock, parentPage} = node
    const parentTitle = parentPage?.title || '<Untitled>'
    return (
      <ArchivedPageRow
        key={pageId}
        pageId={pageId}
        title={title ?? ''}
        Icon={isSyncedBlock ? AutorenewIcon : DescriptionIcon}
        subline={isSyncedBlock ? `From ${parentTitle}` : null}
        restoreBlockedBy={isSyncedBlock && parentPage?.deletedAt ? parentTitle : null}
        onRestore={restorePage}
        onDelete={deletePage}
      />
    )
  }
  const header = edges.length === 0 ? 'No deleted pages' : 'Deleted pages'
  return (
    <div className='flex max-h-96 min-h-56 min-w-96 flex-col space-y-1 overflow-x-auto rounded-lg border border-hairline bg-surface-card p-4 pb-0 text-fg-primary'>
      <div className='self-center font-semibold text-sm'>{header}</div>
      {pages.map(renderRow)}
      {blocks.length > 0 && (
        <>
          <div className={menuSectionTitleClass}>Synced blocks</div>
          {blocks.map(renderRow)}
        </>
      )}
    </div>
  )
}
