import React from 'react'
import DashSectionControl from 'universal/components/Dashboard/DashSectionControl'
import DashSectionControls from 'universal/components/Dashboard/DashSectionControls'
import DashSectionHeader from 'universal/components/Dashboard/DashSectionHeader'
import DashFilterLabel from 'universal/components/DashFilterLabel/DashFilterLabel'
import DashFilterToggle from 'universal/components/DashFilterToggle/DashFilterToggle'
import lazyPreload from 'universal/utils/lazyPreload'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'

const UserDashTeamMenu = lazyPreload(() =>
  import(/* webpackChunkName: 'UserDashTeamMenu' */
  'universal/components/UserDashTeamMenu')
)

interface Props {
  teams: Array<any>
  teamFilterId: string
  teamFilterName: string
}

const UserTasksHeader = (props: Props) => {
  const {teams, teamFilterId, teamFilterName} = props
  const {menuPortal, togglePortal, originRef, closePortal} = useMenu(MenuPosition.UPPER_RIGHT)
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
            <UserDashTeamMenu closePortal={closePortal} teams={teams} teamFilterId={teamFilterId} />
          )}
        </DashSectionControl>
      </DashSectionControls>
    </DashSectionHeader>
  )
}

export default UserTasksHeader
