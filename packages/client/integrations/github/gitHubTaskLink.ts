import graphql from 'babel-plugin-relay/macro'
import {readInlineData} from 'relay-runtime'
import type {gitHubTaskLink_issue$key} from '../../__generated__/gitHubTaskLink_issue.graphql'
import {DemoIntegration} from '../../types/constEnums'
import type {TaskLinkCapability} from '../platform/ClientIntegrationDefinition'

const STATES: Record<string, string> = {OPEN: 'Open', CLOSED: 'Closed'}

const gitHubTaskLink: TaskLinkCapability = {
  getDetails: ({gitHubTaskLink_issue}) => {
    if (!gitHubTaskLink_issue) return null
    const {number, githubState, repository} = readInlineData<gitHubTaskLink_issue$key>(
      graphql`
        fragment gitHubTaskLink_issue on _xGitHubIssue @inline {
          number
          githubState: state
          repository {
            nameWithOwner
          }
        }
      `,
      gitHubTaskLink_issue
    )
    const {nameWithOwner} = repository
    return {
      href:
        nameWithOwner === DemoIntegration.GITHUB_REPO
          ? DemoIntegration.GITHUB_ISSUE_URL
          : `https://www.github.com/${nameWithOwner}/issues/${number}`,
      label: `Issue #${number}`,
      title: `GitHub Issue #${number} on ${nameWithOwner}`,
      status: STATES[githubState] ?? null
    }
  }
}

export default gitHubTaskLink
