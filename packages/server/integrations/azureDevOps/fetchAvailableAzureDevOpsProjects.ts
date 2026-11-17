import logError from '../../utils/logError'
import type {RepoFetchCtx} from '../platform/ServerIntegrationDefinition'
import getAzureDevOpsManager from './getAzureDevOpsManager'

export interface AzureDevOpsProject {
  service: 'azureDevOps'
  instanceId: string
  projectId: string
  name: string
  teamId: string
  userId: string
}

/**
 * Every project the user's Azure DevOps account can see, whether or not the connection shares it.
 * An organization that refuses the request (a policy can block third-party apps) is skipped; an Error means nothing could be listed
 */
const fetchAvailableAzureDevOpsProjects = async (
  ctx: RepoFetchCtx
): Promise<AzureDevOpsProject[] | Error> => {
  const {teamId, userId} = ctx
  const manager = await getAzureDevOpsManager(ctx)
  if (!manager) return new Error('Azure DevOps is not connected')
  const organizations = await manager.listOrganizations()
  if (organizations instanceof Error) return organizations
  const results = await Promise.all(
    organizations.map(async ({accountName}) => {
      const instanceId = `dev.azure.com/${accountName}`
      const projects = await manager.listProjects(instanceId)
      if (projects instanceof Error) return projects
      return projects.map(({id, name}) => ({
        service: 'azureDevOps' as const,
        instanceId,
        projectId: id,
        name,
        teamId,
        userId
      }))
    })
  )
  const errors = results.filter((result) => result instanceof Error)
  if (errors.length > 0 && errors.length === results.length) return errors[0]!
  errors.forEach((error) => {
    logError(error, {userId, tags: {teamId, service: 'azureDevOps'}})
  })
  return results
    .flatMap((result) => (result instanceof Error ? [] : result))
    .sort((a, b) => a.instanceId.localeCompare(b.instanceId) || a.name.localeCompare(b.name))
}

export default fetchAvailableAzureDevOpsProjects
