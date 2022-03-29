import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {commitLocalUpdate, PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import SearchQueryId from '../shared/gqlIds/SearchQueryId'
import Checkbox from './Checkbox'
import DropdownMenuLabel from './DropdownMenuLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemHR from './MenuItemHR'
import MenuItemLabel from './MenuItemLabel'
import MockFieldList from './MockFieldList'
import TypeAheadLabel from './TypeAheadLabel'
import useSearchFilter from '~/hooks/useSearchFilter'
import {SearchMenuItem} from './SearchMenuItem'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import {
  JiraScopingSearchFilterMenuQuery,
  JiraScopingSearchFilterMenuQueryResponse
} from '../__generated__/JiraScopingSearchFilterMenuQuery.graphql'

const StyledMenu = styled(Menu)({
  width: 250
})

const ProjectAvatar = styled('img')({
  height: 24,
  width: 24,
  marginRight: 8
})

const StyledCheckBox = styled(Checkbox)({
  marginLeft: -8,
  marginRight: 8
})

const UseJQLLabel = styled('span')({
  fontWeight: 600
})

const StyledMenuItemLabel = styled(MenuItemLabel)<{isDisabled: boolean}>(({isDisabled}) => ({
  opacity: isDisabled ? 0.5 : undefined
}))

const FilterLabel = styled(DropdownMenuLabel)({
  borderBottom: 0
})

interface Props {
  menuProps: MenuProps
  queryRef: PreloadedQuery<JiraScopingSearchFilterMenuQuery>
  error?: Error | null
}

type JiraSearchQuery = NonNullable<
  NonNullable<JiraScopingSearchFilterMenuQueryResponse['viewer']['meeting']>['jiraSearchQuery']
>

const getValue = (item: {name: string}) => item.name

const MAX_PROJECTS = 10

const gqlQuery = graphql`
  query JiraScopingSearchFilterMenuQuery($teamId: ID!, $meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        id
        ... on PokerMeeting {
          jiraSearchQuery {
            projectKeyFilters
            isJQL
          }
        }
      }
      teamMember(teamId: $teamId) {
        integrations {
          atlassian {
            projects {
              id
              name
              avatar
            }
          }
        }
      }
    }
  }
`

const JiraScopingSearchFilterMenu = (props: Props) => {
  const {menuProps, queryRef} = props
  const data = usePreloadedQuery<JiraScopingSearchFilterMenuQuery>(gqlQuery, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
  const {viewer} = data
  const isLoading = viewer === null
  const projects = viewer?.teamMember?.integrations.atlassian?.projects ?? []
  const meeting = viewer?.meeting ?? null
  const meetingId = meeting?.id ?? ''
  const jiraSearchQuery = meeting?.jiraSearchQuery ?? null
  const projectKeyFilters = jiraSearchQuery?.projectKeyFilters ?? []
  const isJQL = jiraSearchQuery?.isJQL ?? false

  const {
    query,
    filteredItems: queryFilteredProjects,
    onQueryChange
  } = useSearchFilter(projects, getValue)

  const showSearch = projects.length > MAX_PROJECTS
  const selectedAndFilteredProjects = useMemo(() => {
    const selectedProjects = projects.filter((project) => projectKeyFilters.includes(project.id))
    const adjustedMax =
      selectedProjects.length >= MAX_PROJECTS ? selectedProjects.length + 1 : MAX_PROJECTS
    return Array.from(new Set([...selectedProjects, ...queryFilteredProjects])).slice(
      0,
      adjustedMax
    )
  }, [queryFilteredProjects])

  const atmosphere = useAtmosphere()
  const {portalStatus, isDropdown} = menuProps
  const toggleJQL = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const searchQueryId = SearchQueryId.join('jira', meetingId)
      const jiraSearchQuery = store.get(searchQueryId)
      // this might bork if the checkbox is ticked before the full query loads
      if (!jiraSearchQuery) return
      jiraSearchQuery.setValue(!isJQL, 'isJQL')
      jiraSearchQuery.setValue([], 'projectKeyFilters')
    })
  }
  return (
    <StyledMenu
      keepParentFocus
      ariaLabel={'Define the Jira search query'}
      portalStatus={portalStatus}
      isDropdown={isDropdown}
      resetActiveOnChanges={[selectedAndFilteredProjects]}
    >
      <MenuItem
        key={'isJQL'}
        label={
          <MenuItemLabel>
            <StyledCheckBox active={isJQL} />
            <UseJQLLabel>{'Use JQL'}</UseJQLLabel>
          </MenuItemLabel>
        }
        onClick={toggleJQL}
      />
      <MenuItemHR />
      {isLoading && <MockFieldList />}
      {selectedAndFilteredProjects.length > 0 && <FilterLabel>Filter by project:</FilterLabel>}
      {showSearch && (
        <SearchMenuItem placeholder='Search Jira' onChange={onQueryChange} value={query} />
      )}
      {(query && selectedAndFilteredProjects.length === 0 && !isLoading && (
        <EmptyDropdownMenuItemLabel key='no-results'>
          No Jira Projects found!
        </EmptyDropdownMenuItemLabel>
      )) ||
        null}
      {selectedAndFilteredProjects.map((project) => {
        const {id: globalProjectKey, avatar, name} = project
        const toggleProjectKeyFilter = () => {
          commitLocalUpdate(atmosphere, (store) => {
            const searchQueryId = SearchQueryId.join('jira', meetingId)
            const jiraSearchQuery = store.get<JiraSearchQuery>(searchQueryId)!
            const projectKeyFiltersProxy = jiraSearchQuery.getValue('projectKeyFilters')!.slice()
            const keyIdx = projectKeyFiltersProxy.indexOf(globalProjectKey)
            if (keyIdx !== -1) {
              projectKeyFiltersProxy.splice(keyIdx, 1)
            } else {
              projectKeyFiltersProxy.push(globalProjectKey)
            }
            jiraSearchQuery.setValue(projectKeyFiltersProxy, 'projectKeyFilters')
          })
        }
        return (
          <MenuItem
            key={globalProjectKey}
            label={
              <StyledMenuItemLabel isDisabled={isJQL}>
                <StyledCheckBox
                  active={projectKeyFilters.includes(globalProjectKey)}
                  disabled={isJQL}
                />
                <ProjectAvatar src={avatar} />
                <TypeAheadLabel query={query} label={name} />
              </StyledMenuItemLabel>
            }
            onClick={toggleProjectKeyFilter}
            isDisabled={isJQL}
          />
        )
      })}
    </StyledMenu>
  )
}

export default JiraScopingSearchFilterMenu
