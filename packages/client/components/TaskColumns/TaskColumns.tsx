import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {DragDropContext, DropResult} from 'react-beautiful-dnd'
import {createFragmentContainer} from 'react-relay'
import {TaskColumns_teams} from '~/__generated__/TaskColumns_teams.graphql'
import EditorHelpModalContainer from '../../containers/EditorHelpModalContainer/EditorHelpModalContainer'
import useAtmosphere from '../../hooks/useAtmosphere'
import useEventCallback from '../../hooks/useEventCallback'
import TaskColumn from '../../modules/teamDashboard/components/TaskColumn/TaskColumn'
import UpdateTaskMutation from '../../mutations/UpdateTaskMutation'
import {Layout} from '../../types/constEnums'
import {columnArray, MEETING, meetingColumnArray, SORT_STEP} from '../../utils/constants'
import dndNoise from '../../utils/dndNoise'
import makeTasksByStatus from '../../utils/makeTasksByStatus'
import {TaskColumns_tasks} from '../../__generated__/TaskColumns_tasks.graphql'
import {AreaEnum} from '../../__generated__/UpdateTaskMutation.graphql'

const ColumnsBlock = styled('div')({
  display: 'flex',
  flex: '1',
  height: '100%',
  margin: '0 auto',
  maxWidth: Layout.TASK_COLUMNS_MAX_WIDTH,
  overflow: 'auto',
  padding: `0 10px`,
  width: '100%'
})

interface Props {
  area: AreaEnum
  isViewerMeetingSection?: boolean
  meetingId?: string
  myTeamMemberId?: string
  tasks: TaskColumns_tasks
  teamMemberFilterId?: string | null
  teams: TaskColumns_teams | null
}

const TaskColumns = (props: Props) => {
  const {
    area,
    isViewerMeetingSection,
    meetingId,
    myTeamMemberId,
    teamMemberFilterId,
    teams,
    tasks
  } = props
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
    const destinationTasks = groupedTasks[destination.droppableId]

    let sortOrder
    if (destination.index === 0) {
      const firstTask = destinationTasks[0]
      sortOrder = (firstTask ? firstTask.sortOrder + SORT_STEP : 0) + dndNoise()
    } else if (
      (isSameColumn && destination.index === destinationTasks.length - 1) ||
      (!isSameColumn && destination.index === destinationTasks.length)
    ) {
      sortOrder = destinationTasks[destinationTasks.length - 1].sortOrder - SORT_STEP + dndNoise()
    } else {
      const offset = !isSameColumn || source.index > destination.index ? -1 : 1
      sortOrder =
        (destinationTasks[destination.index + offset].sortOrder +
          destinationTasks[destination.index].sortOrder) /
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
      <ColumnsBlock>
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
      </ColumnsBlock>
      <EditorHelpModalContainer />
    </DragDropContext>
  )
}

export default createFragmentContainer(TaskColumns, {
  tasks: graphql`
    fragment TaskColumns_tasks on Task
    @relay(plural: true)
    @argumentDefinitions(meetingId: {type: "ID"}) {
      ...TaskColumn_tasks @arguments(meetingId: $meetingId)
      status
      sortOrder
    }
  `,
  teams: graphql`
    fragment TaskColumns_teams on Team @relay(plural: true) {
      ...TaskColumn_teams
    }
  `
})
