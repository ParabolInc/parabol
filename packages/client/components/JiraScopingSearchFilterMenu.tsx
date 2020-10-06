import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useForm from '../hooks/useForm'
import {MenuProps} from '../hooks/useMenu'
import {PALETTE} from '../styles/paletteV2'
import {ICON_SIZE} from '../styles/typographyV2'
import {JiraScopingSearchFilterMenu_viewer} from '../__generated__/JiraScopingSearchFilterMenu_viewer.graphql'
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
  marginLeft: -8,
  marginRight: 8
})

interface Props {
  menuProps: MenuProps
  viewer: JiraScopingSearchFilterMenu_viewer | null
  error: Error | null
}

const JiraScopingSearchFilterMenu = (props: Props) => {
  const {menuProps, viewer} = props
  const projects = viewer?.teamMember?.integrations.atlassian?.projects ?? []
  const {fields, onChange} = useForm({
    search: {
      getDefault: () => ''
    }
  })
  const {search} = fields
  const {value} = search
  const query = value.toLowerCase()
  return (
    <Menu
      keepParentFocus
      ariaLabel={'Define the Jira search query'}
      {...menuProps}
      resetActiveOnChanges={[projects]}
    >
      <SearchItem key='search'>
        <StyledMenuItemIcon>
          <SearchIcon>search</SearchIcon>
        </StyledMenuItemIcon>
        <TaskFooterIntegrateMenuSearch
          placeholder={'Search Jira'}
          value={value}
          onChange={onChange}
        />
      </SearchItem>
      {(query && projects.length === 0 && status !== 'loading' && (
        <NoResults key='no-results'>No integrations found!</NoResults>
      )) ||
        null}
      {projects.map((project) => {
        const {avatarUrls, name} = project
        const {x24} = avatarUrls
        return (
          <MenuItem
            label={
              <MenuItemLabel>
                <ProjectAvatar src={x24} />
                <TypeAheadLabel query={query} label={name} />
              </MenuItemLabel>
            }
            onClick={() => {}}
          />
        )
      })}

      {status === 'loading' && (
        <LoadingComponent key='loading' spinnerSize={24} height={24} showAfter={0} />
      )}
    </Menu>
  )
}


export default createFragmentContainer(JiraScopingSearchFilterMenu, {
  viewer: graphql`
    fragment JiraScopingSearchFilterMenu_viewer on User {
      teamMember(teamId: $teamId) {
        integrations {
          atlassian {
            projects {
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
