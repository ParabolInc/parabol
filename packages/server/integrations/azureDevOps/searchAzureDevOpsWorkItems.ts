import AzureDevOpsProjectId from 'parabol-client/shared/gqlIds/AzureDevOpsProjectId'
import logError from '../../utils/logError'
import type {RepoFetchCtx} from '../platform/ServerIntegrationDefinition'
import {isAzureDevOpsInstanceId} from './AzureDevOpsServerManager'
import {toWiqlQuery} from './buildAzureDevOpsWiql'
import fetchAvailableAzureDevOpsProjects from './fetchAvailableAzureDevOpsProjects'
import getAzureDevOpsManager from './getAzureDevOpsManager'
import listGrantedAzureDevOpsProjects, {
  type GrantedAzureDevOpsProject
} from './listGrantedAzureDevOpsProjects'
import mapAzureDevOpsWorkItem, {type AzureDevOpsWorkItem} from './mapAzureDevOpsWorkItem'

interface SearchParams {
  where: string
  orderBy?: string
  /** Names or integrationRepoIds of shared projects to narrow the search to; empty searches all of them */
  projects: readonly string[]
  limit: number
}

interface SearchTarget {
  instanceId: string
  /** null searches the whole organization, which only a connection that shares every project may do */
  projectId: string | null
}

const MAX_CONCURRENT_QUERIES = 6

export const NO_SHARED_PROJECTS_MESSAGE =
  'No Azure DevOps projects are shared with this team yet. Choose projects in Team Settings > Integrations.'

const getSearchTargets = async (
  ctx: RepoFetchCtx,
  manager: NonNullable<Awaited<ReturnType<typeof getAzureDevOpsManager>>>,
  projects: readonly string[]
): Promise<SearchTarget[] | Error> => {
  const {access} = manager
  const wanted = new Set(projects.map((project) => project.toLowerCase()))
  const isWanted = ({instanceId, projectId, name}: GrantedAzureDevOpsProject) =>
    wanted.size === 0 ||
    wanted.has(name.toLowerCase()) ||
    wanted.has(AzureDevOpsProjectId.join(instanceId, projectId).toLowerCase())
  if (access.mode === 'selected') {
    if (access.repos.length === 0) return new Error(NO_SHARED_PROJECTS_MESSAGE)
    return listGrantedAzureDevOpsProjects(access).filter(isWanted)
  }
  if (wanted.size === 0) {
    const organizations = await manager.listOrganizations()
    if (organizations instanceof Error) return organizations
    return organizations.map(({accountName}) => ({
      instanceId: `dev.azure.com/${accountName}`,
      projectId: null
    }))
  }
  const namedById = projects
    .map((project) => AzureDevOpsProjectId.split(project))
    .filter(({instanceId, projectId}) => isAzureDevOpsInstanceId(instanceId) && !!projectId)
  if (namedById.length === projects.length) {
    const toKey = ({instanceId, projectId}: (typeof namedById)[number]) =>
      AzureDevOpsProjectId.join(instanceId, projectId).toLowerCase()
    return [...new Map(namedById.map((target) => [toKey(target), target])).values()]
  }
  const availableProjects = await fetchAvailableAzureDevOpsProjects(ctx)
  return availableProjects instanceof Error ? availableProjects : availableProjects.filter(isWanted)
}

/**
 * Runs one WIQL WHERE clause against every project the connection shares and merges the matches.
 * A project that fails is skipped; an Error is returned only when nothing came back
 */
const searchAzureDevOpsWorkItems = async (
  ctx: RepoFetchCtx,
  params: SearchParams
): Promise<AzureDevOpsWorkItem[] | Error> => {
  const {teamId, userId} = ctx
  const {where, orderBy, projects, limit} = params
  const manager = await getAzureDevOpsManager(ctx)
  if (!manager) return new Error('Azure DevOps is not connected. Reconnect it and try again.')
  const targets = await getSearchTargets(ctx, manager, projects)
  if (targets instanceof Error) return targets

  const errors: Error[] = []
  const idsByInstance = new Map<string, number[]>()
  for (let i = 0; i < targets.length; i += MAX_CONCURRENT_QUERIES) {
    await Promise.all(
      targets.slice(i, i + MAX_CONCURRENT_QUERIES).map(async ({instanceId, projectId}) => {
        const query = toWiqlQuery(where, projectId !== null, orderBy)
        const ids = await manager.queryWorkItemIds(instanceId, projectId, query, limit)
        if (ids instanceof Error) {
          errors.push(ids)
          return
        }
        idsByInstance.set(instanceId, [...(idsByInstance.get(instanceId) ?? []), ...ids])
      })
    )
  }

  const pages = await Promise.all(
    [...idsByInstance].map(async ([instanceId, ids]) => {
      const workItems = ids.length > 0 ? await manager.getWorkItems(instanceId, ids) : []
      if (workItems instanceof Error) {
        errors.push(workItems)
        return []
      }
      const order = new Map(ids.map((id, idx) => [String(id), idx]))
      return workItems
        .flatMap((workItem) => {
          const owner = {access: manager.access, instanceId, teamId, userId}
          return mapAzureDevOpsWorkItem(workItem, owner) ?? []
        })
        .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
    })
  )
  const workItems = pages.flat()
  if (workItems.length === 0 && errors.length > 0) return errors[0]!
  errors.forEach((error) => {
    logError(error, {userId, tags: {teamId, service: 'azureDevOps'}})
  })
  const isSingleQuery = targets.length === 1
  const merged = isSingleQuery
    ? workItems
    : workItems.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  return merged.slice(0, limit)
}

export default searchAzureDevOpsWorkItems
