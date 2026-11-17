import clickUpScopingCurrentFiltersQuery, {
  type ClickUpScopingCurrentFiltersQuery
} from '../../__generated__/ClickUpScopingCurrentFiltersQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import type {ScopingSearchState} from '../platform/ScopingSearchState'
import ClickUpScopingCurrentFilters from './ClickUpScopingCurrentFilters'

interface Props {
  state: ScopingSearchState
  teamId: string
}

const ClickUpScopingCurrentFiltersRoot = (props: Props) => {
  const {state, teamId} = props
  const queryRef = useQueryLoaderNow<ClickUpScopingCurrentFiltersQuery>(
    clickUpScopingCurrentFiltersQuery,
    {teamId}
  )
  if (!queryRef) return null
  return <ClickUpScopingCurrentFilters state={state} queryRef={queryRef} />
}

export default ClickUpScopingCurrentFiltersRoot
