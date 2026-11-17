import clickUpScopingSearchFilterMenuQuery, {
  type ClickUpScopingSearchFilterMenuQuery
} from '../__generated__/ClickUpScopingSearchFilterMenuQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import type {FilterMenuProps} from '../integrations/platform/ScopingSearchState'
import ClickUpScopingSearchFilterMenu from './ClickUpScopingSearchFilterMenu'

const ClickUpScopingSearchFilterMenuRoot = (props: FilterMenuProps) => {
  const {teamId, meetingId, state} = props
  const queryRef = useQueryLoaderNow<ClickUpScopingSearchFilterMenuQuery>(
    clickUpScopingSearchFilterMenuQuery,
    {teamId}
  )
  if (!queryRef) return null
  return <ClickUpScopingSearchFilterMenu meetingId={meetingId} state={state} queryRef={queryRef} />
}

export default ClickUpScopingSearchFilterMenuRoot
