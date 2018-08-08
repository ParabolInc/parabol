// @flow
import React, {Component} from 'react'
import withHotkey from 'react-hotkey-hoc'
import {withRouter} from 'react-router'
import CreateCard from 'universal/components/CreateCard/CreateCard'
import NullableTask from 'universal/components/NullableTask/NullableTask'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import sortOrderBetween from 'universal/dnd/sortOrderBetween'
import CreateTaskMutation from 'universal/mutations/CreateTaskMutation'
import {ACTIVE, MEETING} from 'universal/utils/constants'
import type {Task} from 'universal/types/schema.flow'
import styled from 'react-emotion'

const TaskCardGrid = styled('div')({
  display: 'grid',
  gridGap: '1.25rem',
  gridTemplateColumns: 'repeat(auto-fill, minmax(225px, 1fr))',
  maxWidth: '75rem',
  margin: '0 auto',
  width: '100%'
})

const makeCards = (tasks = [], myUserId, handleAddTask) => {
  return tasks.map((task) => {
    const {id: taskId} = task
    return (
      <div key={taskId}>
        <NullableTask
          area={MEETING}
          handleAddTask={handleAddTask}
          isAgenda
          myUserId={myUserId}
          task={task}
        />
      </div>
    )
  })
}

// const makePlaceholders = (length) => {
//   const rowLength = 4
//   const emptyCardCount = rowLength - (length % rowLength + 1)
//   /* eslint-disable react/no-array-index-key */
//   return new Array(emptyCardCount).fill(undefined).map((item, idx) => (
//     <div key={`CreateCardPlaceholder${idx}`}>
//       <CreateCard />
//     </div>
//   ))
//   /* eslint-enable */
// }

type Props = {
  agendaId?: string,
  atmosphere: Object, // TODO: atmosphere type
  bindHotkey: (key: string, cb: () => void) => void,
  history: Object,
  meetingId: string,
  reflectionGroupId?: string,
  tasks: ?Array<Task>,
  styles: Object,
  teamId: string
}

class MeetingAgendaCards extends Component<Props> {
  componentWillMount () {
    const {bindHotkey} = this.props
    bindHotkey('t', this.handleAddTask())
  }

  handleAddTask = (content) => () => {
    const {agendaId, atmosphere, meetingId, reflectionGroupId, teamId} = this.props
    const tasks = this.props.tasks || []
    const {userId} = atmosphere
    const maybeLastTask = tasks[tasks.length - 1]
    const sortOrder = sortOrderBetween(maybeLastTask, null, null, false)
    const newTask = {
      content,
      status: ACTIVE,
      sortOrder,
      agendaId,
      meetingId,
      reflectionGroupId,
      userId,
      teamId
    }
    CreateTaskMutation(atmosphere, newTask, MEETING)
  }

  render () {
    const {
      atmosphere: {userId}
    } = this.props
    const tasks = this.props.tasks || []
    return (
      <TaskCardGrid>
        {makeCards(tasks, userId, this.handleAddTask)}
        {/* Input Card */}
        {/* wrapping div to deal with flex behaviors */}
        <div>
          <CreateCard handleAddTask={this.handleAddTask()} hasControls />
        </div>
      </TaskCardGrid>
    )
  }
}
// {/* Placeholder Cards */}
// {makePlaceholders(tasks.length)}

export default withRouter(withAtmosphere(withHotkey(MeetingAgendaCards)))
