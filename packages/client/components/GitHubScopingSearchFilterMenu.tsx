import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {GitHubScopingSearchFilterMenuQuery} from '../__generated__/GitHubScopingSearchFilterMenuQuery.graphql'
import useSetScopingSearchState from '../hooks/useSetScopingSearchState'
import type {ScopingSearchState} from '../integrations/platform/ScopingSearchState'
import getReposFromQueryStr from '../utils/getReposFromQueryStr'
import GitHubRepoSearchFilterMenu from './GitHubRepoSearchFilterMenu'

interface Props {
  meetingId: string
  state: ScopingSearchState
  queryRef: PreloadedQuery<GitHubScopingSearchFilterMenuQuery>
}

const GitHubScopingSearchFilterMenu = (props: Props) => {
  const {meetingId, state, queryRef} = props
  const data = usePreloadedQuery<GitHubScopingSearchFilterMenuQuery>(
    graphql`
      query GitHubScopingSearchFilterMenuQuery($teamId: ID!) {
        viewer {
          teamMember(teamId: $teamId) {
            ...GitHubRepoSearchFilterMenu_teamMember
          }
        }
      }
    `,
    queryRef
  )
  const setSearchState = useSetScopingSearchState(meetingId, 'github')
  const {teamMember} = data.viewer
  if (!teamMember) return null
  const {queryString} = state
  const selectedRepos = getReposFromQueryStr(queryString)

  return (
    <GitHubRepoSearchFilterMenu
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
      teamMemberRef={teamMember}
    />
  )
}

export default GitHubScopingSearchFilterMenu
