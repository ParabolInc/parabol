import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {SyncedBlockAccessLineQuery} from '../../../__generated__/SyncedBlockAccessLineQuery.graphql'

interface Props {
  queryRef: PreloadedQuery<SyncedBlockAccessLineQuery>
}

export const SyncedBlockAccessLine = ({queryRef}: Props) => {
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
  const page = data.public?.page
  if (!page?.isParentLinked || !page.parentPage) return null
  return (
    <p className='m-0 text-[13px] text-fg-secondary'>
      Everyone who can open {page.parentPage.title || '<Untitled>'} can see this block.
    </p>
  )
}
