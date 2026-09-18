import type {GitHubRepoSearchFilterMenu_teamMember$key} from '../__generated__/GitHubRepoSearchFilterMenu_teamMember.graphql'
import useScopingSearchState from '../hooks/useScopingSearchState'
import type {ScopingSearchState} from '../integrations/platform/ScopingSearchState'
import {searchFiltersByKey} from '../shared/integrations/IntegrationSearchFilter'
import GitHubRepoSearchFilterMenu from './GitHubRepoSearchFilterMenu'

interface Props {
  meetingId: string
  state: ScopingSearchState
  teamMemberRef: GitHubRepoSearchFilterMenu_teamMember$key
}

const GitHubScopingSearchFilterMenu = (props: Props) => {
  const {meetingId, state, teamMemberRef} = props
  const setSearchState = useScopingSearchState(meetingId, 'github')
  const {filters} = state
  const selectedRepos = searchFiltersByKey(filters, 'repo')

  return (
    <GitHubRepoSearchFilterMenu
      selectedRepos={selectedRepos}
      onToggleRepo={(repo, isSelected) => {
        const nextFilters = isSelected
          ? filters.filter((filter) => !(filter.key === 'repo' && filter.value === repo))
          : [...filters, {key: 'repo', value: repo}]
        setSearchState({filters: nextFilters})
      }}
      teamMemberRef={teamMemberRef}
    />
  )
}

export default GitHubScopingSearchFilterMenu
