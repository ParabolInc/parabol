import gitLabScopingSearchFilterMenuQuery, {
  type GitLabScopingSearchFilterMenuQuery
} from '../__generated__/GitLabScopingSearchFilterMenuQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import type {FilterMenuProps} from '../integrations/platform/ScopingSearchState'
import GitLabScopingSearchFilterMenu from './GitLabScopingSearchFilterMenu'

const GitLabScopingSearchFilterMenuRoot = (props: FilterMenuProps) => {
  const {teamId, meetingId, state} = props
  const queryRef = useQueryLoaderNow<GitLabScopingSearchFilterMenuQuery>(
    gitLabScopingSearchFilterMenuQuery,
    {teamId}
  )
  if (!queryRef) return null
  return <GitLabScopingSearchFilterMenu meetingId={meetingId} state={state} queryRef={queryRef} />
}

export default GitLabScopingSearchFilterMenuRoot
