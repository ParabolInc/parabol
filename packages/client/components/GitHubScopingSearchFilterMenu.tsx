import useSetScopingSearchState from '../hooks/useSetScopingSearchState'
import type {FilterMenuProps} from '../integrations/platform/ScopingSearchState'
import getReposFromQueryStr from '../utils/getReposFromQueryStr'
import GitHubRepoSearchFilterMenuRoot from './GitHubRepoSearchFilterMenuRoot'

const GitHubScopingSearchFilterMenu = (props: FilterMenuProps) => {
  const {teamId, meetingId, state} = props
  const setSearchState = useSetScopingSearchState(meetingId, 'github')
  const {queryString} = state
  const selectedRepos = getReposFromQueryStr(queryString)

  return (
    <GitHubRepoSearchFilterMenuRoot
      teamId={teamId}
      selectedRepos={selectedRepos}
      onToggleRepo={(repo, isSelected) => {
        const nextRepos = isSelected
          ? selectedRepos.filter((name) => name !== repo)
          : selectedRepos.concat(repo)
        const queryWithoutRepos = queryString
          .trim()
          .split(' ')
          .filter((str) => !str.includes('repo:'))
        const repoTokens = nextRepos.map((name) => `repo:${name}`)
        setSearchState({queryString: queryWithoutRepos.concat(repoTokens).join(' ')})
      }}
    />
  )
}

export default GitHubScopingSearchFilterMenu
