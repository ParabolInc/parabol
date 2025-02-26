import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {Fragment} from 'react'
import {useFragment} from 'react-relay'
import {AreaEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import {TaskFooter_task$key} from '../../../../__generated__/TaskFooter_task.graphql'
import CardButton from '../../../../components/CardButton'
import IconLabel from '../../../../components/IconLabel'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
import {Card} from '../../../../types/constEnums'
import {CompletedHandler} from '../../../../types/relayMutations'
import {USER_DASH} from '../../../../utils/constants'
import isTaskArchived from '../../../../utils/isTaskArchived'
import setLocalTaskError from '../../../../utils/relay/setLocalTaskError'
import OutcomeCardMessage from '../OutcomeCardMessage/OutcomeCardMessage'
import TaskFooterIntegrateToggle from './TaskFooterIntegrateToggle'
import TaskFooterTagMenuToggle from './TaskFooterTagMenuToggle'
import TaskFooterTeamAssignee from './TaskFooterTeamAssignee'
import TaskFooterUserAssignee from './TaskFooterUserAssignee'

const Footer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  maxWidth: '100%',
  padding: `8px ${Card.PADDING} ${Card.PADDING}`
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

interface Props {
  area: AreaEnum
  cardIsActive: boolean
  toggleTag: (tag: string) => void
  isAgenda: boolean
  task: TaskFooter_task$key
  useTaskChild: UseTaskChild
}

const TaskFooter = (props: Props) => {
  const {area, cardIsActive, toggleTag, isAgenda, task: taskRef, useTaskChild} = props
  const task = useFragment(
    graphql`
      fragment TaskFooter_task on Task {
        id
        error
        integration {
          __typename
        }
        tags
        team {
          id
        }
        userId
        ...TaskFooterTeamAssignee_task
        ...TaskFooterUserAssignee_task
        ...TaskFooterTagMenu_task
        ...TaskFooterIntegrateMenuRoot_task
      }
    `,
    taskRef
  )
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const handleError = (err: Error) => {
    onError(err)
    if (err.message) {
      setLocalTaskError(atmosphere, taskId, err.message)
    }
  }
  const handleCompleted: CompletedHandler = (res, errors) => {
    onCompleted(res, errors)
    const payload = res?.[Object.keys(res)[0]!]
    const error = payload?.error?.message ?? errors?.[0]?.message ?? null
    setLocalTaskError(atmosphere, taskId, error)
  }

  const mutationProps = {
    onCompleted: handleCompleted,
    submitMutation,
    submitting,
    onError: handleError
  }
  const atmosphere = useAtmosphere()
  const showTeam = area === USER_DASH
  const {id: taskId, error, integration, tags, userId} = task
  const isArchived = isTaskArchived(tags)
  const canAssignUser = !integration && !isArchived
  const canAssignTeam = !isArchived
  return (
    <Fragment>
      <Footer>
        <AvatarBlock>
          {showTeam ? (
            <TaskFooterTeamAssignee
              canAssign={canAssignTeam}
              task={task}
              useTaskChild={useTaskChild}
            />
          ) : (
            <TaskFooterUserAssignee
              area={area}
              canAssign={canAssignUser}
              task={task}
              useTaskChild={useTaskChild}
            />
          )}
        </AvatarBlock>
        <ButtonGroup cardIsActive={cardIsActive}>
          {integration || isArchived || !userId ? (
            <ButtonSpacer />
          ) : (
            <TaskFooterIntegrateToggle
              mutationProps={mutationProps}
              task={task}
              useTaskChild={useTaskChild}
            />
          )}
          {isArchived ? (
            <CardButton onClick={() => toggleTag('archived')}>
              <IconLabel icon='reply' />
            </CardButton>
          ) : (
            <TaskFooterTagMenuToggle
              area={area}
              toggleTag={toggleTag}
              isAgenda={isAgenda}
              task={task}
              useTaskChild={useTaskChild}
              mutationProps={mutationProps}
            />
          )}
        </ButtonGroup>
      </Footer>
      {error && <OutcomeCardMessage onClose={handleCompleted} message={error} />}
    </Fragment>
  )
}

export default TaskFooter
