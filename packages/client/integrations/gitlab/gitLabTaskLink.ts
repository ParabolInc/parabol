import graphql from 'babel-plugin-relay/macro'
import {readInlineData} from 'relay-runtime'
import type {gitLabTaskLink_issue$key} from '../../__generated__/gitLabTaskLink_issue.graphql'
import {parseWebPath} from '../../utils/parseWebPath'
import type {TaskLinkCapability} from '../platform/ClientIntegrationDefinition'

const STATES: Record<string, string> = {opened: 'Open', closed: 'Closed', locked: 'Locked'}

const gitLabTaskLink: TaskLinkCapability = {
  getDetails: ({gitLabTaskLink_issue}) => {
    if (!gitLabTaskLink_issue) return null
    const {iid, webPath, webUrl, gitlabState} = readInlineData<gitLabTaskLink_issue$key>(
      graphql`
        fragment gitLabTaskLink_issue on _xGitLabIssue @inline {
          iid
          webPath
          webUrl
          gitlabState: state
        }
      `,
      gitLabTaskLink_issue
    )
    const {fullPath} = parseWebPath(webPath)
    return {
      href: webUrl,
      label: `Issue #${iid}`,
      title: `GitLab Issue #${iid} on ${fullPath}`,
      status: STATES[gitlabState] ?? null
    }
  }
}

export default gitLabTaskLink
