import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {TaskColumnAddTaskSelectTeam_teams$key} from '~/__generated__/TaskColumnAddTaskSelectTeam_teams.graphql'
import {TaskStatusEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import AddTaskButton from '../../../../components/AddTaskButton/AddTaskButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import CreateTaskMutation from '../../../../mutations/CreateTaskMutation'
import lazyPreload from '../../../../utils/lazyPreload'
import {taskStatusLabels} from '../../../../utils/taskStatus'

interface Props {
  status: TaskStatusEnum
  sortOrder: number
  teams: TaskColumnAddTaskSelectTeam_teams$key
  userId: string
}

const SelectTeamDropdown = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'SelectTeamDropdown' */
      '../../../../components/SelectTeamDropdown'
    )
)

const TaskColumnAddTaskSelectTeam = (props: Props) => {
  const {sortOrder, status, teams: teamsRef, userId} = props
  const teams = useFragment(
    graphql`
      fragment TaskColumnAddTaskSelectTeam_teams on Team @relay(plural: true) {
        ...SelectTeamDropdown_teams
      }
    `,
    teamsRef
  )
  const label = taskStatusLabels[status]
  const atmosphere = useAtmosphere()
  const {menuProps, originRef, menuPortal, togglePortal} = useMenu(MenuPosition.UPPER_LEFT)
  const teamHandleClick = (teamId: string) => {
    CreateTaskMutation(
      atmosphere,
      {
        newTask: {
          sortOrder,
          status,
          teamId,
          userId
        }
      },
      {}
    )
  }
  return (
    <>
      <AddTaskButton
        ref={originRef}
        onClick={togglePortal}
        onMouseEnter={SelectTeamDropdown.preload}
        label={label}
      />
      {menuPortal(
        <SelectTeamDropdown menuProps={menuProps} teamHandleClick={teamHandleClick} teams={teams} />
      )}
    </>
  )
}

export default TaskColumnAddTaskSelectTeam
