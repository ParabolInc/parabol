import {TaskFooter_task} from '../../../../__generated__/TaskFooter_task.graphql'
import {EditorState} from 'draft-js'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
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
import {Card} from '../../../../types/constEnums'
import {UseTaskChild} from '../../../../hooks/useTaskChildFocus'

const Footer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  maxWidth: '100%',
  padding: `12px ${Card.PADDING} ${Card.PADDING}`
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
  useTaskChild: UseTaskChild
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
    useTaskChild
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
              useTaskChild={useTaskChild}
            />
          ) : (
            <TaskFooterUserAssignee
              area={area}
              canAssign={canAssign}
              cardIsActive={cardIsActive}
              task={task}
              useTaskChild={useTaskChild}
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
              useTaskChild={useTaskChild}
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
              useTaskChild={useTaskChild}
              mutationProps={mutationProps}
            />
          )}
        </ButtonGroup>
      </Footer>
      {error && <OutcomeCardMessage onClose={() => onError()} message={typeof error === 'string' ? error : error.message as string} />}
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
