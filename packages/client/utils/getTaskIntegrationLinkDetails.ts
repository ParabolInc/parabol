import type {TaskIntegrationLink_integration$data} from '../__generated__/TaskIntegrationLink_integration.graphql'
import getClickUpTaskLinkTitle from '../integrations/clickup/getClickUpTaskLinkTitle'
import type {TaskClientIntegration} from '../integrations/platform/registry'
import {DemoIntegration} from '../types/constEnums'
import {getLinearRepoName} from './getLinearRepoName'
import {parseWebPath} from './parseWebPath'

interface TaskIntegrationLinkDetails {
  href: string
  label: string
  title: string
  service: TaskClientIntegration
  status: string | null
}

const GITLAB_STATES: Record<string, string> = {opened: 'Open', closed: 'Closed', locked: 'Locked'}

const getTaskIntegrationLinkDetails = (
  integration: Partial<TaskIntegrationLink_integration$data>
): TaskIntegrationLinkDetails | null => {
  const jira = integration.TaskIntegrationLinkIntegrationJira
  if (jira) {
    const {issueKey, projectKey, cloudName, jiraStatus} = jira
    return {
      href:
        cloudName === DemoIntegration.JIRA_CLOUD_NAME
          ? DemoIntegration.JIRA_ISSUE_URL
          : `https://${cloudName}.atlassian.net/browse/${issueKey}`,
      label: `Issue #${issueKey}`,
      title: `Jira Issue #${issueKey} on ${projectKey}`,
      service: 'jira',
      status: jiraStatus?.name ?? null
    }
  }
  const jiraServer = integration.TaskIntegrationLinkIntegrationJiraServer
  if (jiraServer) {
    const {url, issueKey, projectKey, jiraServerStatus} = jiraServer
    return {
      href: url,
      label: `Issue #${issueKey}`,
      title: `Jira Data Center Issue #${issueKey} on ${projectKey}`,
      service: 'jiraServer',
      status: jiraServerStatus?.name ?? null
    }
  }
  const github = integration.TaskIntegrationLinkIntegrationGitHub
  if (github) {
    const {repository, number, githubState} = github
    const {nameWithOwner} = repository
    return {
      href:
        nameWithOwner === DemoIntegration.GITHUB_REPO
          ? DemoIntegration.GITHUB_ISSUE_URL
          : `https://www.github.com/${nameWithOwner}/issues/${number}`,
      label: `Issue #${number}`,
      title: `GitHub Issue #${number} on ${nameWithOwner}`,
      service: 'github',
      status: githubState === 'OPEN' ? 'Open' : githubState === 'CLOSED' ? 'Closed' : null
    }
  }
  const gitlab = integration.TaskIntegrationLinkIntegrationGitLab
  if (gitlab) {
    const {webPath, iid, webUrl, gitlabState} = gitlab
    const {fullPath} = parseWebPath(webPath)
    return {
      href: webUrl,
      label: `Issue #${iid}`,
      title: `GitLab Issue #${iid} on ${fullPath}`,
      service: 'gitlab',
      status: (gitlabState && GITLAB_STATES[gitlabState]) ?? null
    }
  }
  const azure = integration.TaskIntegrationLinkIntegrationAzure
  if (azure) {
    const {workItemKey, azureProject, url, type, azureState} = azure
    const {organization, name: projectName} = azureProject
    const integrationType = type.includes('Issue') ? 'Issue' : type
    const workItemLabel = `${organization}:${workItemKey}`
    return {
      href: url,
      label: `${integrationType} #${workItemLabel}`,
      title: `Azure Item #${workItemLabel} on ${projectName}`,
      service: 'azureDevOps',
      status: azureState || null
    }
  }
  const linear = integration.TaskIntegrationLinkIntegrationLinear
  if (linear) {
    const {identifier, team, linearProject, url, linearState} = linear
    return {
      href: url,
      label: `Issue #${identifier}`,
      title: `Linear Issue #${identifier} on ${getLinearRepoName(linearProject, team.name)}`,
      service: 'linear',
      status: linearState?.name ?? null
    }
  }
  const clickUp = integration.TaskIntegrationLinkIntegrationClickUp
  if (clickUp) {
    return {
      href: clickUp.clickUpUrl,
      label: `Task ${clickUp.customId ?? clickUp.taskId}`,
      title: getClickUpTaskLinkTitle(clickUp),
      service: 'clickup',
      status: clickUp.clickUpStatus?.name ?? null
    }
  }
  return null
}

export default getTaskIntegrationLinkDetails
