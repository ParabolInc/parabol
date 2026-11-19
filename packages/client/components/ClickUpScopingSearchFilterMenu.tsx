import useSetScopingSearchState from '../hooks/useSetScopingSearchState'
import {
  searchFiltersByKey,
  toggleSearchFilter
} from '../integrations/platform/IntegrationSearchFilter'
import type {FilterMenuProps} from '../integrations/platform/ScopingSearchState'
import ClickUpListSearchFilterMenuRoot from './ClickUpListSearchFilterMenuRoot'

const ClickUpScopingSearchFilterMenu = (props: FilterMenuProps) => {
  const {teamId, meetingId, state} = props
  const {filters} = state
  const setSearchState = useSetScopingSearchState(meetingId, 'clickup')

  return (
    <ClickUpListSearchFilterMenuRoot
      teamId={teamId}
      selectedListIds={searchFiltersByKey(filters, 'listIds')}
      onToggleList={(listId) =>
        setSearchState({filters: toggleSearchFilter(filters, 'listIds', listId)})
      }
    />
  )
}

export default ClickUpScopingSearchFilterMenu
