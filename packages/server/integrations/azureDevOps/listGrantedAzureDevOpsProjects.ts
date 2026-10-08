import AzureDevOpsProjectId from 'parabol-client/shared/gqlIds/AzureDevOpsProjectId'
import type RepoAccess from '../platform/RepoAccess'

export interface GrantedAzureDevOpsProject {
  instanceId: string
  projectId: string
  name: string
}

/** The projects a connection shares by name. Empty when it shares every project, since those are only known to Azure DevOps */
const listGrantedAzureDevOpsProjects = (access: RepoAccess): GrantedAzureDevOpsProject[] =>
  access.repos.map(({id, name}) => ({...AzureDevOpsProjectId.split(id), name}))

export default listGrantedAzureDevOpsProjects
