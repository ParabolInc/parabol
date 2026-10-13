import AzureDevOpsProjectId from 'parabol-client/shared/gqlIds/AzureDevOpsProjectId'
import type RepoAccess from '../platform/RepoAccess'
import listGrantedAzureDevOpsProjects from './listGrantedAzureDevOpsProjects'

const GUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const WORK_ITEM_URL_PATTERN = /^https:\/\/[^/]+\/[^/]+\/([^/]+)\/_apis\//

interface WorkItemLocation {
  url: string
  fields: Record<string, unknown>
}

/**
 * The project a fetched work item really lives in, or null when the connection does not share it.
 * A work item is fetched by id alone, so the project a client names for it proves nothing; this reads it off the response.
 * The project is always identified by its GUID: a response that carries only a name is matched to a shared project, or dropped
 */
const resolveAzureDevOpsWorkItemProject = (
  access: RepoAccess,
  instanceId: string,
  workItem: WorkItemLocation
) => {
  const teamProject = workItem.fields['System.TeamProject']
  const projectName = typeof teamProject === 'string' ? teamProject : ''
  const urlProject = WORK_ITEM_URL_PATTERN.exec(workItem.url)?.[1] ?? ''
  if (GUID_PATTERN.test(urlProject)) {
    const isShared = access.allows(AzureDevOpsProjectId.join(instanceId, urlProject))
    return isShared ? {projectId: urlProject, projectName} : null
  }
  if (!projectName) return null
  const grant = listGrantedAzureDevOpsProjects(access).find(
    (project) =>
      project.instanceId.toLowerCase() === instanceId.toLowerCase() &&
      project.name.toLowerCase() === projectName.toLowerCase()
  )
  return grant ? {projectId: grant.projectId, projectName} : null
}

export default resolveAzureDevOpsWorkItemProject
