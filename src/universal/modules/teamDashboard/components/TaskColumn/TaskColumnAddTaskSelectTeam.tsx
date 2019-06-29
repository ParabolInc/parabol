import React from 'react'
import AddTaskButton from 'universal/components/AddTaskButton/AddTaskButton'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import {MenuPosition} from 'universal/hooks/useCoords'
import useMenu from 'universal/hooks/useMenu'
import CreateTaskMutation from 'universal/mutations/CreateTaskMutation'
import themeLabels from 'universal/styles/theme/labels'
import {ITeam, TaskStatusEnum} from 'universal/types/graphql'
import lazyPreload from 'universal/utils/lazyPreload'

interface Props {
  status: TaskStatusEnum
  sortOrder: number
  teams: ReadonlyArray<Pick<ITeam, 'id' | 'name'>>
}

const SelectTeamDropdown = lazyPreload(() =>
  import(/* webpackChunkName: 'SelectTeamDropdown' */
  'universal/components/SelectTeamDropdown')
)

const TaskColumnAddTaskSelectTeam = (props: Props) => {
  const {sortOrder, status, teams} = props
  const label = themeLabels.taskStatus[status].slug
  const atmosphere = useAtmosphere()
  const {menuProps, originRef, menuPortal, togglePortal} = useMenu(MenuPosition.UPPER_LEFT)
  const teamHandleClick = (teamId) => () => {
    CreateTaskMutation(atmosphere, {
      newTask: {
        sortOrder,
        status,
        teamId,
        userId: atmosphere.viewerId
      }
    })
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
