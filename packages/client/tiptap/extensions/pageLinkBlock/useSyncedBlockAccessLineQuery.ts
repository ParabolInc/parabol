import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {SyncedBlockAccessLineQuery} from '../../../__generated__/SyncedBlockAccessLineQuery.graphql'

export const useSyncedBlockAccessLineQuery = (
  queryRef: PreloadedQuery<SyncedBlockAccessLineQuery>
) => {
  const data = usePreloadedQuery<SyncedBlockAccessLineQuery>(
    graphql`
      query SyncedBlockAccessLineQuery($pageId: ID!) {
        public {
          page(pageId: $pageId) {
            isParentLinked
            parentPage {
              title
            }
          }
        }
      }
    `,
    queryRef
  )
  return data.public?.page ?? null
}
