import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {commitLocalUpdate, PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useSearchFilter from '~/hooks/useSearchFilter'
import getNonNullEdges from '~/utils/getNonNullEdges'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import SearchQueryId from '../shared/gqlIds/SearchQueryId'
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

type SelectedProject = NonNullable<GitLabSearchQuery['selectedProjects']>[0]

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
              gitlabSearchQuery {
                selectedProjects {
                  id
                  fullPath
                }
                queryString
              }
            }
          }
          teamMember(teamId: $teamId) {
            integrations {
              gitlab {
                api {
                  query {
                    projects(
                      ids: null
                      membership: true
                      first: 100
                      sort: "latest_activity_desc"
                      search: "" # search tells Relay this query differs to the GitLabScopingSearchResults query
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
    query.viewer.teamMember?.integrations.gitlab.api?.query?.projects?.edges ?? []
  const projects = useMemo(() => getNonNullEdges(nullableEdges).map(({node}) => node), [query])
  const meeting = query?.viewer?.meeting
  const meetingId = meeting?.id ?? ''
  const gitlabSearchQuery = meeting?.gitlabSearchQuery
  const {selectedProjects} = gitlabSearchQuery!
  const selectedProjectsIds = selectedProjects?.map(({id}) => id)
  const atmosphere = useAtmosphere()

  const {
    query: searchQuery,
    filteredItems: filteredProjects,
    onQueryChange
  } = useSearchFilter(projects, getValue)
  const visibleProjects = filteredProjects.slice(0, MAX_PROJECTS)

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
        const {id: projectId, fullPath} = project
        const isSelected = !!selectedProjectsIds?.includes(projectId)

        const handleClick = () => {
          commitLocalUpdate(atmosphere, (store) => {
            const searchQueryId = SearchQueryId.join('gitlab', meetingId)
            const gitlabSearchQuery = store.get<GitLabSearchQuery>(searchQueryId)!
            const selectedProjectRecord = store.get<SelectedProject>(projectId)
            if (!selectedProjectRecord) return
            const selectedProjectsRecords = gitlabSearchQuery.getLinkedRecords('selectedProjects')
            if (isSelected) {
              const newSelectedProjects = selectedProjectsRecords?.filter(
                (project) => project.getValue('id') !== projectId
              )
              gitlabSearchQuery.setLinkedRecords(newSelectedProjects, 'selectedProjects')
            } else {
              const newSelectedProjects = selectedProjectsRecords
                ? [...selectedProjectsRecords, selectedProjectRecord]
                : [selectedProjectRecord]
              gitlabSearchQuery.setLinkedRecords(newSelectedProjects, 'selectedProjects')
            }
          })
        }
        return (
          <MenuItem
            key={projectId}
            label={
              <StyledMenuItemLabel>
                <StyledCheckBox active={isSelected} />
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
