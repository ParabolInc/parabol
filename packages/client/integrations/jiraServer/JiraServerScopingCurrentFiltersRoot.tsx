import jiraServerScopingCurrentFiltersQuery, {
  type JiraServerScopingCurrentFiltersQuery
} from '../../__generated__/JiraServerScopingCurrentFiltersQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import type {ScopingSearchState} from '../platform/ScopingSearchState'
import JiraServerScopingCurrentFilters from './JiraServerScopingCurrentFilters'

interface Props {
  state: ScopingSearchState
  teamId: string
}

const JiraServerScopingCurrentFiltersRoot = (props: Props) => {
  const {state, teamId} = props
  const queryRef = useQueryLoaderNow<JiraServerScopingCurrentFiltersQuery>(
    jiraServerScopingCurrentFiltersQuery,
    {teamId}
  )
  if (!queryRef) return null
  return <JiraServerScopingCurrentFilters state={state} queryRef={queryRef} />
}

export default JiraServerScopingCurrentFiltersRoot
