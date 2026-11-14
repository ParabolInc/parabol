import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, readInlineData, usePreloadedQuery} from 'react-relay'
import type {SyncedBlockDialog_page$key} from '../../../__generated__/SyncedBlockDialog_page.graphql'
import type {SyncedBlockDialogQuery} from '../../../__generated__/SyncedBlockDialogQuery.graphql'

export const useSyncedBlockDialogQuery = (queryRef: PreloadedQuery<SyncedBlockDialogQuery>) => {
  const data = usePreloadedQuery<SyncedBlockDialogQuery>(
    graphql`
      query SyncedBlockDialogQuery($pageId: ID!) {
        public {
          page(pageId: $pageId) {
            ...SyncedBlockDialog_page
          }
        }
      }
    `,
    queryRef
  )
  const pageRef = data.public?.page
  return pageRef
    ? readInlineData<SyncedBlockDialog_page$key>(
        graphql`
          fragment SyncedBlockDialog_page on Page @inline {
            id
            access {
              public
            }
            syncedBlockPlacements {
              pages {
                isOriginal
                hiddenReaderCount
                page {
                  id
                  title
                  access {
                    public
                  }
                }
              }
              hiddenCount
            }
          }
        `,
        pageRef
      )
    : null
}
