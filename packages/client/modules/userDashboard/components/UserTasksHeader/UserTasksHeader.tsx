import React from 'react'
import DashSectionControl from '../../../../components/Dashboard/DashSectionControl'
import DashSectionControls from '../../../../components/Dashboard/DashSectionControls'
import DashSectionHeader from '../../../../components/Dashboard/DashSectionHeader'
import DashFilterLabel from '../../../../components/DashFilterLabel/DashFilterLabel'
import DashFilterToggle from '../../../../components/DashFilterToggle/DashFilterToggle'
import lazyPreload from '../../../../utils/lazyPreload'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {UserTasksHeader_viewer} from '__generated__/UserTasksHeader_viewer.graphql'

const UserDashTeamMenu = lazyPreload(() =>
  import(
    /* webpackChunkName: 'UserDashTeamMenu' */
    '../../../../components/UserDashTeamMenu'
  )
)

interface Props {
  viewer: UserTasksHeader_viewer
}

const UserTasksHeader = (props: Props) => {
  const {viewer} = props
  const {menuPortal, togglePortal, originRef, menuProps} = useMenu(MenuPosition.UPPER_RIGHT, {
    isDropdown: true
  })
  const {teamFilter} = viewer
  const teamFilterName = (teamFilter && teamFilter.name) || 'All teams'
  return (
    <DashSectionHeader>
      <DashSectionControls>
        <DashSectionControl>
          <DashFilterLabel>
            <b>{'Show Tasks for'}</b>
            {': '}
          </DashFilterLabel>
          <DashFilterToggle
            ref={originRef}
            onClick={togglePortal}
            onMouseEnter={UserDashTeamMenu.preload}
            label={teamFilterName}
          />
          {menuPortal(<UserDashTeamMenu menuProps={menuProps} viewer={viewer} />)}
        </DashSectionControl>
      </DashSectionControls>
    </DashSectionHeader>
  )
}

export default createFragmentContainer(UserTasksHeader, {
  viewer: graphql`
    fragment UserTasksHeader_viewer on User {
      ...UserDashTeamMenu_viewer
      teamFilter {
        id
        name
      }
    }
  `
})
