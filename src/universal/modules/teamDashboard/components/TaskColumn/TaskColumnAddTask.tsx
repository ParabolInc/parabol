import React from 'react'
import AddTaskButton from 'universal/components/AddTaskButton/AddTaskButton'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import TaskColumnAddTaskSelectTeam from 'universal/modules/teamDashboard/components/TaskColumn/TaskColumnAddTaskSelectTeam'
import CreateTaskMutation from 'universal/mutations/CreateTaskMutation'
import themeLabels from 'universal/styles/theme/labels'
import {AreaEnum, ITask, ITeam, TaskStatusEnum} from 'universal/types/graphql'
import dndNoise from 'universal/utils/dndNoise'
import getNextSortOrder from 'universal/utils/getNextSortOrder'
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId'

interface Props {
  area: AreaEnum
  isMyMeetingSection?: boolean
  status: TaskStatusEnum
  tasks: ReadonlyArray<Pick<ITask, 'sortOrder'>>
  myTeamMemberId: string
  teamMemberFilterId: string
  teams: ReadonlyArray<Pick<ITeam, 'id' | 'name'>>
}

const handleAddTaskFactory = (atmosphere, status, teamId, userId, sortOrder) => () => {
  const newTask = {
    status,
    teamId,
    userId,
    sortOrder
  }
  CreateTaskMutation(atmosphere, newTask)
}

const TaskColumnAddTask = (props: Props) => {
  const {area, isMyMeetingSection, status, tasks, myTeamMemberId, teamMemberFilterId, teams} = props
  const atmosphere = useAtmosphere()
  const label = themeLabels.taskStatus[status].slug
  const sortOrder = getNextSortOrder(tasks, dndNoise())
  if (area === AreaEnum.teamDash || isMyMeetingSection) {
    const {userId, teamId} = fromTeamMemberId(teamMemberFilterId || myTeamMemberId)
    const handleAddTask = handleAddTaskFactory(atmosphere, status, teamId, userId, sortOrder)
    return <AddTaskButton onClick={handleAddTask} label={label} />
  } else if (area === AreaEnum.userDash) {
    if (teams.length === 1) {
      const {id: teamId} = teams[0]
      const {viewerId} = atmosphere
      const handleAddTask = handleAddTaskFactory(atmosphere, status, teamId, viewerId, sortOrder)
      return <AddTaskButton onClick={handleAddTask} label={label} />
    }
    return <TaskColumnAddTaskSelectTeam sortOrder={sortOrder} status={status} teams={teams} />
  }
  return null
}

export default TaskColumnAddTask
