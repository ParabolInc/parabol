import React, {memo, RefObject} from 'react'
import {createFragmentContainer} from 'react-relay'
import TaskEditor from '../../../../components/TaskEditor/TaskEditor'
import TaskIntegrationLink from '../../../../components/TaskIntegrationLink'
import TaskWatermark from '../../../../components/TaskWatermark'
import TaskFooter from '../OutcomeCardFooter/TaskFooter'
import OutcomeCardStatusIndicator from '../OutcomeCardStatusIndicator/OutcomeCardStatusIndicator'
import labels from '../../../../styles/theme/labels'
import {Cards} from '../../../../types/constEnums'
import {cardFocusShadow, cardHoverShadow, cardShadow, Elevation} from '../../../../styles/elevation'
import isTaskArchived from '../../../../utils/isTaskArchived'
import isTaskPrivate from '../../../../utils/isTaskPrivate'
import isTempId from '../../../../utils/relay/isTempId'
import cardRootStyles from '../../../../styles/helpers/cardRootStyles'
import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {AreaEnum, TaskServiceEnum, TaskStatusEnum} from '../../../../types/graphql'
import {EditorState} from 'draft-js'
import {OutcomeCard_task} from '__generated__/OutcomeCard_task.graphql'
import {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
import EditingStatus from 'components/EditingStatus/EditingStatus'

const RootCard = styled('div')<{isTaskHovered: boolean, isTaskFocused: boolean, isDragging: boolean}>(({isTaskHovered, isTaskFocused, isDragging}) => ({
  ...cardRootStyles,
  borderTop: 0,
  outline: 'none',
  padding: `${Cards.PADDING} 0 0`,
  transition: `box-shadow 100ms ease-in`,
  // hover before focus, it matters
  boxShadow: isDragging
    ? Elevation.CARD_DRAGGING
    : isTaskFocused
      ? cardFocusShadow
      : isTaskHovered
        ? cardHoverShadow
        : cardShadow
}))

const ContentBlock = styled('div')({
  position: 'relative'
})

const StatusIndicatorBlock = styled('div')({
  display: 'flex'
})

interface Props {
  area: AreaEnum
  isTaskFocused: boolean
  isTaskHovered: boolean
  editorRef: RefObject<HTMLTextAreaElement>
  editorState: EditorState
  isAgenda: boolean
  isDraggingOver: TaskStatusEnum | undefined
  task: OutcomeCard_task
  setEditorState: (newEditorState: EditorState) => void
  useTaskChild: UseTaskChild
}

const OutcomeCard = memo((props: Props) => {
  const {
    area,
    isTaskFocused,
    isTaskHovered,
    editorRef,
    editorState,
    isAgenda,
    isDraggingOver,
    task,
    setEditorState,
    useTaskChild
  } = props
  const isPrivate = isTaskPrivate(task.tags)
  const isArchived = isTaskArchived(task.tags)
  const {status, team} = task
  const {teamId} = team
  const {integration, taskId} = task
  const service = integration ? integration.service as TaskServiceEnum : undefined
  const statusTitle = `Card status: ${labels.taskStatus[status].label}`
  const privateTitle = ', marked as #private'
  const archivedTitle = ', set as #archived'
  const statusIndicatorTitle = `${statusTitle}${isPrivate ? privateTitle : ''}${
    isArchived ? archivedTitle : ''
  }`
  return (
    <RootCard isTaskHovered={isTaskHovered} isTaskFocused={isTaskFocused} isDragging={!!isDraggingOver}>
      <TaskWatermark service={service} />
      <ContentBlock>
        <EditingStatus
          isTaskHovered={isTaskHovered}
          task={task}
          useTaskChild={useTaskChild}
        >
          <StatusIndicatorBlock title={statusIndicatorTitle}>
            <OutcomeCardStatusIndicator status={isDraggingOver || status} />
            {isPrivate && <OutcomeCardStatusIndicator status='private' />}
            {isArchived && <OutcomeCardStatusIndicator status='archived' />}
          </StatusIndicatorBlock>
        </EditingStatus>
        <TaskEditor
          editorRef={editorRef}
          editorState={editorState}
          readOnly={Boolean(isTempId(taskId) || isArchived || isDraggingOver || service)}
          setEditorState={setEditorState}
          teamId={teamId}
          team={team}
          useTaskChild={useTaskChild}
        />
        <TaskIntegrationLink integration={integration || null} />
        <TaskFooter
          area={area}
          cardIsActive={isTaskFocused || isTaskHovered}
          editorState={editorState}
          isAgenda={isAgenda}
          task={task}
          useTaskChild={useTaskChild}
        />
      </ContentBlock>
    </RootCard>
  )
})

export default createFragmentContainer(OutcomeCard, {
  task: graphql`
    fragment OutcomeCard_task on Task {
      taskId: id
      integration {
        service
        ...TaskIntegrationLink_integration
      }
      status
      tags
      team {
        teamId: id
      }
      # grab userId to ensure sorting on connections works
      userId
      ...EditingStatus_task
      ...TaskFooter_task
    }
  `
})
