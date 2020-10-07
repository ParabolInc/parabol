import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useFilteredItems from '../hooks/useFilteredItems'
import useForm from '../hooks/useForm'
import {MenuProps} from '../hooks/useMenu'
import {PALETTE} from '../styles/paletteV2'
import {ICON_SIZE} from '../styles/typographyV2'
import {IJiraSearchQuery} from '../types/graphql'
import {JiraScopingSearchFilterMenu_viewer} from '../__generated__/JiraScopingSearchFilterMenu_viewer.graphql'
import Checkbox from './Checkbox'
import Icon from './Icon'
import LoadingComponent from './LoadingComponent/LoadingComponent'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import MenuItemLabel from './MenuItemLabel'
import TaskFooterIntegrateMenuSearch from './TaskFooterIntegrateMenuSearch'
import TypeAheadLabel from './TypeAheadLabel'


const SearchIcon = styled(Icon)({
  color: PALETTE.TEXT_GRAY,
  fontSize: ICON_SIZE.MD18
})

const NoResults = styled(MenuItemLabel)({
  color: PALETTE.TEXT_GRAY,
  justifyContent: 'center',
  paddingLeft: 8,
  paddingRight: 8,
  fontStyle: 'italic'
})

const SearchItem = styled(MenuItemLabel)({
  margin: '0 8px 8px',
  overflow: 'visible',
  padding: 0,
  position: 'relative'
})

const StyledMenuItemIcon = styled(MenuItemComponentAvatar)({
  position: 'absolute',
  left: 8,
  margin: 0,
  pointerEvents: 'none',
  top: 4
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

interface Props {
  menuProps: MenuProps
  viewer: JiraScopingSearchFilterMenu_viewer | null
  error: Error | null
}

const getValue = (item: {name: string}) => item.name.toLowerCase()

const MAX_PROJECTS = 10
const JiraScopingSearchFilterMenu = (props: Props) => {
  const {menuProps, viewer} = props
  const isLoading = viewer === null
  const projects = viewer?.teamMember?.integrations.atlassian?.projects ?? []
  const meeting = viewer?.meeting ?? null
  const meetingId = meeting?.id ?? ''
  const projectKeyFilters = meeting?.jiraSearchQuery?.projectKeyFilters ?? []
  console.log({foo: viewer?.meeting?.jiraSearchQuery})
  const {fields, onChange} = useForm({
    search: {
      getDefault: () => ''
    }
  })
  const {search} = fields
  const {value} = search
  const query = value.toLowerCase()
  const showSearch = projects.length > MAX_PROJECTS
  const filteredProjects = useFilteredItems(query, projects, getValue)
  const atmosphere = useAtmosphere()
  const {portalStatus, isDropdown} = menuProps
  return (
    <Menu
      keepParentFocus
      ariaLabel={'Define the Jira search query'}
      portalStatus={portalStatus}
      isDropdown={isDropdown}
      resetActiveOnChanges={[filteredProjects]}
    >
      {showSearch && <SearchItem key='search'>
        <StyledMenuItemIcon>
          <SearchIcon>search</SearchIcon>
        </StyledMenuItemIcon>
        <TaskFooterIntegrateMenuSearch
          placeholder={'Search Jira'}
          value={value}
          onChange={onChange}
        />
      </SearchItem>}
      {(query && filteredProjects.length === 0 && !isLoading && (
        <NoResults key='no-results'>No Jira Projects found!</NoResults>
      )) ||
        null}
      {filteredProjects.slice(0, MAX_PROJECTS).map((project) => {
        const {id, avatarUrls, name, key} = project
        const {x24} = avatarUrls
        const toggleProjectKeyFilter = () => {
          commitLocalUpdate(atmosphere, (store) => {
            const id = `jiraSearchQuery:${meetingId}`
            const jiraSearchQuery = store.get<IJiraSearchQuery>(id)!
            const projectKeyFiltersProxy = jiraSearchQuery.getValue('projectKeyFilters')!.slice()
            const keyIdx = projectKeyFiltersProxy.indexOf(key)
            if (keyIdx !== -1) {
              projectKeyFiltersProxy.splice(keyIdx, 1)
            } else {
              projectKeyFiltersProxy.push(key)
            }
            jiraSearchQuery.setValue(projectKeyFiltersProxy, 'projectKeyFilters')
          })
        }
        return (
          <MenuItem
            key={id}
            label={
              <MenuItemLabel>
                <StyledCheckBox active={projectKeyFilters.includes(key)} />
                <ProjectAvatar src={x24} />
                <TypeAheadLabel query={query} label={name} />
              </MenuItemLabel>
            }
            onClick={toggleProjectKeyFilter}
          />
        )
      })}
      {isLoading && (
        <LoadingComponent key='loading' spinnerSize={24} height={24} showAfter={0} />
      )}
    </Menu>
  )
}


export default createFragmentContainer(JiraScopingSearchFilterMenu, {
  viewer: graphql`
    fragment JiraScopingSearchFilterMenu_viewer on User {
      meeting(meetingId: $meetingId) {
        id
        ...on PokerMeeting {
          jiraSearchQuery {
            queryString
            projectKeyFilters
          }
        }
      }
      teamMember(teamId: $teamId) {
        integrations {
          atlassian {
            projects {
              id
              name
              key
              avatarUrls {
                x24
              }
            }
          }
        }
      }
    }
  `
})
