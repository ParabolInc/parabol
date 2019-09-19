import React, {Component} from 'react'
import styled from '@emotion/styled'
import withAtmosphere, {WithAtmosphereProps} from '../../../../decorators/withAtmosphere/withAtmosphere'
import TaskColumnAddTask from './TaskColumnAddTask'
import {AreaEnum, TaskStatusEnum} from '../../../../types/graphql'
import {TEAM_DASH, USER_DASH} from '../../../../utils/constants'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {TaskColumn_tasks} from '../../../../__generated__/TaskColumn_tasks.graphql'
import {BezierCurve, DroppableType} from '../../../../types/constEnums'
import {Droppable, DroppableProvided, DroppableStateSnapshot} from 'react-beautiful-dnd'
import {PALETTE} from '../../../../styles/paletteV2'
import TaskColumnInner from './TaskColumnInner'
import taskStatusLabels from '../../../../utils/taskStatusLabels'

const Column = styled('div')<{isDragging: boolean}>(({isDragging}) => ({
    background: isDragging ? PALETTE.BACKGROUND_MAIN_DARKENED : undefined,
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    position: 'relative',
    transition: `background 300ms ${BezierCurve.DECELERATE}`,
}))

const ColumnHeader = styled('div')({
  color: PALETTE.TEXT_MAIN,
  display: 'flex !important',
  lineHeight: '24px',
  padding: 12,
  position: 'relative'
})

const ColumnBody = styled('div')({
  flex: 1,
  height: '100%',
  overflowX: 'hidden',
  overflowY: 'auto',
  minHeight: 200,
  paddingBottom: 8
})

const StatusLabel = styled('div')({
  fontWeight: 600,
  textTransform: 'capitalize'
})

const TasksCount = styled('div')({
  color: PALETTE.TEXT_MAIN_40A,
  marginLeft: 8
})

const StatusLabelBlock = styled('div')<{userCanAdd: boolean | undefined}>(({userCanAdd}) => ({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  fontSize: 16,
  marginLeft: userCanAdd ? 8 : 16
}))

interface Props extends WithAtmosphereProps {
  area: AreaEnum
  isMyMeetingSection?: boolean
  meetingId?: string
  myTeamMemberId?: string
  tasks: TaskColumn_tasks
  status: TaskStatusEnum
  teamMemberFilterId?: string
  teams: any[]
}

class TaskColumn extends Component<Props> {
  render () {
    const {
      area,
      isMyMeetingSection,
      meetingId,
      myTeamMemberId,
      teamMemberFilterId,
      status,
      tasks,
      teams
    } = this.props
    const label = taskStatusLabels[status]
    const userCanAdd = area === TEAM_DASH || area === USER_DASH || isMyMeetingSection
    return (
      <Droppable
        droppableId={status}
        type={DroppableType.TASK}
      >
        {(
          dropProvided: DroppableProvided,
          dropSnapshot: DroppableStateSnapshot
        ) => (
          <Column isDragging={dropSnapshot.isDraggingOver}>
            <ColumnHeader>
              <TaskColumnAddTask
                area={area}
                isMyMeetingSection={isMyMeetingSection}
                status={status}
                tasks={tasks}
                meetingId={meetingId}
                myTeamMemberId={myTeamMemberId}
                teamMemberFilterId={teamMemberFilterId || ''}
                teams={teams}
              />
              <StatusLabelBlock userCanAdd={userCanAdd}>
                <StatusLabel>{label}</StatusLabel>
                {tasks.length > 0 && <TasksCount>{tasks.length}</TasksCount>}
              </StatusLabelBlock>
            </ColumnHeader>
            <ColumnBody {...dropProvided.droppableProps} ref={dropProvided.innerRef}>
              <TaskColumnInner area={area} tasks={tasks}/>
              {dropProvided.placeholder}
            </ColumnBody>
          </Column>
        )}
      </Droppable>
    )
  }
}

export default createFragmentContainer(withAtmosphere(TaskColumn), {
  tasks: graphql`
    fragment TaskColumn_tasks on Task @relay(plural: true) {
      ...TaskColumnAddTask_tasks
      ...TaskColumnInner_tasks
      id
    }
  `
})
