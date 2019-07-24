import {TaskFooter_task} from '../../../../__generated__/TaskFooter_task.graphql'
import {EditorState} from 'draft-js'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer, graphql} from 'react-relay'
import CardButton from '../../../../components/CardButton'
import IconLabel from '../../../../components/IconLabel'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import TaskFooterIntegrateToggle from './TaskFooterIntegrateToggle'
import TaskFooterTagMenuToggle from './TaskFooterTagMenuToggle'
import TaskFooterTeamAssignee from './TaskFooterTeamAssignee'
import TaskFooterUserAssignee from './TaskFooterUserAssignee'
import OutcomeCardMessage from '../OutcomeCardMessage/OutcomeCardMessage'
import {USER_DASH} from '../../../../utils/constants'
import removeContentTag from '../../../../utils/draftjs/removeContentTag'
import isTaskArchived from '../../../../utils/isTaskArchived'
import withMutationProps, {WithMutationProps} from '../../../../utils/relay/withMutationProps'
import {AreaEnum} from '../../../../types/graphql'

const Footer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  maxWidth: '100%',
  padding: `12px 15px 15px`
})

const ButtonGroup = styled('div')<{cardIsActive: boolean}>(({cardIsActive}) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  opacity: cardIsActive ? 1 : 0
}))

// ButtonSpacer helps truncated names (…) be consistent
const ButtonSpacer = styled('div')({
  display: 'inline-block',
  height: 24,
  verticalAlign: 'middle',
  width: 24
})

const AvatarBlock = styled('div')({
  flex: 1,
  height: 24,
  minWidth: 0
})

interface Props extends WithMutationProps {
  area: AreaEnum
  cardIsActive: boolean
  editorState: EditorState
  isAgenda: boolean
  task: TaskFooter_task
  toggleMenuState: () => void
}

const TaskFooter = (props: Props) => {
  const {
    area,
    cardIsActive,
    editorState,
    error,
    isAgenda,
    onCompleted,
    onError,
    submitMutation,
    submitting,
    task,
    toggleMenuState
  } = props
  const mutationProps = {onError, onCompleted, submitMutation, submitting}
  const atmosphere = useAtmosphere()
  const showTeam = area === USER_DASH
  const {content, id: taskId, integration, tags} = task
  const isArchived = isTaskArchived(tags)
  const canAssign = !integration && !isArchived
  return (
    <React.Fragment>
      <Footer>
        <AvatarBlock>
          {showTeam ? (
            <TaskFooterTeamAssignee
              canAssign={canAssign}
              task={task}
              toggleMenuState={toggleMenuState}
            />
          ) : (
            <TaskFooterUserAssignee
              area={area}
              canAssign={canAssign}
              cardIsActive={cardIsActive}
              task={task}
              toggleMenuState={toggleMenuState}
            />
          )}
        </AvatarBlock>
        <ButtonGroup cardIsActive={cardIsActive}>
          {integration || isArchived ? (
            <ButtonSpacer />
          ) : (
            <TaskFooterIntegrateToggle
              mutationProps={mutationProps}
              task={task}
              toggleMenuState={toggleMenuState}
            />
          )}
          {isArchived ? (
            <CardButton
              onClick={() => removeContentTag('archived', atmosphere, taskId, content, area)}
            >
              <IconLabel icon='reply' />
            </CardButton>
          ) : (
            <TaskFooterTagMenuToggle
              area={area}
              editorState={editorState}
              isAgenda={isAgenda}
              task={task}
              toggleMenuState={toggleMenuState}
              mutationProps={mutationProps}
            />
          )}
        </ButtonGroup>
      </Footer>
      {error && <OutcomeCardMessage onClose={() => onError()} message={error} />}
    </React.Fragment>
  )
}

export default createFragmentContainer(withMutationProps(TaskFooter), {
  task: graphql`
    fragment TaskFooter_task on Task {
      id
      content
      integration {
        service
      }
      tags
      team {
        id
      }
      ...TaskFooterTeamAssignee_task
      ...TaskFooterUserAssignee_task
      ...TaskFooterTagMenu_task
      ...TaskFooterIntegrateMenuRoot_task
    }
  `
})
