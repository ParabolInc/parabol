import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {
  PokerSidebarStoryTitle_task$data,
  PokerSidebarStoryTitle_task$key
} from '../__generated__/PokerSidebarStoryTitle_task.graphql'

type Integration = NonNullable<PokerSidebarStoryTitle_task$data['integration']>

const getIntegrationTitle = (integration: Integration) => {
  switch (integration.__typename) {
    case 'JiraIssue':
    case 'JiraServerIssue':
      return {title: integration.title, subtitle: integration.issueKey}
    case 'AzureDevOpsWorkItem':
      return {title: integration.title, subtitle: `#${integration.workItemKey}`}
    case '_xGitHubIssue':
      return {title: integration.title, subtitle: `#${integration.number}`}
    case '_xGitLabIssue':
      return {title: integration.title, subtitle: `#${integration.iid}`}
    case '_xLinearIssue':
      return {title: integration.title, subtitle: `${integration.identifier}`}
    case 'ClickUpTask':
      return {title: integration.title, subtitle: integration.customId ?? integration.taskId}
    default:
      return {title: '<Unknown Story>', subtitle: ''}
  }
}

interface Props {
  title: string
  integratedTask: PokerSidebarStoryTitle_task$key | null
}

const PokerSidebarStoryTitle = (props: Props) => {
  const {title: taskTitle, integratedTask: taskRef} = props
  const task = useFragment(
    graphql`
      fragment PokerSidebarStoryTitle_task on Task {
        integration {
          ... on AzureDevOpsWorkItem {
            __typename
            title
            workItemKey: issueKey
          }
          ... on JiraIssue {
            __typename
            title
            issueKey
          }
          ... on JiraServerIssue {
            __typename
            title
            issueKey
          }
          ... on _xGitHubIssue {
            __typename
            title
            number
          }
          ... on _xGitLabIssue {
            __typename
            title
            iid
          }
          ... on _xLinearIssue {
            __typename
            title
            identifier
          }
          ... on ClickUpTask {
            __typename
            title
            taskId
            customId
          }
        }
      }
    `,
    taskRef
  )
  const {title, subtitle} = task?.integration
    ? getIntegrationTitle(task.integration)
    : {title: taskTitle, subtitle: ''}
  return (
    <>
      <div className='overflow-hidden text-ellipsis whitespace-pre text-sm [word-break:break-word]'>
        {title}
      </div>
      {subtitle && (
        <div className='font-semibold text-[11px] text-fg-muted leading-3'>{subtitle}</div>
      )}
    </>
  )
}

export default PokerSidebarStoryTitle
