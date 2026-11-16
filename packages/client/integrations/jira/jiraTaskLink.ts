import graphql from 'babel-plugin-relay/macro'
import {readInlineData} from 'relay-runtime'
import type {jiraTaskLink_issue$key} from '../../__generated__/jiraTaskLink_issue.graphql'
import {DemoIntegration} from '../../types/constEnums'
import type {TaskLinkCapability} from '../platform/ClientIntegrationDefinition'

const jiraTaskLink: TaskLinkCapability = {
  getDetails: ({jiraTaskLink_issue}) => {
    if (!jiraTaskLink_issue) return null
    const {issueKey, projectKey, cloudName, jiraStatus} = readInlineData<jiraTaskLink_issue$key>(
      graphql`
        fragment jiraTaskLink_issue on JiraIssue @inline {
          issueKey
          projectKey
          cloudName
          jiraStatus: status {
            name
          }
        }
      `,
      jiraTaskLink_issue
    )
    return {
      href:
        cloudName === DemoIntegration.JIRA_CLOUD_NAME
          ? DemoIntegration.JIRA_ISSUE_URL
          : `https://${cloudName}.atlassian.net/browse/${issueKey}`,
      label: `Issue #${issueKey}`,
      title: `Jira Issue #${issueKey} on ${projectKey}`,
      status: jiraStatus?.name ?? null
    }
  }
}

export default jiraTaskLink
