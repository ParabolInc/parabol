import AzureDevOpsIssueId from 'parabol-client/integrations/azureDevOps/shared/AzureDevOpsIssueId'
import type {AzureDevOpsWorkItem as AzureDevOpsWorkItemSource} from '../../../integrations/azureDevOps/mapAzureDevOpsWorkItem'
import type {AzureDevOpsWorkItemResolvers} from '../resolverTypes'

export type {AzureDevOpsWorkItemSource}

const AzureDevOpsWorkItem: AzureDevOpsWorkItemResolvers = {
  __isTypeOf: ({service}) => service === 'azureDevOps',
  id: ({instanceId, teamProject, id}) => AzureDevOpsIssueId.join(instanceId, teamProject, id),
  issueKey: ({id}) => id,
  stateCategory: async (
    {instanceId, teamProject, type, state, teamId, userId},
    _args,
    {dataLoader}
  ) => {
    const states = await dataLoader
      .get('azureDevOpsWorkItemTypeStates')
      .load({teamId, userId, instanceId, projectId: teamProject, workItemType: type})
    return states.find(({name}) => name === state)?.category ?? null
  },
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
