import AzureDevOpsIssueId from 'parabol-client/shared/gqlIds/AzureDevOpsIssueId'
import {getInstanceId} from '../../../utils/azureDevOps/azureDevOpsFieldTypeToId'
import type {AzureDevOpsWorkItemResolvers} from '../resolverTypes'

export interface AzureDevOpsWorkItemSource {
  teamId: string
  userId: string
  service: 'azureDevOps'
  id: string
  teamProject: string
  url: string
}

const AzureDevOpsWorkItem: AzureDevOpsWorkItemResolvers = {
  __isTypeOf: ({service}) => service === 'azureDevOps',
  id: ({id, teamProject, url}) => {
    const instanceId = getInstanceId(url)
    return AzureDevOpsIssueId.join(instanceId, teamProject, id)
  },

  issueKey: async ({id}) => {
    return id
  },

  project: async ({teamId, userId, teamProject, url}, _args, {dataLoader}) => {
    const instanceId = getInstanceId(url)
    const res = await dataLoader
      .get('azureDevOpsProject')
      .load({instanceId, projectId: teamProject, userId, teamId})
    return res!
  }
}

export default AzureDevOpsWorkItem
