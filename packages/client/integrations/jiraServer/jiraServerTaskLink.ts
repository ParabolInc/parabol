import graphql from 'babel-plugin-relay/macro'
import {readInlineData} from 'relay-runtime'
import type {jiraServerTaskLink_issue$key} from '../../__generated__/jiraServerTaskLink_issue.graphql'
import type {TaskLinkCapability} from '../platform/ClientIntegrationDefinition'

const jiraServerTaskLink: TaskLinkCapability = {
  getDetails: ({jiraServerTaskLink_issue}) => {
    if (!jiraServerTaskLink_issue) return null
    const {url, issueKey, projectKey, jiraServerStatus} =
      readInlineData<jiraServerTaskLink_issue$key>(
        graphql`
          fragment jiraServerTaskLink_issue on JiraServerIssue @inline {
            issueKey
            projectKey
            url
            jiraServerStatus: status {
              name
            }
          }
        `,
        jiraServerTaskLink_issue
      )
    return {
      href: url,
      label: `Issue #${issueKey}`,
      title: `Jira Data Center Issue #${issueKey} on ${projectKey}`,
      status: jiraServerStatus?.name ?? null
    }
  }
}

export default jiraServerTaskLink
