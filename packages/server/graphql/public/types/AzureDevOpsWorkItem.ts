import AzureDevOpsIssueId from 'parabol-client/shared/gqlIds/AzureDevOpsIssueId'
import type {AzureDevOpsWorkItem as AzureDevOpsWorkItemSource} from '../../../integrations/azureDevOps/mapAzureDevOpsWorkItem'
import type {AzureDevOpsWorkItemResolvers} from '../resolverTypes'

export type {AzureDevOpsWorkItemSource}

const AzureDevOpsWorkItem: AzureDevOpsWorkItemResolvers = {
  __isTypeOf: ({service}) => service === 'azureDevOps',
  id: ({instanceId, teamProject, id}) => AzureDevOpsIssueId.join(instanceId, teamProject, id),
  issueKey: ({id}) => id,
  project: ({instanceId, teamProject, projectName, teamId, userId}) => ({
    service: 'azureDevOps',
    instanceId,
    projectId: teamProject,
    name: projectName,
    teamId,
    userId
  })
}

export default AzureDevOpsWorkItem
