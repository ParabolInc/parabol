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

const makePlaceholders = (
  length: number,
  maxCols: number,
  setItemRef: MasonryCSSGrid['setItemRef']
) => {
  const emptyCardCount = maxCols - (length % maxCols + 1)
  return new Array(emptyCardCount).fill(undefined).map((_, idx) => (
    <div key={`CreateCardPlaceholder${idx}`} ref={setItemRef(String(idx))}>
      <CreateCard />
    </div>
  ))
}

interface Props extends WithAtmosphereProps, RouteComponentProps<{}> {
  agendaId?: string
  bindHotkey: (key: string, cb: () => void) => void
  maxCols?: number
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
      maxCols,
      showPlaceholders
    } = this.props
    const tasks = this.props.tasks || []
    return (
      <MasonryCSSGrid gap={16} colWidth={meetingGridMinWidth} maxCols={maxCols}>
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
              {showPlaceholders && maxCols && makePlaceholders(tasks.length, maxCols, setItemRef)}
            </React.Fragment>
          )
        }}
      </MasonryCSSGrid>
    )
  }
}

export default withHotkey(withRouter(withAtmosphere(MeetingAgendaCards)))
