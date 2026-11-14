import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, readInlineData, usePreloadedQuery} from 'react-relay'
import type {SyncedBlockPlaces_page$key} from '../../../__generated__/SyncedBlockPlaces_page.graphql'
import type {SyncedBlockPlacesQuery} from '../../../__generated__/SyncedBlockPlacesQuery.graphql'
import {getSyncedBlockPlaces} from './getSyncedBlockPlaces'

export const useSyncedBlockPlaces = (
  queryRef: PreloadedQuery<SyncedBlockPlacesQuery>,
  currentPageId: string | undefined
) => {
  const data = usePreloadedQuery<SyncedBlockPlacesQuery>(
    graphql`
      query SyncedBlockPlacesQuery($pageId: ID!) {
        public {
          page(pageId: $pageId) {
            ...SyncedBlockPlaces_page
          }
        }
      }
    `,
    queryRef
  )
  const pageRef = data.public.page
  const page = pageRef
    ? readInlineData<SyncedBlockPlaces_page$key>(
        graphql`
          fragment SyncedBlockPlaces_page on Page @inline {
            id
            access {
              viewer
            }
            syncedBlockPlacements {
              pages {
                isOriginal
                page {
                  id
                  title
                  deletedAt
                }
              }
              hiddenCount
              successor {
                id
                title
              }
            }
          }
        `,
        pageRef
      )
    : null
  const placements = page?.syncedBlockPlacements
  return placements ? getSyncedBlockPlaces(placements, currentPageId) : null
}
