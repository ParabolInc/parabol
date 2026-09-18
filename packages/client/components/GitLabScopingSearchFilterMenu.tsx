import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useSearchFilter from '~/hooks/useSearchFilter'
import getNonNullEdges from '~/utils/getNonNullEdges'
import SendClientSideEvent from '~/utils/SendClientSideEvent'
import type {GitLabScopingSearchFilterMenuQuery} from '../__generated__/GitLabScopingSearchFilterMenuQuery.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useSetScopingSearchState from '../hooks/useSetScopingSearchState'
import {
  searchFiltersByKey,
  toggleSearchFilter
} from '../integrations/platform/IntegrationSearchFilter'
import type {ScopingSearchState} from '../integrations/platform/ScopingSearchState'
import {MenuItem} from '../ui/Menu/MenuItem'
import {MenuSearch} from '../ui/Menu/MenuSearch'
import Checkbox from './Checkbox'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import TypeAheadLabel from './TypeAheadLabel'

interface Props {
  meetingId: string
  state: ScopingSearchState
  queryRef: PreloadedQuery<GitLabScopingSearchFilterMenuQuery>
}

const MAX_PROJECTS = 10

const getValue = (item: {fullPath?: string}) => {
  return item.fullPath || 'Unknown Project'
}

const GitLabScopingSearchFilterMenu = (props: Props) => {
  const {meetingId, state, queryRef} = props
  const data = usePreloadedQuery<GitLabScopingSearchFilterMenuQuery>(
    graphql`
      query GitLabScopingSearchFilterMenuQuery($teamId: ID!) {
        viewer {
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
                      search: "" # search tells Relay this query differs to the scoping results query
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
    queryRef
  )
  const nullableEdges =
    data.viewer.teamMember?.integrations.gitlab.api?.query?.projects?.edges ?? []
  const projects = useMemo(() => getNonNullEdges(nullableEdges).map(({node}) => node), [data])
  const {filters} = state
  const selectedProjectsIds = searchFiltersByKey(filters, 'project')
  const atmosphere = useAtmosphere()
  const setSearchState = useSetScopingSearchState(meetingId, 'gitlab')

  const {
    query: searchQuery,
    filteredItems: filteredProjects,
    onQueryChange
  } = useSearchFilter(projects, getValue)
  const visibleProjects = filteredProjects.slice(0, MAX_PROJECTS)

  return (
    <>
      <MenuSearch
        placeholder='Search GitLab projects'
        onChange={onQueryChange}
        value={searchQuery}
      />
      {visibleProjects.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>No projects found!</EmptyDropdownMenuItemLabel>
      )}
      {visibleProjects.map((project) => {
        const {id: projectId, fullPath} = project
        const isSelected = selectedProjectsIds.includes(projectId)

        const handleClick = () => {
          setSearchState({filters: toggleSearchFilter(filters, 'project', projectId)})
          SendClientSideEvent(atmosphere, 'Selected Poker Scope Project Filter', {
            meetingId,
            projectId,
            service: 'gitlab'
          })
        }
        return (
          <MenuItem key={projectId} onSelect={(e) => e.preventDefault()} onClick={handleClick}>
            <Checkbox className='-ml-2 mr-2' active={isSelected} />
            <TypeAheadLabel query={searchQuery} label={fullPath} />
          </MenuItem>
        )
      })}
    </>
  )
}

export default GitLabScopingSearchFilterMenu
