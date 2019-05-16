import React, {useCallback, useRef} from 'react'
import CreateCard from 'universal/components/CreateCard/CreateCard'
import MasonryCSSGrid from 'universal/components/MasonryCSSGrid'
import NullableTask from 'universal/components/NullableTask/NullableTask'
import sortOrderBetween from 'universal/dnd/sortOrderBetween'
import CreateTaskMutation from 'universal/mutations/CreateTaskMutation'
import {meetingGridMinWidth} from 'universal/styles/meeting'
import {ACTIVE, MEETING} from 'universal/utils/constants'
import useHotkey from 'universal/hooks/useHotkey'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import {createFragmentContainer, graphql} from 'react-relay'
import {MeetingAgendaCards_tasks} from '__generated__/MeetingAgendaCards_tasks.graphql'

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
  const {maxCols, showPlaceholders, tasks} = props
  const atmosphere = useAtmosphere()
  const propsRef = useRef(props)
  propsRef.current = props
  const handleAddTask = useCallback(() => {
    const {viewerId} = atmosphere
    const {tasks, agendaId, meetingId, reflectionGroupId, teamId} = propsRef.current
    const maybeLastTask = tasks[tasks.length - 1]
    const newTask = {
      status: ACTIVE,
      sortOrder: sortOrderBetween(maybeLastTask, null, null, false) || 0,
      agendaId,
      meetingId,
      reflectionGroupId,
      userId: viewerId,
      teamId
    }
    CreateTaskMutation(atmosphere, newTask, MEETING)
  }, [])
  useHotkey('t', handleAddTask)
  return (
    <MasonryCSSGrid gap={16} colWidth={meetingGridMinWidth} maxCols={maxCols} items={tasks}>
      {(setItemRef) => {
        return (
          <React.Fragment>
            {tasks.map((task) => {
              return (
                <div key={task.id} ref={setItemRef(task.id)}>
                  <NullableTask area={MEETING} isAgenda task={task} />
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

export default createFragmentContainer(
  MeetingAgendaCards,
  graphql`
    fragment MeetingAgendaCards_tasks on Task @relay(plural: true) {
      ...NullableTask_task
      id
    }
  `
)
