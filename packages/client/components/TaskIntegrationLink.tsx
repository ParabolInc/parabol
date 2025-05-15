import graphql from 'babel-plugin-relay/macro'
import {ReactNode} from 'react'
import {useFragment} from 'react-relay'
import {twMerge} from 'tailwind-merge'
import {getLinearRepoName} from '~/utils/getLinearRepoName'
import {parseWebPath} from '~/utils/parseWebPath'
import {TaskIntegrationLink_integration$key} from '../__generated__/TaskIntegrationLink_integration.graphql'
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
        ...TaskIntegrationLinkIntegrationGitHub @relay(mask: false)
        ...TaskIntegrationLinkIntegrationJira @relay(mask: false)
        ...TaskIntegrationLinkIntegrationJiraServer @relay(mask: false)
        ...TaskIntegrationLinkIntegrationGitLab @relay(mask: false)
        ...TaskIntegrationLinkIntegrationAzure @relay(mask: false)
        ...TaskIntegrationLinkIntegrationLinear @relay(mask: false)
      }
    `,
    integrationRef
  )
  if (!integration) return null
  if (integration.__typename === 'JiraIssue') {
    const {issueKey, projectKey, cloudName} = integration
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
  } else if (integration.__typename === 'JiraServerIssue') {
    const {url, issueKey, projectKey} = integration
    return (
      <a
        href={url}
        rel='noopener noreferrer'
        target='_blank'
        title={`Jira Data Center Issue #${issueKey} on ${projectKey}`}
        className={twMerge(
          'block px-4 text-[14px] leading-5 text-slate-700 underline hover:underline focus:underline',
          className
        )}
      >
        {`Issue #${issueKey}`}
        {children}
      </a>
    )
  } else if (integration.__typename === '_xGitHubIssue') {
    const {repository, number} = integration
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
        className={twMerge(
          'block px-4 text-[14px] leading-5 text-slate-700 underline hover:underline focus:underline',
          className
        )}
      >
        {`Issue #${number}`}
        {children}
      </a>
    )
  } else if (integration.__typename === '_xGitLabIssue') {
    const {webPath, iid, webUrl} = integration
    const {fullPath} = parseWebPath(webPath)
    return (
      <a
        href={webUrl}
        rel='noopener noreferrer'
        target='_blank'
        title={`GitLab Issue #${iid} on ${fullPath}`}
        className={twMerge(
          'focus:underline, block px-4 text-[14px] leading-5 text-slate-700 underline hover:underline',
          className
        )}
      >
        {`Issue #${iid}`}
        {children}
      </a>
    )
  } else if (integration.__typename === 'AzureDevOpsWorkItem') {
    const {id, teamProject, url, type} = integration
    const integrationType = type.includes('Issue') ? 'Issue' : type
    return (
      <a
        href={url}
        rel='noopener noreferrer'
        target='_blank'
        title={`Azure Item #${id} on ${teamProject}`}
        className={twMerge(
          'block px-4 text-[14px] leading-5 text-slate-700 underline hover:underline focus:underline',
          className
        )}
      >
        {`${integrationType} #${id}`}
        {children}
      </a>
    )
  } else if (integration.__typename === '_xLinearIssue') {
    const {
      identifier,
      team: {name: teamName},
      linearProject,
      url
    } = integration
    const nameWithTeam = getLinearRepoName(linearProject, teamName)
    return (
      <a
        href={url}
        rel='noopener noreferrer'
        target='_blank'
        title={`Linear Issue #${identifier} on ${nameWithTeam}`}
        className={twMerge(
          'block px-4 text-[14px] leading-5 text-slate-700 underline hover:underline focus:underline',
          className
        )}
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
