import {DragDropContext, type DropResult} from '@hello-pangea/dnd'
import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import type {TaskColumns_teams$key} from '~/__generated__/TaskColumns_teams.graphql'
import type {TaskStatusEnum} from '../../__generated__/CreateTaskMutation.graphql'
import type {TaskColumns_tasks$key} from '../../__generated__/TaskColumns_tasks.graphql'
import type {AreaEnum} from '../../__generated__/UpdateTaskMutation.graphql'
import EditorHelpModalContainer from '../../containers/EditorHelpModalContainer/EditorHelpModalContainer'
import useAtmosphere from '../../hooks/useAtmosphere'
import useEventCallback from '../../hooks/useEventCallback'
import TaskColumn from '../../modules/teamDashboard/components/TaskColumn/TaskColumn'
import UpdateTaskMutation from '../../mutations/UpdateTaskMutation'
import {columnArray, MEETING, meetingColumnArray, SORT_STEP} from '../../utils/constants'
import dndNoise from '../../utils/dndNoise'
import makeTasksByStatus from '../../utils/makeTasksByStatus'

interface Props {
  area: AreaEnum
  isViewerMeetingSection?: boolean
  meetingId?: string
  myTeamMemberId?: string
  tasks: TaskColumns_tasks$key
  teamMemberFilterId?: string | null
  teams: TaskColumns_teams$key | null
}

const TaskColumns = (props: Props) => {
  const {
    area,
    isViewerMeetingSection,
    meetingId,
    myTeamMemberId,
    teamMemberFilterId,
    teams: teamsRef,
    tasks: tasksRef
  } = props
  const tasks = useFragment(
    graphql`
      fragment TaskColumns_tasks on Task
      @relay(plural: true)
      @argumentDefinitions(meetingId: {type: "ID"}) {
        ...TaskColumn_tasks @arguments(meetingId: $meetingId)
        status
        sortOrder
      }
    `,
    tasksRef
  )
  const teams = useFragment(
    graphql`
      fragment TaskColumns_teams on Team @relay(plural: true) {
        ...TaskColumn_teams
      }
    `,
    teamsRef
  )
  const atmosphere = useAtmosphere()
  const groupedTasks = useMemo(() => {
    return makeTasksByStatus(tasks)
  }, [tasks])
  const lanes = area === MEETING ? meetingColumnArray : columnArray

  const onDragEnd = useEventCallback((result: DropResult) => {
    const {source, destination, draggableId} = result
    if (!destination) return
    const isSameColumn = destination.droppableId === source.droppableId
    if (isSameColumn && destination.index === source.index) return
    const destinationTasks = groupedTasks[destination.droppableId as TaskStatusEnum]

    let sortOrder
    if (destination.index === 0) {
      const firstTask = destinationTasks[0]
      sortOrder = (firstTask ? firstTask.sortOrder + SORT_STEP : 0) + dndNoise()
    } else if (
      (isSameColumn && destination.index === destinationTasks.length - 1) ||
      (!isSameColumn && destination.index === destinationTasks.length)
    ) {
      sortOrder = destinationTasks[destinationTasks.length - 1]!.sortOrder - SORT_STEP + dndNoise()
    } else {
      const offset = !isSameColumn || source.index > destination.index ? -1 : 1
      sortOrder =
        (destinationTasks[destination.index + offset]!.sortOrder +
          destinationTasks[destination.index]!.sortOrder) /
          2 +
        dndNoise()
    }
    const updatedTask = {id: draggableId, sortOrder}
    if (!isSameColumn) {
      ;(updatedTask as any).status = destination.droppableId
    }
    UpdateTaskMutation(atmosphere, {updatedTask, area}, {})
  })
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className='m-0 flex h-full w-full max-w-[1360px] flex-1 overflow-auto px-2.5 py-0'>
        {lanes.map((status) => (
          <TaskColumn
            key={status}
            area={area}
            isViewerMeetingSection={isViewerMeetingSection}
            meetingId={meetingId}
            myTeamMemberId={myTeamMemberId}
            teamMemberFilterId={teamMemberFilterId}
            tasks={groupedTasks[status]}
            status={status}
            teams={teams}
          />
        ))}
      </div>
      <EditorHelpModalContainer />
    </DragDropContext>
  )
}

export default TaskColumns
