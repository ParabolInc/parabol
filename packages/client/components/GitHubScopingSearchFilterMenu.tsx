import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {GitHubScopingSearchFilterMenuQuery} from '../__generated__/GitHubScopingSearchFilterMenuQuery.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import SearchQueryId from '../shared/gqlIds/SearchQueryId'
import getReposFromQueryStr from '../utils/getReposFromQueryStr'
import GitHubRepoSearchFilterMenu from './GitHubRepoSearchFilterMenu'

interface Props {
  menuProps: MenuProps
  queryRef: PreloadedQuery<GitHubScopingSearchFilterMenuQuery>
}

type GitHubSearchQuery = NonNullable<
  NonNullable<
    GitHubScopingSearchFilterMenuQuery['response']['viewer']['meeting']
  >['githubSearchQuery']
>

const GitHubScopingSearchFilterMenu = (props: Props) => {
  const {menuProps, queryRef} = props
  const query = usePreloadedQuery<GitHubScopingSearchFilterMenuQuery>(
    graphql`
      query GitHubScopingSearchFilterMenuQuery($teamId: ID!, $meetingId: ID!) {
        viewer {
          meeting(meetingId: $meetingId) {
            id
            ... on PokerMeeting {
              githubSearchQuery {
                queryString
              }
            }
          }
          teamMember(teamId: $teamId) {
            ...GitHubRepoSearchFilterMenu_teamMember
          }
        }
      }
    `,
    queryRef
  )

  const meeting = query?.viewer?.meeting
  const meetingId = meeting?.id ?? ''
  const githubSearchQuery = meeting?.githubSearchQuery
  const queryString = githubSearchQuery?.queryString ?? null
  const atmosphere = useAtmosphere()
  const selectedRepos = getReposFromQueryStr(queryString)

  return (
    <GitHubRepoSearchFilterMenu
      selectedRepos={selectedRepos}
      onToggleRepo={(repo, isSelected) => {
        commitLocalUpdate(atmosphere, (store) => {
          const searchQueryId = SearchQueryId.join('github', meetingId)
          const githubSearchQuery = store.get<GitHubSearchQuery>(searchQueryId)!
          const newFilters = isSelected
            ? selectedRepos.filter((name) => name !== repo)
            : selectedRepos.concat(repo)
          const queryString = githubSearchQuery.getValue('queryString')
          const queryWithoutRepos = queryString
            .trim()
            .split(' ')
            .filter((str) => !str.includes('repo:'))
          const newRepos = newFilters.map((name) => `repo:${name}`)
          const newQueryStr = queryWithoutRepos.concat(newRepos).join(' ')
          githubSearchQuery.setValue(newQueryStr, 'queryString')
        })
      }}
      teamMemberRef={query.viewer.teamMember!}
      menuProps={menuProps}
    />
  )
}

export default GitHubScopingSearchFilterMenu
