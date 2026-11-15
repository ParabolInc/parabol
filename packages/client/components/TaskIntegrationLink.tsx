import graphql from 'babel-plugin-relay/macro'
import type {ReactNode} from 'react'
import {useFragment} from 'react-relay'
import type {TaskIntegrationLink_integration$key} from '../__generated__/TaskIntegrationLink_integration.graphql'
import useMoveClosedTaskToDone from '../hooks/useMoveClosedTaskToDone'
import getTaskLink from '../integrations/platform/getTaskLink'
import {cn} from '../ui/cn'
import isTempId from '../utils/relay/isTempId'
import Ellipsis from './Ellipsis/Ellipsis'
import TaskIntegrationStatusPopover from './TaskIntegrationStatusPopover'

interface Props {
  integration: TaskIntegrationLink_integration$key | null
  taskId: string
  isDone: boolean
  isArchived: boolean
  className?: string
  children?: ReactNode
}

const TaskIntegrationLink = (props: Props) => {
  const {integration: integrationRef, taskId, isDone, isArchived, className, children} = props
  const integration = useFragment(
    graphql`
      fragment TaskIntegrationLink_integration on TaskIntegration {
        id
        ...jiraTaskLink_issue @alias
        ...jiraServerTaskLink_issue @alias
        ...gitHubTaskLink_issue @alias
        ...gitLabTaskLink_issue @alias
        ...azureDevOpsTaskLink_workItem @alias
        ...linearTaskLink_issue @alias
        ...clickUpTaskLink_task @alias
      }
    `,
    integrationRef
  )
  const isPending = !integration || isTempId(integration.id)
  const taskLink = isPending ? null : getTaskLink(integration)
  useMoveClosedTaskToDone(taskId, !!taskLink?.closed && !isArchived, isDone)
  if (!integration) return null
  if (isPending) {
    return (
      <div
        className={cn('block px-4 text-[14px] text-fg-primary leading-5', className)}
        aria-live='polite'
      >
        Issue #<Ellipsis />
      </div>
    )
  }
  if (!taskLink) return null
  const {href, label, title, service, status, closed} = taskLink
  const link = (
    <a
      href={href}
      rel='noopener noreferrer'
      target='_blank'
      title={status ? undefined : title}
      className={cn(
        'block px-4 text-[14px] text-fg-primary leading-5 underline hover:underline focus:underline',
        className
      )}
    >
      {label}
      {children}
    </a>
  )
  if (!status) return link
  return (
    <TaskIntegrationStatusPopover
      service={service}
      href={href}
      label={label}
      status={status}
      movedToDone={closed && isDone}
    >
      {link}
    </TaskIntegrationStatusPopover>
  )
}

export default TaskIntegrationLink
