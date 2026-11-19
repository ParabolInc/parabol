import useSetScopingSearchState from '../hooks/useSetScopingSearchState'
import {
  searchFiltersByKey,
  toggleSearchFilter
} from '../integrations/platform/IntegrationSearchFilter'
import type {FilterMenuProps} from '../integrations/platform/ScopingSearchState'
import LinearProjectAndTeamMenuRoot from './LinearProjectAndTeamMenuRoot'

const LinearScopingSearchFilterMenu = (props: FilterMenuProps) => {
  const {teamId, meetingId, state} = props
  const setSearchState = useSetScopingSearchState(meetingId, 'linear')
  const {filters} = state
  const selectedItemIds = [
    ...searchFiltersByKey(filters, 'project'),
    ...searchFiltersByKey(filters, 'team')
  ]

  return (
    <LinearProjectAndTeamMenuRoot
      teamId={teamId}
      selectedItemIds={selectedItemIds}
      getItemId={(item) => item.id}
      onSelectItem={(item) => {
        const key = item.__typename === '_xLinearProject' ? 'project' : 'team'
        setSearchState({filters: toggleSearchFilter(filters, key, item.id)})
      }}
    />
  )
}

export default LinearScopingSearchFilterMenu
