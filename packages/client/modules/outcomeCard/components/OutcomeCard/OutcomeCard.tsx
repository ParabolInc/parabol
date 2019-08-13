import React, {RefObject} from 'react'
import {createFragmentContainer} from 'react-relay'
import TaskEditor from '../../../../components/TaskEditor/TaskEditor'
import TaskIntegrationLink from '../../../../components/TaskIntegrationLink'
import TaskWatermark from '../../../../components/TaskWatermark'
import EditingStatusContainer from '../../../../containers/EditingStatus/EditingStatusContainer'
import TaskFooter from '../OutcomeCardFooter/TaskFooter'
import OutcomeCardStatusIndicator from '../OutcomeCardStatusIndicator/OutcomeCardStatusIndicator'
import labels from '../../../../styles/theme/labels'
import ui from '../../../../styles/ui'
import {cardFocusShadow, cardHoverShadow, cardShadow} from '../../../../styles/elevation'
import isTaskArchived from '../../../../utils/isTaskArchived'
import isTaskPrivate from '../../../../utils/isTaskPrivate'
import isTempId from '../../../../utils/relay/isTempId'
import cardRootStyles from '../../../../styles/helpers/cardRootStyles'
import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {AreaEnum, TaskServiceEnum} from '../../../../types/graphql'
import {EditorState} from 'draft-js'
import {OutcomeCard_task} from '__generated__/OutcomeCard_task.graphql'
import {UseTaskChild} from '../../../../hooks/useTaskChildFocus'

const RootCard = styled('div')<{isTaskHovered: boolean, isTaskFocused: boolean, hasDragStyles: boolean}>(({isTaskHovered, isTaskFocused, hasDragStyles}) => ({
  ...cardRootStyles,
  borderTop: 0,
  outline: 'none',
  padding: `${ui.cardPaddingBase} 0 0`,
  transition: `box-shadow 100ms ease-in`,
  // hover before focus, it matters
  boxShadow: hasDragStyles
    ? 'none'
    : isTaskFocused
      ? cardFocusShadow
      : isTaskHovered
        ? cardHoverShadow
        : cardShadow
}))

const ContentBlock = styled('div')({
  position: 'relative'
})

const CardTopMeta = styled('div')({
  paddingBottom: '.5rem'
})

const StatusIndicatorBlock = styled('div')({
  display: 'flex',
  paddingLeft: ui.cardPaddingBase
})

interface Props {
  area: AreaEnum
  isTaskFocused: boolean
  isTaskHovered: boolean
  editorRef: RefObject<HTMLTextAreaElement>
  editorState: EditorState
  isAgenda: boolean
  isDragging: boolean
  hasDragStyles: boolean
  task: OutcomeCard_task
  setEditorState: (newEditorState: EditorState) => void
  useTaskChild: UseTaskChild
}

const OutcomeCard = (props: Props) => {
  const {
    area,
    isTaskFocused,
    isTaskHovered,
    editorRef,
    editorState,
    isAgenda,
    isDragging,
    hasDragStyles,
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
    <RootCard isTaskHovered={isTaskHovered} isTaskFocused={isTaskFocused} hasDragStyles={hasDragStyles}>
      <TaskWatermark service={service} />
      <ContentBlock>
        <CardTopMeta>
          <StatusIndicatorBlock title={statusIndicatorTitle}>
            <OutcomeCardStatusIndicator status={status} />
            {isPrivate && <OutcomeCardStatusIndicator status='private' />}
            {isArchived && <OutcomeCardStatusIndicator status='archived' />}
          </StatusIndicatorBlock>
          <EditingStatusContainer
            isTaskHovered={isTaskHovered}
            task={task}
            useTaskChild={useTaskChild}
          />
        </CardTopMeta>
        <TaskEditor
          editorRef={editorRef}
          editorState={editorState}
          readOnly={Boolean(isTempId(taskId) || isArchived || isDragging || service)}
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
}

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
      ...EditingStatusContainer_task
      ...TaskFooter_task
    }
  `
})
