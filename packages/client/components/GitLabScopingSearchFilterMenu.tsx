import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {commitLocalUpdate, PreloadedQuery, usePreloadedQuery} from 'react-relay'
// import useSearchFilter from '~/hooks/useSearchFilter'
import {isNotNull} from '../utils/predicates'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import SearchQueryId from '../shared/gqlIds/SearchQueryId'
import getReposFromQueryStr from '../utils/getReposFromQueryStr'
import {
  GitLabScopingSearchFilterMenuQuery,
  GitLabScopingSearchFilterMenuQueryResponse
} from '../__generated__/GitLabScopingSearchFilterMenuQuery.graphql'
import Checkbox from './Checkbox'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'
import {SearchMenuItem} from './SearchMenuItem'
import TypeAheadLabel from './TypeAheadLabel'
import getNonNullEdges from '~/utils/getNonNullEdges'
import useSearchFilter from '~/hooks/useSearchFilter'

const StyledCheckBox = styled(Checkbox)({
  marginLeft: -8,
  marginRight: 8
})
const StyledMenuItemLabel = styled(MenuItemLabel)({})

interface Props {
  menuProps: MenuProps
  queryRef: PreloadedQuery<GitLabScopingSearchFilterMenuQuery>
}

type GitLabSearchQuery = NonNullable<
  NonNullable<GitLabScopingSearchFilterMenuQueryResponse['viewer']['meeting']>['gitlabSearchQuery']
>

const MAX_REPOS = 10

const getValue = (item: {name?: string}) => {
  return item.name || 'Unknown Project'
}

const GitLabScopingSearchFilterMenu = (props: Props) => {
  const {menuProps, queryRef} = props
  const query = usePreloadedQuery<GitLabScopingSearchFilterMenuQuery>(
    graphql`
      query GitLabScopingSearchFilterMenuQuery($teamId: ID!, $meetingId: ID!) {
        viewer {
          meeting(meetingId: $meetingId) {
            id
            ... on PokerMeeting {
              gitlabSearchQuery
              # queryString
              # }
            }
          }
          teamMember(teamId: $teamId) {
            integrations {
              gitlab {
                api {
                  query {
                    allProjectsTest: projects(
                      membership: true
                      first: 100
                      sort: "latest_activity_desc"
                    ) {
                      edges {
                        node {
                          ... on _xGitLabProject {
                            __typename
                            id
                            fullPath
                            name
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    queryRef,
    {UNSTABLE_renderPolicy: 'full'}
  )

  const nullableEdges =
    query.viewer.teamMember?.integrations.gitlab.api?.query?.allProjectsTest?.edges ?? []
  const projects = useMemo(() => getNonNullEdges(nullableEdges).map(({node}) => node), [query])
  // const meeting = query?.viewer?.meeting
  // const meetingId = meeting?.id ?? ''
  // const gitlabSearchQuery = meeting?.gitlabSearchQuery
  // const queryString = gitlabSearchQuery?.queryString ?? null
  // const atmosphere = useAtmosphere()
  // const contributionsByRepo =
  //   query?.viewer?.teamMember?.integrations.gitlab?.api?.query?.viewer?.contributionsCollection
  //     ?.commitContributionsByRepository ?? []
  // const repoContributions = useMemo(() => {
  //   const contributions = contributionsByRepo.map((contributionByRepo) =>
  //     contributionByRepo.contributions.nodes ? contributionByRepo.contributions.nodes[0] : null
  //   )
  //   return contributions
  //     .filter(isNotNull)
  //     .sort(
  //       (a, b) =>
  //         new Date(b.occurredAt as string).getTime() - new Date(a.occurredAt as string).getTime()
  //     )
  //     .map((sortedContributions) => sortedContributions?.repository)
  // }, [contributionsByRepo])

  const {query: searchQuery, filteredItems: filteredProjects, onQueryChange} = useSearchFilter(
    projects,
    getValue
  )

  // // TODO parse the query string & extract out the repositories
  // const selectedRepos = getReposFromQueryStr(queryString)
  // const selectedAndFilteredRepos = useMemo(() => {
  //   const adjustedMax = selectedRepos.length >= MAX_REPOS ? selectedRepos.length + 1 : MAX_REPOS
  //   const repos = filteredRepoContributions.map(({nameWithOwner}) =>
  //     nameWithOwner.toLowerCase().trim()
  //   )
  //   return Array.from(new Set([...selectedRepos, ...repos])).slice(0, adjustedMax)
  // }, [filteredRepoContributions])

  const {portalStatus, isDropdown} = menuProps
  return (
    <Menu
      keepParentFocus
      ariaLabel={'Define the GitLab search query'}
      portalStatus={portalStatus}
      isDropdown={isDropdown}
    >
      <SearchMenuItem
        placeholder='Search your GitLab repos'
        onChange={onQueryChange}
        value={searchQuery}
      />
      {filteredProjects.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>No repos found!</EmptyDropdownMenuItemLabel>
      )}
      {filteredProjects.map((project) => {
        const {id: projectId, name} = project
        // const isSelected = selectedRepos.includes(repo)
        const handleClick = () => {
          // commitLocalUpdate(atmosphere, (store) => {
          //   const searchQueryId = SearchQueryId.join('gitlab', meetingId)
          //   const gitlabSearchQuery = store.get<GitLabSearchQuery>(searchQueryId)!
          //   const newFilters = isSelected
          //     ? selectedRepos.filter((name) => name !== repo)
          //     : selectedRepos.concat(repo)
          //   const queryString = gitlabSearchQuery.getValue('queryString')
          //   const queryWithoutRepos = queryString
          //     .trim()
          //     .split(' ')
          //     .filter((str) => !str.includes('repo:'))
          //   const newRepos = newFilters.map((name) => `repo:${name}`)
          //   const newQueryStr = queryWithoutRepos.concat(newRepos).join(' ')
          //   gitlabSearchQuery.setValue(newQueryStr, 'queryString')
          // })
        }
        return (
          <MenuItem
            key={projectId}
            label={
              <StyledMenuItemLabel>
                <StyledCheckBox active={false} />
                <TypeAheadLabel query={searchQuery} label={name} />
              </StyledMenuItemLabel>
            }
            onClick={handleClick}
          />
        )
      })}
    </Menu>
  )
}

export default GitLabScopingSearchFilterMenu
