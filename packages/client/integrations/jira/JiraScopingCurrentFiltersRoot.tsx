import jiraScopingCurrentFiltersQuery, {
  type JiraScopingCurrentFiltersQuery
} from '../../__generated__/JiraScopingCurrentFiltersQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import type {ScopingSearchState} from '../platform/ScopingSearchState'
import JiraScopingCurrentFilters from './JiraScopingCurrentFilters'

interface Props {
  state: ScopingSearchState
  teamId: string
}

const JiraScopingCurrentFiltersRoot = (props: Props) => {
  const {state, teamId} = props
  const queryRef = useQueryLoaderNow<JiraScopingCurrentFiltersQuery>(
    jiraScopingCurrentFiltersQuery,
    {teamId}
  )
  if (!queryRef) return null
  return <JiraScopingCurrentFilters state={state} queryRef={queryRef} />
}

export default JiraScopingCurrentFiltersRoot
