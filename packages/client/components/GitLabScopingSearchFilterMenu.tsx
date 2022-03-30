import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {commitLocalUpdate, PreloadedQuery, usePreloadedQuery} from 'react-relay'
// import useSearchFilter from '~/hooks/useSearchFilter'
import {isNotNull} from '../utils/predicates'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import SearchQueryId from '../shared/gqlIds/SearchQueryId'
import getProjectsFromQueryStr from '../utils/getProjectsFromQueryStr'
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

const StyledMenu = styled(Menu)({
  maxWidth: '100%'
})

interface Props {
  menuProps: MenuProps
  queryRef: PreloadedQuery<GitLabScopingSearchFilterMenuQuery>
}

type GitLabSearchQuery = NonNullable<
  NonNullable<GitLabScopingSearchFilterMenuQueryResponse['viewer']['meeting']>['gitlabSearchQuery']
>

const MAX_PROJECTS = 10

const getValue = (item: {fullPath?: string}) => {
  return item.fullPath || 'Unknown Project'
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
  console.log('🚀  ~ projects', {projects, query, nullableEdges})
  // const meeting = query?.viewer?.meeting
  // const meetingId = meeting?.id ?? ''
  // const gitlabSearchQuery = meeting?.gitlabSearchQuery
  // const queryString = gitlabSearchQuery?.queryString ?? null
  // const atmosphere = useAtmosphere()
  // const contributionsByProject =
  //   query?.viewer?.teamMember?.integrations.gitlab?.api?.query?.viewer?.contributionsCollection
  //     ?.commitContributionsByProjectsitory ?? []
  // const projectContributions = useMemo(() => {
  //   const contributions = contributionsByProject.map((contributionByProject) =>
  //     contributionByProject.contributions.nodes ? contributionByProject.contributions.nodes[0] : null
  //   )
  //   return contributions
  //     .filter(isNotNull)
  //     .sort(
  //       (a, b) =>
  //         new Date(b.occurredAt as string).getTime() - new Date(a.occurredAt as string).getTime()
  //     )
  //     .map((sortedContributions) => sortedContributions?.projectsitory)
  // }, [contributionsByProject])

  const {query: searchQuery, filteredItems: filteredProjects, onQueryChange} = useSearchFilter(
    projects,
    getValue
  )
  const visibleProjects = filteredProjects.slice(0, MAX_PROJECTS)

  // // TODO parse the query string & extract out the projectsitories
  const selectedProjects = getProjectsFromQueryStr(queryString)
  // const selectedAndFilteredProjects = useMemo(() => {
  //   const adjustedMax =
  //     selectedProjects.length >= MAX_PROJECTS ? selectedProjects.length + 1 : MAX_PROJECTS
  //   const projects = filteredProjectContributions.map(({nameWithOwner}) =>
  //     nameWithOwner.toLowerCase().trim()
  //   )
  //   return Array.from(new Set([...selectedProjects, ...projects])).slice(0, adjustedMax)
  // }, [filteredProjectContributions])

  const {portalStatus, isDropdown} = menuProps
  return (
    <StyledMenu
      keepParentFocus
      ariaLabel='Define the GitLab search query'
      portalStatus={portalStatus}
      isDropdown={isDropdown}
    >
      <SearchMenuItem
        placeholder='Search your GitLab projects'
        onChange={onQueryChange}
        value={searchQuery}
      />
      {visibleProjects.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>No projects found!</EmptyDropdownMenuItemLabel>
      )}
      {visibleProjects.map((project) => {
        const {id: projectId, name, fullPath} = project
        // const isSelected = selectedProjects.includes(project)
        const handleClick = () => {
          // commitLocalUpdate(atmosphere, (store) => {
          //   const searchQueryId = SearchQueryId.join('gitlab', meetingId)
          //   const gitlabSearchQuery = store.get<GitLabSearchQuery>(searchQueryId)!
          //   const newFilters = isSelected
          //     ? selectedProjects.filter((name) => name !== project)
          //     : selectedProjects.concat(project)
          //   const queryString = gitlabSearchQuery.getValue('queryString')
          //   const queryWithoutProjects = queryString
          //     .trim()
          //     .split(' ')
          //     .filter((str) => !str.includes('project:'))
          //   const newProjects = newFilters.map((name) => `project:${name}`)
          //   const newQueryStr = queryWithoutProjects.concat(newProjects).join(' ')
          //   gitlabSearchQuery.setValue(newQueryStr, 'queryString')
          // })
        }
        return (
          <MenuItem
            key={projectId}
            label={
              <StyledMenuItemLabel>
                <StyledCheckBox active={false} />
                <TypeAheadLabel query={searchQuery} label={fullPath} />
              </StyledMenuItemLabel>
            }
            onClick={handleClick}
          />
        )
      })}
    </StyledMenu>
  )
}

export default GitLabScopingSearchFilterMenu
