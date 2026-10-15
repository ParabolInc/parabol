import IntegrationRepoId from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import type {AzureDevOpsProject} from '../../../integrations/azureDevOps/fetchAvailableAzureDevOpsProjects'
import type {AzureDevOpsRemoteProjectResolvers} from '../resolverTypes'

export type AzureDevOpsRemoteProjectSource = AzureDevOpsProject

const AzureDevOpsRemoteProject: AzureDevOpsRemoteProjectResolvers = {
  __isTypeOf: ({service}) => service === 'azureDevOps',
  id: ({projectId}) => projectId,
  service: () => 'azureDevOps',
  organization: ({instanceId}) => instanceId.slice(instanceId.indexOf('/') + 1),
  integrationRepoId: ({instanceId, projectId}) =>
    IntegrationRepoId.join({service: 'azureDevOps', instanceId, projectId})
}

export default AzureDevOpsRemoteProject
