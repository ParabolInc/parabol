import graphql from 'babel-plugin-relay/macro'
import {readInlineData} from 'relay-runtime'
import type {linearTaskLink_issue$key} from '../../__generated__/linearTaskLink_issue.graphql'
import {getLinearRepoName} from '../../utils/getLinearRepoName'
import type {TaskLinkCapability} from '../platform/ClientIntegrationDefinition'

const linearTaskLink: TaskLinkCapability = {
  getDetails: ({linearTaskLink_issue}) => {
    if (!linearTaskLink_issue) return null
    const {identifier, team, linearProject, url, linearState} =
      readInlineData<linearTaskLink_issue$key>(
        graphql`
          fragment linearTaskLink_issue on _xLinearIssue @inline {
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
        `,
        linearTaskLink_issue
      )
    return {
      href: url,
      label: `Issue #${identifier}`,
      title: `Linear Issue #${identifier} on ${getLinearRepoName(linearProject, team.name)}`,
      status: linearState?.name ?? null
    }
  }
}

export default linearTaskLink
