import {AzureAccountProject, AzureProject} from '../../../dataloader/azureDevOpsLoaders'
import {getInstanceId} from '../../../utils/azureDevOps/azureDevOpsFieldTypeToId'
import {AzureDevOpsRemoteProjectResolvers} from '../resolverTypes'

// This type is almost certainly wrong, but during the refactor to SDL I didn't want to mess with runtime logic
export type AzureDevOpsRemoteProjectSource = AzureProject | AzureAccountProject

const AzureDevOpsRemoteProject: AzureDevOpsRemoteProjectResolvers = {
  __isTypeOf: ({service}) => service === 'azureDevOps',
  service: () => 'azureDevOps',
  instanceId: ({url}) => getInstanceId(new URL(url))
}

export default AzureDevOpsRemoteProject
