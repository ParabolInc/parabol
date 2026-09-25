import gitHubScopingSearchFilterMenuQuery, {
  type GitHubScopingSearchFilterMenuQuery
} from '../__generated__/GitHubScopingSearchFilterMenuQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import type {FilterMenuProps} from '../integrations/platform/ScopingSearchState'
import GitHubScopingSearchFilterMenu from './GitHubScopingSearchFilterMenu'

const GitHubScopingSearchFilterMenuRoot = (props: FilterMenuProps) => {
  const {teamId, meetingId, state} = props
  const queryRef = useQueryLoaderNow<GitHubScopingSearchFilterMenuQuery>(
    gitHubScopingSearchFilterMenuQuery,
    {teamId}
  )
  if (!queryRef) return null
  return <GitHubScopingSearchFilterMenu meetingId={meetingId} state={state} queryRef={queryRef} />
}

export default GitHubScopingSearchFilterMenuRoot
