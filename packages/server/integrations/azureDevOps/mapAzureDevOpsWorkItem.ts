import type RepoAccess from '../platform/RepoAccess'
import type {AzureDevOpsRawWorkItem} from './AzureDevOpsServerManager'
import resolveAzureDevOpsWorkItemProject from './resolveAzureDevOpsWorkItemProject'

export interface AzureDevOpsWorkItem {
  service: 'azureDevOps'
  id: string
  instanceId: string
  /** The id of the project the work item lives in, as Task.integration.projectKey stores it */
  teamProject: string
  projectName: string
  title: string
  url: string
  state: string
  type: string
  descriptionHTML: string
  updatedAt: Date
  fields: Record<string, unknown>
  teamId: string
  userId: string
}

interface Owner {
  access: RepoAccess
  instanceId: string
  teamId: string
  userId: string
}

const readString = (fields: Record<string, unknown>, referenceName: string) => {
  const value = fields[referenceName]
  return typeof value === 'string' ? value : ''
}

/** Null when the work item is outside the projects the connection shares */
const mapAzureDevOpsWorkItem = (
  workItem: AzureDevOpsRawWorkItem,
  owner: Owner
): AzureDevOpsWorkItem | null => {
  const {access, instanceId, teamId, userId} = owner
  const project = resolveAzureDevOpsWorkItemProject(access, instanceId, workItem)
  if (!project) return null
  const {fields, id} = workItem
  const changedDate = new Date(readString(fields, 'System.ChangedDate'))
  return {
    service: 'azureDevOps',
    id: String(id),
    instanceId,
    teamProject: project.projectId,
    projectName: project.projectName,
    title: readString(fields, 'System.Title'),
    url:
      workItem._links?.html?.href ??
      `https://${instanceId}/${encodeURIComponent(project.projectId)}/_workitems/edit/${id}`,
    state: readString(fields, 'System.State'),
    type: readString(fields, 'System.WorkItemType'),
    descriptionHTML: readString(fields, 'System.Description'),
    updatedAt: Number.isNaN(changedDate.getTime()) ? new Date(0) : changedDate,
    fields,
    teamId,
    userId
  }
}

export default mapAzureDevOpsWorkItem
