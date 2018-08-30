import React, {Component} from 'react'
import withHotkey from 'react-hotkey-hoc'
import {RouteComponentProps, withRouter} from 'react-router'
import CreateCard from 'universal/components/CreateCard/CreateCard'
import NullableTask from 'universal/components/NullableTask/NullableTask'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import sortOrderBetween from 'universal/dnd/sortOrderBetween'
import CreateTaskMutation from 'universal/mutations/CreateTaskMutation'
import {ACTIVE, MEETING} from 'universal/utils/constants'
import styled from 'react-emotion'
import {meetingGridGap, meetingGridMinWidth} from 'universal/styles/meeting'
import {MeetingAgendaItems_viewer} from '__generated__/MeetingAgendaItems_viewer.graphql'

const TaskCardGrid = styled('div')({
  display: 'grid',
  gridGap: meetingGridGap,
  gridTemplateColumns: `repeat(auto-fill, minmax(${meetingGridMinWidth}, 1fr))`,
  margin: '0 auto',
  width: '100%'
})

const makeCards = (tasks: Props['tasks'], myUserId, handleAddTask) => {
  if (!tasks) return null
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

const makePlaceholders = (length) => {
  const rowLength = 4
  const emptyCardCount = rowLength - (length % rowLength + 1)
  /* eslint-disable react/no-array-index-key */
  return new Array(emptyCardCount).fill(undefined).map((_, idx) => (
    <div key={`CreateCardPlaceholder${idx}`}>
      <CreateCard />
    </div>
  ))
  /* eslint-enable */
}

interface Props extends WithAtmosphereProps, RouteComponentProps<{}> {
  agendaId?: string
  bindHotkey: (key: string, cb: () => void) => void
  meetingId: string
  reflectionGroupId?: string
  tasks: Array<MeetingAgendaItems_viewer['tasks']['edges'][0]['node']> | null
  showPlaceholders: boolean
  teamId: string
}

class MeetingAgendaCards extends Component<Props> {
  componentWillMount() {
    const {bindHotkey} = this.props
    bindHotkey('t', this.handleAddTask())
  }

  handleAddTask = (content?: string) => () => {
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

  render() {
    const {
      atmosphere: {userId},
      showPlaceholders
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
        {/* Placeholder Cards */}
        {showPlaceholders && makePlaceholders(tasks.length)}
      </TaskCardGrid>
    )
  }
}

export default withHotkey(withRouter(withAtmosphere(MeetingAgendaCards)))
