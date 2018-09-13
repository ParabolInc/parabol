import {MeetingAgendaItems_viewer} from '__generated__/MeetingAgendaItems_viewer.graphql'
import React, {Component} from 'react'
import withHotkey from 'react-hotkey-hoc'
import {RouteComponentProps, withRouter} from 'react-router'
import CreateCard from 'universal/components/CreateCard/CreateCard'
import MasonryCSSGrid from 'universal/components/MasonryCSSGrid'
import NullableTask from 'universal/components/NullableTask/NullableTask'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import sortOrderBetween from 'universal/dnd/sortOrderBetween'
import CreateTaskMutation from 'universal/mutations/CreateTaskMutation'
import {meetingGridMinWidth} from 'universal/styles/meeting'
import {ACTIVE, MEETING} from 'universal/utils/constants'

const MAX_COLS = 4
const makePlaceholders = (length, setItemRef) => {
  const emptyCardCount = MAX_COLS - (length % MAX_COLS + 1)
  /* eslint-disable react/no-array-index-key */
  return new Array(emptyCardCount).fill(undefined).map((_, idx) => (
    <div key={`CreateCardPlaceholder${idx}`} ref={setItemRef(idx)}>
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
  componentWillMount () {
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

  render () {
    const {
      atmosphere: {userId},
      showPlaceholders
    } = this.props
    const tasks = this.props.tasks || []
    return (
      <MasonryCSSGrid gap={16} colWidth={meetingGridMinWidth} maxCols={MAX_COLS}>
        {(setItemRef) => {
          return (
            <React.Fragment>
              {tasks.map((task) => {
                return (
                  <div key={task.id} ref={setItemRef(task.id)}>
                    <NullableTask
                      area={MEETING}
                      handleAddTask={this.handleAddTask}
                      isAgenda
                      myUserId={userId}
                      task={task}
                    />
                  </div>
                )
              })}
              <div ref={setItemRef('createACard')}>
                <CreateCard handleAddTask={this.handleAddTask()} hasControls />
              </div>
              {showPlaceholders && makePlaceholders(tasks.length, setItemRef)}
            </React.Fragment>
          )
        }}
      </MasonryCSSGrid>
    )
  }
}

export default withHotkey(withRouter(withAtmosphere(MeetingAgendaCards)))
