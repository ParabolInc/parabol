import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {commitLocalUpdate, PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useSearchFilter from '~/hooks/useSearchFilter'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import SearchQueryId from '../shared/gqlIds/SearchQueryId'
import getReposFromQueryStr from '../utils/getReposFromQueryStr'
import {isNotNull} from '../utils/predicates'
import {
  GitHubScopingSearchFilterMenuQuery,
  GitHubScopingSearchFilterMenuQueryResponse
} from '../__generated__/GitHubScopingSearchFilterMenuQuery.graphql'
import Checkbox from './Checkbox'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'
import {SearchMenuItem} from './SearchMenuItem'
import TypeAheadLabel from './TypeAheadLabel'

const StyledCheckBox = styled(Checkbox)({
  marginLeft: -8,
  marginRight: 8
})
const StyledMenuItemLabel = styled(MenuItemLabel)({})

const StyledMenu = styled(Menu)({
  maxWidth: '100%'
})

interface Props {
  menuProps: MenuProps
  queryRef: PreloadedQuery<GitHubScopingSearchFilterMenuQuery>
}

type GitHubSearchQuery = NonNullable<
  NonNullable<GitHubScopingSearchFilterMenuQueryResponse['viewer']['meeting']>['githubSearchQuery']
>

const MAX_REPOS = 10

const getValue = (item: {nameWithOwner?: string}) => {
  return item.nameWithOwner || 'Unknown Repo'
}

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
            integrations {
              github {
                api {
                  query {
                    viewer {
                      contributionsCollection {
                        commitContributionsByRepository(maxRepositories: 100) {
                          contributions(orderBy: {field: OCCURRED_AT, direction: DESC}, first: 1) {
                            nodes {
                              occurredAt
                              repository {
                                id
                                nameWithOwner
                              }
                            }
                          }
                        }
                        issueContributionsByRepository(maxRepositories: 100) {
                          contributions(orderBy: {direction: DESC}, first: 1) {
                            edges {
                              node {
                                occurredAt
                              }
                            }
                          }
                          repository {
                            id
                            nameWithOwner
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

  const meeting = query?.viewer?.meeting
  const meetingId = meeting?.id ?? ''
  const githubSearchQuery = meeting?.githubSearchQuery
  const queryString = githubSearchQuery?.queryString ?? null
  const atmosphere = useAtmosphere()
  const contributionsCollection =
    query?.viewer?.teamMember?.integrations.github?.api?.query?.viewer?.contributionsCollection
  const repoContributions = useMemo(() => {
    const repoContributions =
      contributionsCollection?.commitContributionsByRepository?.map((contributionByRepo) =>
        contributionByRepo.contributions.nodes ? contributionByRepo.contributions.nodes[0] : null
      ) ?? []
    const issueContributions =
      contributionsCollection?.issueContributionsByRepository.map((contributionByRepo) => {
        const {repository, contributions} = contributionByRepo
        const edges = contributions.edges ?? []
        const occurredAt = edges[0]?.node?.occurredAt
        return {
          repository,
          occurredAt
        }
      }) ?? []
    return [...repoContributions, ...issueContributions]
      .filter(isNotNull)
      .sort(
        (a, b) =>
          new Date(b.occurredAt as string).getTime() - new Date(a.occurredAt as string).getTime()
      )
      .map((sortedContributions) => sortedContributions?.repository)
  }, [contributionsCollection])

  const {
    query: searchQuery,
    filteredItems: filteredRepoContributions,
    onQueryChange
  } = useSearchFilter(repoContributions, getValue)

  // TODO parse the query string & extract out the repositories
  const selectedRepos = getReposFromQueryStr(queryString)
  const selectedAndFilteredRepos = useMemo(() => {
    const adjustedMax = selectedRepos.length >= MAX_REPOS ? selectedRepos.length + 1 : MAX_REPOS
    const repos = filteredRepoContributions.map(({nameWithOwner}) =>
      nameWithOwner.toLowerCase().trim()
    )
    return Array.from(new Set([...selectedRepos, ...repos])).slice(0, adjustedMax)
  }, [filteredRepoContributions])

  const {portalStatus, isDropdown} = menuProps
  return (
    <StyledMenu
      keepParentFocus
      ariaLabel='Define the GitHub search query'
      portalStatus={portalStatus}
      isDropdown={isDropdown}
    >
      <SearchMenuItem
        placeholder='Search your GitHub repos'
        onChange={onQueryChange}
        value={searchQuery}
      />
      {repoContributions.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>No repos found!</EmptyDropdownMenuItemLabel>
      )}
      {selectedAndFilteredRepos.map((repo) => {
        const isSelected = selectedRepos.includes(repo)
        const handleClick = () => {
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
        }
        return (
          <MenuItem
            key={repo}
            label={
              <StyledMenuItemLabel>
                <StyledCheckBox active={isSelected} />
                <TypeAheadLabel query={searchQuery} label={repo} />
              </StyledMenuItemLabel>
            }
            onClick={handleClick}
          />
        )
      })}
    </StyledMenu>
  )
}

export default GitHubScopingSearchFilterMenu
