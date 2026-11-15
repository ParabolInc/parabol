import graphql from 'babel-plugin-relay/macro'
import {readInlineData} from 'relay-runtime'
import type {azureDevOpsTaskLink_workItem$key} from '../../__generated__/azureDevOpsTaskLink_workItem.graphql'
import type {TaskLinkCapability} from '../platform/ClientIntegrationDefinition'

const azureDevOpsTaskLink: TaskLinkCapability = {
  getDetails: ({azureDevOpsTaskLink_workItem}) => {
    if (!azureDevOpsTaskLink_workItem) return null
    const {workItemKey, azureProject, url, type, azureState} =
      readInlineData<azureDevOpsTaskLink_workItem$key>(
        graphql`
          fragment azureDevOpsTaskLink_workItem on AzureDevOpsWorkItem @inline {
            workItemKey: issueKey
            azureProject: project {
              organization
              name
            }
            type
            azureState: state
            url
          }
        `,
        azureDevOpsTaskLink_workItem
      )
    const integrationType = type.includes('Issue') ? 'Issue' : type
    const workItemLabel = `${azureProject.organization}:${workItemKey}`
    return {
      href: url,
      label: `${integrationType} #${workItemLabel}`,
      title: `Azure Item #${workItemLabel} on ${azureProject.name}`,
      status: azureState || null
    }
  }
}

export default azureDevOpsTaskLink
