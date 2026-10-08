import linearScopingSearchFilterMenuQuery, {
  type LinearScopingSearchFilterMenuQuery
} from '../__generated__/LinearScopingSearchFilterMenuQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import type {FilterMenuProps} from '../integrations/platform/ScopingSearchState'
import LinearScopingSearchFilterMenu from './LinearScopingSearchFilterMenu'

const LinearScopingSearchFilterMenuRoot = (props: FilterMenuProps) => {
  const {teamId, meetingId, state} = props
  const queryRef = useQueryLoaderNow<LinearScopingSearchFilterMenuQuery>(
    linearScopingSearchFilterMenuQuery,
    {teamId}
  )
  if (!queryRef) return null
  return <LinearScopingSearchFilterMenu meetingId={meetingId} state={state} queryRef={queryRef} />
}

export default LinearScopingSearchFilterMenuRoot
