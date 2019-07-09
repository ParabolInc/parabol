import PropTypes from 'prop-types'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import TaskEditor from 'universal/components/TaskEditor/TaskEditor'
import TaskIntegrationLink from 'universal/components/TaskIntegrationLink'
import TaskWatermark from 'universal/components/TaskWatermark'
import EditingStatusContainer from 'universal/containers/EditingStatus/EditingStatusContainer'
import TaskFooter from 'universal/modules/outcomeCard/components/OutcomeCardFooter/TaskFooter'
import OutcomeCardStatusIndicator from 'universal/modules/outcomeCard/components/OutcomeCardStatusIndicator/OutcomeCardStatusIndicator'
import labels from 'universal/styles/theme/labels'
import ui from 'universal/styles/ui'
import {cardHoverShadow, cardFocusShadow, cardShadow} from 'universal/styles/elevation'
import isTaskArchived from 'universal/utils/isTaskArchived'
import isTaskPrivate from 'universal/utils/isTaskPrivate'
import isTempId from 'universal/utils/relay/isTempId'
import cardRootStyles from 'universal/styles/helpers/cardRootStyles'
import styled from 'react-emotion'

const RootCard = styled('div')(({cardHasHover, cardHasFocus, hasDragStyles}) => ({
  ...cardRootStyles,
  borderTop: 0,
  outline: 'none',
  padding: `${ui.cardPaddingBase} 0 0`,
  transition: `box-shadow 100ms ease-in`,
  // hover before focus, it matters
  boxShadow: hasDragStyles
    ? 'none'
    : cardHasFocus
      ? cardFocusShadow
      : cardHasHover
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

const OutcomeCard = (props) => {
  const {
    area,
    cardHasFocus,
    cardHasHover,
    cardHasMenuOpen,
    editorRef,
    editorState,
    isAgenda,
    isDragging,
    isEditing,
    hasDragStyles,
    task,
    setEditorRef,
    setEditorState,
    trackEditingComponent,
    toggleMenuState
  } = props
  const isPrivate = isTaskPrivate(task.tags)
  const isArchived = isTaskArchived(task.tags)
  const {status, team} = task
  const {teamId} = team
  const {integration, taskId} = task
  const {service} = integration || {}
  const statusTitle = `Card status: ${labels.taskStatus[status].label}`
  const privateTitle = ', marked as #private'
  const archivedTitle = ', set as #archived'
  const statusIndicatorTitle = `${statusTitle}${isPrivate ? privateTitle : ''}${
    isArchived ? archivedTitle : ''
  }`
  const cardIsActive = cardHasFocus || cardHasHover || cardHasMenuOpen
  return (
    <RootCard cardHasHover={cardHasHover} cardHasFocus={cardHasFocus} hasDragStyles={hasDragStyles}>
      <TaskWatermark service={service} />
      <ContentBlock>
        <CardTopMeta>
          <StatusIndicatorBlock title={statusIndicatorTitle}>
            <OutcomeCardStatusIndicator status={status} />
            {isPrivate && <OutcomeCardStatusIndicator status='private' />}
            {isArchived && <OutcomeCardStatusIndicator status='archived' />}
          </StatusIndicatorBlock>
          <EditingStatusContainer
            cardIsActive={cardIsActive}
            isEditing={isEditing}
            task={task}
            toggleMenuState={toggleMenuState}
          />
        </CardTopMeta>
        <TaskEditor
          editorRef={editorRef}
          editorState={editorState}
          readOnly={Boolean(isTempId(taskId) || isArchived || isDragging || service)}
          setEditorRef={setEditorRef}
          setEditorState={setEditorState}
          trackEditingComponent={trackEditingComponent}
          teamId={teamId}
          team={team}
        />
        <TaskIntegrationLink integration={integration || null} />
        <TaskFooter
          area={area}
          cardIsActive={cardIsActive}
          editorState={editorState}
          isAgenda={isAgenda}
          isPrivate={isPrivate}
          task={task}
          toggleMenuState={toggleMenuState}
        />
      </ContentBlock>
    </RootCard>
  )
}

OutcomeCard.propTypes = {
  area: PropTypes.string,
  editorRef: PropTypes.any,
  editorState: PropTypes.object,
  cardHasHover: PropTypes.bool,
  cardHasFocus: PropTypes.bool,
  cardHasMenuOpen: PropTypes.bool,
  cardHasIntegration: PropTypes.bool,
  hasDragStyles: PropTypes.bool,
  isAgenda: PropTypes.bool,
  isDragging: PropTypes.bool,
  isEditing: PropTypes.bool,
  task: PropTypes.object.isRequired,
  setEditorRef: PropTypes.func.isRequired,
  setEditorState: PropTypes.func,
  trackEditingComponent: PropTypes.func,
  teamMembers: PropTypes.array,
  toggleMenuState: PropTypes.func.isRequired
}

export default createFragmentContainer(
  OutcomeCard,
  graphql`
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
)
