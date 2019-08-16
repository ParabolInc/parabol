import React, {useRef} from 'react'
import CreateCard from '../../../../components/CreateCard/CreateCard'
import MasonryCSSGrid from '../../../../components/MasonryCSSGrid'
import NullableTask from '../../../../components/NullableTask/NullableTask'
import sortOrderBetween from '../../../../dnd/sortOrderBetween'
import CreateTaskMutation from '../../../../mutations/CreateTaskMutation'
import {meetingGridMinWidth} from '../../../../styles/meeting'
import useHotkey from '../../../../hooks/useHotkey'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {MeetingAgendaCards_tasks} from '../../../../__generated__/MeetingAgendaCards_tasks.graphql'
import {AreaEnum, TaskStatusEnum} from '../../../../types/graphql'
import useEventCallback from '../../../../hooks/useEventCallback'

const makePlaceholders = (
  length: number,
  maxCols: number,
  setItemRef: MasonryCSSGrid['setItemRef']
) => {
  const emptyCardCount = maxCols - ((length % maxCols) + 1)
  return new Array(emptyCardCount).fill(undefined).map((_, idx) => (
    <div key={`CreateCardPlaceholder${idx}`} ref={setItemRef(String(idx))}>
      <CreateCard />
    </div>
  ))
}

interface Props {
  agendaId?: string
  maxCols?: number
  meetingId: string
  reflectionGroupId?: string
  tasks: MeetingAgendaCards_tasks
  showPlaceholders?: boolean
  teamId: string
}

const MeetingAgendaCards = (props: Props) => {
  const {maxCols, showPlaceholders, tasks, agendaId, meetingId, reflectionGroupId, teamId} = props
  const atmosphere = useAtmosphere()
  const handleAddTask = useEventCallback(() => {
    const {viewerId} = atmosphere
    const maybeLastTask = tasks[tasks.length - 1]
    const newTask = {
      status: TaskStatusEnum.active,
      sortOrder: sortOrderBetween(maybeLastTask, null, null, false) || 0,
      agendaId,
      meetingId,
      reflectionGroupId,
      userId: viewerId,
      teamId
    }
    CreateTaskMutation(atmosphere, {newTask})
  })
  useHotkey('t', handleAddTask)
  return (
    <MasonryCSSGrid gap={16} colWidth={meetingGridMinWidth} maxCols={maxCols} items={tasks}>
      {(setItemRef) => {
        return (
          <React.Fragment>
            {tasks.map((task) => {
              return (
                <div key={task.id} ref={setItemRef(task.id)}>
                  <NullableTask area={AreaEnum.meeting} isAgenda task={task} />
                </div>
              )
            })}
            <div ref={setItemRef('createACard')}>
              <CreateCard handleAddTask={handleAddTask} hasControls />
            </div>
            {showPlaceholders && maxCols && makePlaceholders(tasks.length, maxCols, setItemRef)}
          </React.Fragment>
        )
      }}
    </MasonryCSSGrid>
  )
}

export default createFragmentContainer(MeetingAgendaCards, {
  tasks: graphql`
    fragment MeetingAgendaCards_tasks on Task @relay(plural: true) {
      ...NullableTask_task
      id
      sortOrder
    }
  `
})
