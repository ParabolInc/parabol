import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {EditorState} from 'draft-js'
import React, {memo, RefObject} from 'react'
import {useFragment} from 'react-relay'
import EditingStatus from '~/components/EditingStatus/EditingStatus'
import {PALETTE} from '~/styles/paletteV3'
import {OutcomeCard_task$key} from '~/__generated__/OutcomeCard_task.graphql'
import {AreaEnum, TaskStatusEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import IntegratedTaskContent from '../../../../components/IntegratedTaskContent'
import TaskEditor from '../../../../components/TaskEditor/TaskEditor'
import TaskIntegrationLink from '../../../../components/TaskIntegrationLink'
import TaskWatermark from '../../../../components/TaskWatermark'
import useTaskChildFocus, {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
import {cardFocusShadow, cardHoverShadow, cardShadow, Elevation} from '../../../../styles/elevation'
import cardRootStyles from '../../../../styles/helpers/cardRootStyles'
import {Card} from '../../../../types/constEnums'
import isTaskArchived from '../../../../utils/isTaskArchived'
import isTaskPrivate from '../../../../utils/isTaskPrivate'
import isTempId from '../../../../utils/relay/isTempId'
import {taskStatusLabels} from '../../../../utils/taskStatus'
import TaskFooter from '../OutcomeCardFooter/TaskFooter'
import OutcomeCardStatusIndicator from '../OutcomeCardStatusIndicator/OutcomeCardStatusIndicator'

const RootCard = styled('div')<{
  isTaskHovered: boolean
  isTaskFocused: boolean
  isDragging: boolean
  isTaskHighlighted: boolean
}>(({isTaskHovered, isTaskFocused, isDragging, isTaskHighlighted}) => ({
  ...cardRootStyles,
  borderTop: 0,
  outline: isTaskHighlighted ? `2px solid ${PALETTE.SKY_300}` : 'none',
  padding: `${Card.PADDING} 0 0`,
  transition: `box-shadow 100ms ease-in`,
  // hover before focus, it matters
  boxShadow: isDragging
    ? Elevation.CARD_DRAGGING
    : isTaskHighlighted
    ? cardHoverShadow
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

const TaskEditorWrapper = styled('div')()

interface Props {
  area: AreaEnum
  isTaskFocused: boolean
  isTaskHovered: boolean
  editorRef: RefObject<HTMLTextAreaElement>
  editorState: EditorState
  handleCardUpdate: () => void
  isAgenda: boolean
  isDraggingOver: TaskStatusEnum | undefined
  task: OutcomeCard_task$key
  setEditorState: (newEditorState: EditorState) => void
  useTaskChild: UseTaskChild
  dataCy: string
}

const OutcomeCard = memo((props: Props) => {
  const {
    area,
    isTaskFocused,
    isTaskHovered,
    editorRef,
    editorState,
    handleCardUpdate,
    isAgenda,
    isDraggingOver,
    task: taskRef,
    setEditorState,
    useTaskChild,
    dataCy
  } = props
  const task = useFragment(
    graphql`
      fragment OutcomeCard_task on Task @argumentDefinitions(meetingId: {type: "ID"}) {
        ...IntegratedTaskContent_task
        id
        integration {
          __typename
          ...TaskIntegrationLink_integration
        }
        status
        tags
        team {
          id
        }
        # grab userId to ensure sorting on connections works
        userId
        isHighlighted(meetingId: $meetingId)
        ...EditingStatus_task
        ...TaskFooter_task
      }
    `,
    taskRef
  )
  const isPrivate = isTaskPrivate(task.tags)
  const isArchived = isTaskArchived(task.tags)
  const {integration, status, id: taskId, team, isHighlighted} = task
  const {addTaskChild, removeTaskChild} = useTaskChildFocus(taskId)
  const {id: teamId} = team
  const type = integration?.__typename
  const statusTitle = `Card status: ${taskStatusLabels[status]}`
  const privateTitle = ', marked as #private'
  const archivedTitle = ', set as #archived'
  const statusIndicatorTitle = `${statusTitle}${isPrivate ? privateTitle : ''}${
    isArchived ? archivedTitle : ''
  }`
  return (
    <RootCard
      isTaskHovered={isTaskHovered}
      isTaskFocused={isTaskFocused}
      isDragging={!!isDraggingOver}
      isTaskHighlighted={!!isHighlighted}
    >
      <TaskWatermark type={type} />
      <ContentBlock>
        <EditingStatus
          isTaskHovered={isTaskHovered}
          isArchived={isArchived}
          task={task}
          useTaskChild={useTaskChild}
        >
          <StatusIndicatorBlock data-cy={`${dataCy}-status`} title={statusIndicatorTitle}>
            <OutcomeCardStatusIndicator status={isDraggingOver || status} />
            {isPrivate && <OutcomeCardStatusIndicator status='private' />}
            {isArchived && <OutcomeCardStatusIndicator status='archived' />}
          </StatusIndicatorBlock>
        </EditingStatus>
        <IntegratedTaskContent task={task} />
        {!type && (
          <TaskEditorWrapper
            onBlur={() => {
              removeTaskChild('root')
              setTimeout(handleCardUpdate)
            }}
            onFocus={() => addTaskChild('root')}
          >
            <TaskEditor
              dataCy={`${dataCy}`}
              editorRef={editorRef}
              editorState={editorState}
              readOnly={Boolean(isTempId(taskId) || isArchived || isDraggingOver || type)}
              setEditorState={setEditorState}
              teamId={teamId}
              useTaskChild={useTaskChild}
            />
          </TaskEditorWrapper>
        )}
        <TaskIntegrationLink dataCy={`${dataCy}`} integration={integration || null} />
        <TaskFooter
          dataCy={`${dataCy}`}
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

export default OutcomeCard
