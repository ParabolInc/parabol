import AzureDevOpsProjectId from 'parabol-client/shared/gqlIds/AzureDevOpsProjectId'
import logError from '../../utils/logError'
import loadServiceRepoIntegrations from '../loadServiceRepoIntegrations'
import type RepoAccess from '../platform/RepoAccess'
import type {GqlIntegrationCtx} from '../platform/ServerIntegrationDefinition'
import {toWiqlQuery} from './buildAzureDevOpsWiql'
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
  projectNames: string[] | null
}

const MAX_CONCURRENT_QUERIES = 6
// WIQL text is capped at 32,000 characters and a project name at 64
const MAX_PROJECTS_PER_QUERY = 200

export const NO_SHARED_PROJECTS_MESSAGE =
  'No Azure DevOps projects are shared with this team yet. Choose projects in Team Settings > Integrations.'

export const PROJECTS_UNAVAILABLE_MESSAGE =
  'Could not list your Azure DevOps projects. Try again, or reconnect Azure DevOps.'

/** A connection that shares every project reads them from the cached repo list, so a search never lists the account live */
const listSharedProjects = async (
  ctx: GqlIntegrationCtx,
  access: RepoAccess
): Promise<GrantedAzureDevOpsProject[] | Error> => {
  if (access.mode === 'selected') return listGrantedAzureDevOpsProjects(access)
  const repos = await loadServiceRepoIntegrations('azureDevOps', ctx)
  if (!repos) return new Error(PROJECTS_UNAVAILABLE_MESSAGE)
  return repos.flatMap((repo) => (repo.service === 'azureDevOps' ? repo : []))
}

const getSearchTargets = async (
  ctx: GqlIntegrationCtx,
  access: RepoAccess,
  projects: readonly string[]
): Promise<SearchTarget[] | Error> => {
  if (access.mode === 'selected' && access.repos.length === 0) {
    return new Error(NO_SHARED_PROJECTS_MESSAGE)
  }
  const sharedProjects = await listSharedProjects(ctx, access)
  if (sharedProjects instanceof Error) return sharedProjects
  const wanted = new Set(projects.map((project) => project.toLowerCase()))
  const searchedProjects = sharedProjects.filter(
    ({instanceId, projectId, name}) =>
      wanted.size === 0 ||
      wanted.has(name.toLowerCase()) ||
      wanted.has(AzureDevOpsProjectId.join(instanceId, projectId).toLowerCase())
  )
  const instanceIds = [...new Set(searchedProjects.map(({instanceId}) => instanceId))]
  if (access.mode === 'all' && wanted.size === 0) {
    return instanceIds.map((instanceId) => ({instanceId, projectNames: null}))
  }
  return instanceIds.flatMap((instanceId) => {
    const projectNames = searchedProjects
      .filter((project) => project.instanceId === instanceId)
      .map(({name}) => name)
    const queryCount = Math.ceil(projectNames.length / MAX_PROJECTS_PER_QUERY)
    return Array.from({length: queryCount}, (_, queryIdx) => ({
      instanceId,
      projectNames: projectNames.slice(
        queryIdx * MAX_PROJECTS_PER_QUERY,
        (queryIdx + 1) * MAX_PROJECTS_PER_QUERY
      )
    }))
  })
}

/**
 * One query's order is the order Azure DevOps gave it. Several queries cannot be merged by an ordering only Azure DevOps understands,
 * so a requested ordering takes each query's best matches in turn, and the default one is redone here, newest first
 */
const mergePages = (pages: AzureDevOpsWorkItem[][], isOrderRequested: boolean) => {
  if (pages.length <= 1) return pages.flat()
  if (!isOrderRequested) {
    return pages.flat().sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }
  const longestPage = Math.max(...pages.map((page) => page.length))
  return Array.from({length: longestPage}, (_, rank) =>
    pages.flatMap((page) => page[rank] ?? [])
  ).flat()
}

/**
 * Runs one WIQL WHERE clause against the projects the connection shares, one query per organization, and merges the matches.
 * An organization that fails is skipped; an Error is returned only when nothing came back
 */
const searchAzureDevOpsWorkItems = async (
  ctx: GqlIntegrationCtx,
  params: SearchParams
): Promise<AzureDevOpsWorkItem[] | Error> => {
  const {teamId, userId} = ctx
  const {where, orderBy, projects, limit} = params
  const manager = await getAzureDevOpsManager(ctx)
  if (!manager) return new Error('Azure DevOps is not connected. Reconnect it and try again.')
  const {access} = manager
  const targets = await getSearchTargets(ctx, access, projects)
  if (targets instanceof Error) return targets

  const searchTarget = async ({instanceId, projectNames}: SearchTarget) => {
    const query = toWiqlQuery(where, projectNames, orderBy)
    const ids = await manager.queryWorkItemIds(instanceId, null, query, limit)
    if (ids instanceof Error) return ids
    if (ids.length === 0) return []
    const workItems = await manager.getWorkItems(instanceId, ids)
    if (workItems instanceof Error) return workItems
    const rankById = new Map(ids.map((id, rank) => [String(id), rank]))
    return workItems
      .map((workItem) => mapAzureDevOpsWorkItem(workItem, {instanceId, teamId, userId}))
      .sort((a, b) => (rankById.get(a.id) ?? 0) - (rankById.get(b.id) ?? 0))
  }
  const results: (AzureDevOpsWorkItem[] | Error)[] = []
  for (let i = 0; i < targets.length; i += MAX_CONCURRENT_QUERIES) {
    results.push(
      ...(await Promise.all(targets.slice(i, i + MAX_CONCURRENT_QUERIES).map(searchTarget)))
    )
  }
  const errors = results.filter((result) => result instanceof Error)
  const pages = results.flatMap((result) => (result instanceof Error ? [] : [result]))
  if (pages.every((page) => page.length === 0) && errors.length > 0) return errors[0]!
  errors.forEach((error) => {
    logError(error, {userId, tags: {teamId, service: 'azureDevOps'}})
  })
  return mergePages(pages, !!orderBy).slice(0, limit)
}

export default searchAzureDevOpsWorkItems
