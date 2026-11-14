import type {AzureDevOpsSharedWorkItem} from './AzureDevOpsServerManager'

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
  instanceId: string
  teamId: string
  userId: string
}

const readString = (fields: Record<string, unknown>, referenceName: string) => {
  const value = fields[referenceName]
  return typeof value === 'string' ? value : ''
}

const mapAzureDevOpsWorkItem = (
  workItem: AzureDevOpsSharedWorkItem,
  owner: Owner
): AzureDevOpsWorkItem => {
  const {instanceId, teamId, userId} = owner
  const {fields, id, project} = workItem
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
