import gitLabScopingCurrentFiltersQuery, {
  type GitLabScopingCurrentFiltersQuery
} from '../../__generated__/GitLabScopingCurrentFiltersQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import type {ScopingSearchState} from '../platform/ScopingSearchState'
import GitLabScopingCurrentFilters from './GitLabScopingCurrentFilters'

interface Props {
  state: ScopingSearchState
  teamId: string
}

const GitLabScopingCurrentFiltersRoot = (props: Props) => {
  const {state, teamId} = props
  const queryRef = useQueryLoaderNow<GitLabScopingCurrentFiltersQuery>(
    gitLabScopingCurrentFiltersQuery,
    {teamId}
  )
  if (!queryRef) return null
  return <GitLabScopingCurrentFilters state={state} queryRef={queryRef} />
}

export default GitLabScopingCurrentFiltersRoot
