import React, {useMemo} from 'react'
import styled from '@emotion/styled'
import EditorHelpModalContainer from '../../containers/EditorHelpModalContainer/EditorHelpModalContainer'
import TaskColumn from '../../modules/teamDashboard/components/TaskColumn/TaskColumn'
import ui from '../../styles/ui'
import {AreaEnum} from '../../types/graphql'
import {columnArray, MEETING, meetingColumnArray, SORT_STEP} from '../../utils/constants'
import makeTasksByStatus from '../../utils/makeTasksByStatus'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {TaskColumns_tasks} from '../../__generated__/TaskColumns_tasks.graphql'
import {DragDropContext, DropResult} from 'react-beautiful-dnd'
import useEventCallback from '../../hooks/useEventCallback'
import dndNoise from '../../utils/dndNoise'
import useAtmosphere from '../../hooks/useAtmosphere'
import UpdateTaskMutation from '../../mutations/UpdateTaskMutation'

const RootBlock = styled('div')({
  display: 'flex',
  flex: '1',
  height: '100%',
  width: '100%'
})

const ColumnsBlock = styled('div')({
  display: 'flex',
  flex: '1',
  height: '100%',
  margin: '0 auto',
  maxWidth: ui.taskColumnsMaxWidth,
  minWidth: ui.taskColumnsMinWidth,
  padding: `0 ${ui.taskColumnPaddingInnerSmall}`,
  width: '100%',

  [ui.dashBreakpoint]: {
    paddingLeft: ui.taskColumnPaddingInnerLarge,
    paddingRight: ui.taskColumnPaddingInnerLarge
  }
})

interface Props {
  area: AreaEnum
  isMyMeetingSection?: boolean
  meetingId?: string
  myTeamMemberId?: string
  tasks: TaskColumns_tasks
  teamMemberFilterId?: string
  teams?: any
}

const TaskColumns = (props: Props) => {
  const {
    area,
    isMyMeetingSection,
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

  const onDragEnd = useEventCallback(
    (result: DropResult) => {
      const {source, destination, draggableId} = result
      if (!destination) return
      const isSameColumn = destination.droppableId === source.droppableId
      if (isSameColumn && destination.index === source.index) return
      const destinationTasks = groupedTasks[destination.droppableId]

      let sortOrder
      if (destination.index === 0) {
        const firstTask = destinationTasks[0]
        sortOrder = (firstTask ? firstTask.sortOrder + SORT_STEP : 0) + dndNoise()
      } else if (isSameColumn && destination.index === destinationTasks.length -1 || !isSameColumn && destination.index === destinationTasks.length) {
        sortOrder = destinationTasks[destinationTasks.length - 1].sortOrder - SORT_STEP + dndNoise()
      } else {
        const offset = !isSameColumn || source.index > destination.index ? -1 : 1
        sortOrder =
          (destinationTasks[destination.index + offset].sortOrder + destinationTasks[destination.index].sortOrder) / 2 +
          dndNoise()
      }
      const updatedTask = {id: draggableId, sortOrder}
      if (!isSameColumn) {
        (updatedTask as any).status = destination.droppableId
      }
      UpdateTaskMutation(atmosphere, {updatedTask, area})
    })
  return (
    <RootBlock>
      <DragDropContext onDragEnd={onDragEnd}>
        <ColumnsBlock>
          {lanes.map((status) => (
            <TaskColumn
              key={status}
              area={area}
              isMyMeetingSection={isMyMeetingSection}
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
    </RootBlock>
  )
}

export default createFragmentContainer(TaskColumns, {
  tasks: graphql`
    fragment TaskColumns_tasks on Task @relay(plural: true) {
      ...TaskColumn_tasks
      status
      sortOrder
    }
  `
})
