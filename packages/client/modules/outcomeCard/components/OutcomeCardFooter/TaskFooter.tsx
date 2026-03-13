import graphql from 'babel-plugin-relay/macro'
import {Fragment} from 'react'
import {useFragment} from 'react-relay'
import type {AreaEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import {TaskJiraFieldsContent} from '~/components/TaskJiraFieldsContent'
import {cn} from '~/ui/cn'
import type {TaskFooter_task$key} from '../../../../__generated__/TaskFooter_task.graphql'
import CardButton from '../../../../components/CardButton'
import IconLabel from '../../../../components/IconLabel'
import {TaskMoreOptionsMenu} from '../../../../components/TaskMoreOptionsMenu'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import type {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
import type {CompletedHandler} from '../../../../types/relayMutations'
import {USER_DASH} from '../../../../utils/constants'
import isTaskArchived from '../../../../utils/isTaskArchived'
import setLocalTaskError from '../../../../utils/relay/setLocalTaskError'
import OutcomeCardMessage from '../OutcomeCardMessage/OutcomeCardMessage'
import {TaskTagContent} from '../OutcomeCardStatusMenu/TaskTagContent'
import TaskFooterIntegrateToggle from './TaskFooterIntegrateToggle'
import TaskFooterTeamAssignee from './TaskFooterTeamAssignee'
import TaskFooterUserAssignee from './TaskFooterUserAssignee'

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
        ...TaskTagContent_task
        ...TaskJiraFieldsContent_task
        id
        error
        tags
        team {
          id
        }
        integration {
          __typename
        }
        userId
        ...TaskFooterTeamAssignee_task
        ...TaskFooterUserAssignee_task
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
      <div className='flex max-w-full justify-between px-4 pt-2 pb-4'>
        <div className='h-6 min-w-0 flex-1'>
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
        </div>
        <div className={cn('flex justify-end', cardIsActive ? 'opacity-100' : 'opacity-0')}>
          {integration || isArchived || !userId ? (
            <div className='inline-block h-6 w-6 align-middle' />
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
            <TaskMoreOptionsMenu
              jiraFieldsContent={
                integration?.__typename === 'JiraIssue' && <TaskJiraFieldsContent taskRef={task} />
              }
              tagContent={
                <TaskTagContent
                  area={area}
                  toggleTag={toggleTag}
                  isAgenda={isAgenda}
                  task={task}
                  useTaskChild={useTaskChild}
                  mutationProps={mutationProps}
                />
              }
            />
          )}
        </div>
      </div>
      {error && <OutcomeCardMessage onClose={handleCompleted} message={error} />}
    </Fragment>
  )
}

export default TaskFooter
