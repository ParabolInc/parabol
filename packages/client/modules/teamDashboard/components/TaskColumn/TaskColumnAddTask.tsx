import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {TaskColumnAddTask_teams$key} from '~/__generated__/TaskColumnAddTask_teams.graphql'
import {AreaEnum, TaskStatusEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import AddTaskButton from '../../../../components/AddTaskButton/AddTaskButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import CreateTaskMutation from '../../../../mutations/CreateTaskMutation'
import dndNoise from '../../../../utils/dndNoise'
import getNextSortOrder from '../../../../utils/getNextSortOrder'
import fromTeamMemberId from '../../../../utils/relay/fromTeamMemberId'
import {taskStatusLabels} from '../../../../utils/taskStatus'
import {TaskColumnAddTask_tasks$key} from '../../../../__generated__/TaskColumnAddTask_tasks.graphql'
import TaskColumnAddTaskSelectTeam from './TaskColumnAddTaskSelectTeam'

interface Props {
  area: AreaEnum
  isViewerMeetingSection?: boolean
  meetingId?: string
  status: TaskStatusEnum
  tasks: TaskColumnAddTask_tasks$key
  myTeamMemberId?: string
  teamMemberFilterId: string
  teams: TaskColumnAddTask_teams$key | null
}

const TaskColumnAddTask = (props: Props) => {
  const {
    area,
    isViewerMeetingSection,
    status,
    tasks: tasksRef,
    meetingId,
    myTeamMemberId,
    teamMemberFilterId,
    teams: teamsRef
  } = props
  const tasks = useFragment(
    graphql`
      fragment TaskColumnAddTask_tasks on Task @relay(plural: true) {
        sortOrder
      }
    `,
    tasksRef
  )
  const teams = useFragment(
    graphql`
      fragment TaskColumnAddTask_teams on Team @relay(plural: true) {
        id
        ...TaskColumnAddTaskSelectTeam_teams
      }
    `,
    teamsRef
  )
  const atmosphere = useAtmosphere()
  const label = taskStatusLabels[status]
  const sortOrder = getNextSortOrder(tasks, dndNoise())
  const {userId, teamId} = fromTeamMemberId(teamMemberFilterId || myTeamMemberId!)
  const {viewerId} = atmosphere
  if (teams) {
    if (teams.length === 1) {
      const {id: teamId} = teams[0]!
      const handleAddTask = () =>
        CreateTaskMutation(
          atmosphere,
          {
            newTask: {status, teamId, userId: userId || viewerId, sortOrder, meetingId}
          },
          {}
        )
      return <AddTaskButton onClick={handleAddTask} label={label} />
    }
    return (
      <TaskColumnAddTaskSelectTeam
        sortOrder={sortOrder}
        status={status}
        teams={teams}
        userId={userId || viewerId}
      />
    )
  } else if (area === 'teamDash' || isViewerMeetingSection) {
    const handleAddTask = () =>
      CreateTaskMutation(atmosphere, {newTask: {status, teamId, userId, sortOrder, meetingId}}, {})
    return <AddTaskButton onClick={handleAddTask} label={label} />
  }
  return null
}

export default TaskColumnAddTask
