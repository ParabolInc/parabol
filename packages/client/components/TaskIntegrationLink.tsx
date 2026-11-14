import graphql from 'babel-plugin-relay/macro'
import type {ReactNode} from 'react'
import {useFragment} from 'react-relay'
import type {TaskIntegrationLink_integration$key} from '../__generated__/TaskIntegrationLink_integration.graphql'
import {cn} from '../ui/cn'
import getTaskIntegrationLinkDetails from '../utils/getTaskIntegrationLinkDetails'
import isTempId from '../utils/relay/isTempId'
import Ellipsis from './Ellipsis/Ellipsis'
import TaskIntegrationStatusPopover from './TaskIntegrationStatusPopover'

interface Props {
  integration: TaskIntegrationLink_integration$key | null
  className?: string
  children?: ReactNode
}

const TaskIntegrationLink = (props: Props) => {
  const {integration: integrationRef, className, children} = props
  const integration = useFragment(
    graphql`
      fragment TaskIntegrationLink_integration on TaskIntegration {
        __typename
        id
        ...TaskIntegrationLinkIntegrationGitHub @relay(mask: false) @alias
        ...TaskIntegrationLinkIntegrationJira @relay(mask: false) @alias
        ...TaskIntegrationLinkIntegrationJiraServer @relay(mask: false) @alias
        ...TaskIntegrationLinkIntegrationGitLab @relay(mask: false) @alias
        ...TaskIntegrationLinkIntegrationAzure @relay(mask: false) @alias
        ...TaskIntegrationLinkIntegrationLinear @relay(mask: false) @alias
        ...TaskIntegrationLinkIntegrationClickUp @relay(mask: false) @alias
      }
    `,
    integrationRef
  )
  if (!integration) return null
  if (isTempId(integration.id)) {
    return (
      <div
        className={cn('block px-4 text-[14px] text-fg-primary leading-5', className)}
        aria-live='polite'
      >
        Issue #<Ellipsis />
      </div>
    )
  }
  const details = getTaskIntegrationLinkDetails(integration)
  if (!details) return null
  const {href, label, title, service, status} = details
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
    <TaskIntegrationStatusPopover service={service} href={href} label={label} status={status}>
      {link}
    </TaskIntegrationStatusPopover>
  )
}

graphql`
  fragment TaskIntegrationLinkIntegrationJira on JiraIssue {
    issueKey
    projectKey
    cloudName
    jiraStatus: status {
      name
    }
  }
`

graphql`
  fragment TaskIntegrationLinkIntegrationGitHub on _xGitHubIssue {
    number
    githubState: state
    repository {
      nameWithOwner
    }
  }
`

graphql`
  fragment TaskIntegrationLinkIntegrationGitLab on _xGitLabIssue {
    iid
    gitlabState: state
    webPath
    webUrl
  }
`

graphql`
  fragment TaskIntegrationLinkIntegrationJiraServer on JiraServerIssue {
    id
    issueKey
    projectKey
    url
    jiraServerStatus: status {
      name
    }
  }
`

graphql`
  fragment TaskIntegrationLinkIntegrationAzure on AzureDevOpsWorkItem {
    id
    workItemKey: issueKey
    azureProject: project {
      organization
      name
    }
    type
    azureState: state
    url
  }
`

graphql`
  fragment TaskIntegrationLinkIntegrationLinear on _xLinearIssue {
    id
    identifier
    linearProject: project {
      name
    }
    team {
      name
    }
    linearState: state {
      name
    }
    url
  }
`

graphql`
  fragment TaskIntegrationLinkIntegrationClickUp on ClickUpTask {
    id
    taskId
    customId
    listName
    folderName
    clickUpUrl: url
    clickUpStatus: status {
      name
    }
  }
`

export default TaskIntegrationLink
