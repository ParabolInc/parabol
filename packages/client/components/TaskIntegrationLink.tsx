import graphql from 'babel-plugin-relay/macro'
import type {ReactNode} from 'react'
import {useFragment} from 'react-relay'
import {getLinearRepoName} from '~/utils/getLinearRepoName'
import {parseWebPath} from '~/utils/parseWebPath'
import type {TaskIntegrationLink_integration$key} from '../__generated__/TaskIntegrationLink_integration.graphql'
import {cn} from '../ui/cn'
import JiraIssueLink from './JiraIssueLink'

interface Props {
  integration: TaskIntegrationLink_integration$key | null
  className?: string
  children?: ReactNode
  showJiraLabelPrefix?: boolean
}

const TaskIntegrationLink = (props: Props) => {
  const {integration: integrationRef, className, children, showJiraLabelPrefix} = props
  const integration = useFragment(
    graphql`
      fragment TaskIntegrationLink_integration on TaskIntegration {
        __typename
        ...TaskIntegrationLinkIntegrationGitHub @relay(mask: false) @alias
        ...TaskIntegrationLinkIntegrationJira @relay(mask: false) @alias
        ...TaskIntegrationLinkIntegrationJiraServer @relay(mask: false) @alias
        ...TaskIntegrationLinkIntegrationGitLab @relay(mask: false) @alias
        ...TaskIntegrationLinkIntegrationAzure @relay(mask: false) @alias
        ...TaskIntegrationLinkIntegrationLinear @relay(mask: false) @alias
      }
    `,
    integrationRef
  )
  if (!integration) return null
  const linkClassName = cn(
    'block px-4 text-[14px] text-fg-primary leading-5 underline hover:underline focus:underline',
    className
  )
  const jira = integration.TaskIntegrationLinkIntegrationJira
  if (jira) {
    const {issueKey, projectKey, cloudName} = jira
    return (
      <JiraIssueLink
        issueKey={issueKey}
        projectKey={projectKey}
        cloudName={cloudName}
        className={className}
        showLabelPrefix={showJiraLabelPrefix}
      >
        {children}
      </JiraIssueLink>
    )
  }
  const jiraServer = integration.TaskIntegrationLinkIntegrationJiraServer
  if (jiraServer) {
    const {url, issueKey, projectKey} = jiraServer
    return (
      <a
        href={url}
        rel='noopener noreferrer'
        target='_blank'
        title={`Jira Data Center Issue #${issueKey} on ${projectKey}`}
        className={linkClassName}
      >
        {`Issue #${issueKey}`}
        {children}
      </a>
    )
  }
  const github = integration.TaskIntegrationLinkIntegrationGitHub
  if (github) {
    const {repository, number} = github
    const {nameWithOwner} = repository
    const href =
      nameWithOwner === 'ParabolInc/ParabolDemo'
        ? 'https://github.com/ParabolInc/parabol'
        : `https://www.github.com/${nameWithOwner}/issues/${number}`
    return (
      <a
        href={href}
        rel='noopener noreferrer'
        target='_blank'
        title={`GitHub Issue #${number} on ${nameWithOwner}`}
        className={linkClassName}
      >
        {`Issue #${number}`}
        {children}
      </a>
    )
  }
  const gitlab = integration.TaskIntegrationLinkIntegrationGitLab
  if (gitlab) {
    const {webPath, iid, webUrl} = gitlab
    const {fullPath} = parseWebPath(webPath)
    return (
      <a
        href={webUrl}
        rel='noopener noreferrer'
        target='_blank'
        title={`GitLab Issue #${iid} on ${fullPath}`}
        className={linkClassName}
      >
        {`Issue #${iid}`}
        {children}
      </a>
    )
  }
  const azure = integration.TaskIntegrationLinkIntegrationAzure
  if (azure) {
    const {id, teamProject, url, type} = azure
    const integrationType = type.includes('Issue') ? 'Issue' : type
    return (
      <a
        href={url}
        rel='noopener noreferrer'
        target='_blank'
        title={`Azure Item #${id} on ${teamProject}`}
        className={linkClassName}
      >
        {`${integrationType} #${id}`}
        {children}
      </a>
    )
  }
  const linear = integration.TaskIntegrationLinkIntegrationLinear
  if (linear) {
    const {
      identifier,
      team: {name: teamName},
      linearProject,
      url
    } = linear
    const nameWithTeam = getLinearRepoName(linearProject, teamName)
    return (
      <a
        href={url}
        rel='noopener noreferrer'
        target='_blank'
        title={`Linear Issue #${identifier} on ${nameWithTeam}`}
        className={linkClassName}
      >
        {`Issue #${identifier}`}
        {children}
      </a>
    )
  }
  return null
}

graphql`
  fragment TaskIntegrationLinkIntegrationJira on JiraIssue {
    issueKey
    projectKey
    cloudName
  }
`

graphql`
  fragment TaskIntegrationLinkIntegrationGitHub on _xGitHubIssue {
    number
    repository {
      nameWithOwner
    }
  }
`

graphql`
  fragment TaskIntegrationLinkIntegrationGitLab on _xGitLabIssue {
    iid
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
  }
`

graphql`
  fragment TaskIntegrationLinkIntegrationAzure on AzureDevOpsWorkItem {
    id
    teamProject
    type
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
    url
  }
`

export default TaskIntegrationLink
