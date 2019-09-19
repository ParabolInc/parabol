import React from 'react'
import AddTaskButton from '../../../../components/AddTaskButton/AddTaskButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import TaskColumnAddTaskSelectTeam from './TaskColumnAddTaskSelectTeam'
import CreateTaskMutation from '../../../../mutations/CreateTaskMutation'
import {AreaEnum, ITeam, TaskStatusEnum} from '../../../../types/graphql'
import dndNoise from '../../../../utils/dndNoise'
import getNextSortOrder from '../../../../utils/getNextSortOrder'
import fromTeamMemberId from '../../../../utils/relay/fromTeamMemberId'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {TaskColumnAddTask_tasks} from '../../../../__generated__/TaskColumnAddTask_tasks.graphql'
import taskStatusLabels from '../../../../utils/taskStatusLabels'

interface Props {
  area: AreaEnum
  isMyMeetingSection?: boolean
  meetingId?: string
  status: TaskStatusEnum
  tasks: TaskColumnAddTask_tasks
  myTeamMemberId?: string
  teamMemberFilterId: string
  teams: readonly Pick<ITeam, 'id' | 'name'>[]
}

const TaskColumnAddTask = (props: Props) => {
  const {
    area,
    isMyMeetingSection,
    status,
    tasks,
    meetingId,
    myTeamMemberId,
    teamMemberFilterId,
    teams
  } = props
  const atmosphere = useAtmosphere()
  const label = taskStatusLabels[status]
  const sortOrder = getNextSortOrder(tasks, dndNoise())
  if (area === AreaEnum.teamDash || isMyMeetingSection) {
    const {userId, teamId} = fromTeamMemberId(teamMemberFilterId || myTeamMemberId!)
    const handleAddTask = () =>
      CreateTaskMutation(atmosphere, {newTask: {status, teamId, userId, sortOrder, meetingId}})
    return <AddTaskButton onClick={handleAddTask} label={label} />
  } else if (area === AreaEnum.userDash) {
    if (teams.length === 1) {
      const {id: teamId} = teams[0]
      const {viewerId} = atmosphere
      const handleAddTask = () =>
        CreateTaskMutation(atmosphere, {
          newTask: {status, teamId, userId: viewerId, sortOrder, meetingId}
        })
      return <AddTaskButton onClick={handleAddTask} label={label} />
    }
    return <TaskColumnAddTaskSelectTeam sortOrder={sortOrder} status={status} teams={teams} />
  }
  return null
}

export default createFragmentContainer(TaskColumnAddTask, {
  tasks: graphql`
    fragment TaskColumnAddTask_tasks on Task @relay(plural: true) {
      sortOrder
    }
  `
})
