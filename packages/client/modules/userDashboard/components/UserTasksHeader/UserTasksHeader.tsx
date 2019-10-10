import React from 'react'
import DashSectionControl from '../../../../components/Dashboard/DashSectionControl'
import DashSectionControls from '../../../../components/Dashboard/DashSectionControls'
import DashSectionHeader from '../../../../components/Dashboard/DashSectionHeader'
import DashFilterLabel from '../../../../components/DashFilterLabel/DashFilterLabel'
import DashFilterToggle from '../../../../components/DashFilterToggle/DashFilterToggle'
import lazyPreload from '../../../../utils/lazyPreload'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'

const UserDashTeamMenu = lazyPreload(() =>
  import(
    /* webpackChunkName: 'UserDashTeamMenu' */
    '../../../../components/UserDashTeamMenu'
  )
)

interface Props {
  teams: any[]
  teamFilterId: string
  teamFilterName: string
}

const UserTasksHeader = (props: Props) => {
  const {teams, teamFilterId, teamFilterName} = props
  const {menuPortal, togglePortal, originRef, menuProps} = useMenu(MenuPosition.UPPER_RIGHT, {
    isDropdown: true
  })
  // TODO refactor so we can pull teams from the relay cache instead of feeding it down a long tree
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
          {menuPortal(
            <UserDashTeamMenu menuProps={menuProps} teams={teams} teamFilterId={teamFilterId} />
          )}
        </DashSectionControl>
      </DashSectionControls>
    </DashSectionHeader>
  )
}

export default UserTasksHeader
