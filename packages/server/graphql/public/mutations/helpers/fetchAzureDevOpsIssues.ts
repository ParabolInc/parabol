import {parse} from 'node-html-parser'
import buildAzureDevOpsWorkWiql, {
  type AzureDevOpsWorkKind
} from 'parabol-client/shared/integrations/buildAzureDevOpsWorkWiql'
import type {DataLoaderWorker} from '../../../../graphql/graphql'
import getAzureDevOpsManager from '../../../../integrations/azureDevOps/getAzureDevOpsManager'
import searchAzureDevOpsWorkItems from '../../../../integrations/azureDevOps/searchAzureDevOpsWorkItems'
import {Logger} from '../../../../utils/Logger'
import {type InspirationIssue, MAX_ISSUE_COMMENTS, MAX_ISSUES} from './issuesForAI'

const KINDS: readonly AzureDevOpsWorkKind[] = ['assigned', 'created']

const toText = (html: string) => parse(html).structuredText.trim()

const isWorkKind = (value: unknown): value is AzureDevOpsWorkKind =>
  KINDS.some((kind) => kind === value)

const toISODate = (value: unknown) => {
  const date = new Date(typeof value === 'string' ? value : Number.NaN)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

const parseSearchQuery = (searchQuery: string) => {
  try {
    const {startAt, endAt, kinds, projectIds} = JSON.parse(searchQuery)
    const start = startAt === undefined ? undefined : toISODate(startAt)
    const end = endAt === undefined ? undefined : toISODate(endAt)
    if (start === null || end === null) return null
    return {
      startAt: start,
      endAt: end,
      kinds: Array.isArray(kinds) ? kinds.filter(isWorkKind) : [],
      projects: Array.isArray(projectIds)
        ? projectIds.filter((id): id is string => typeof id === 'string')
        : []
    }
  } catch {
    return null
  }
}

// Gathers the Azure DevOps work items the viewer was assigned or created and that changed in the
// drawer's date window, from the projects their connection shares with this team. The client
// serializes {startAt, endAt, kinds, projectIds} as JSON into searchQuery and lists with the same
// WHERE clause, so the draft and the list match. Returns [] if there's nothing.
const fetchAzureDevOpsIssues = async (
  teamId: string,
  userId: string,
  searchQuery: string,
  dataLoader: DataLoaderWorker
): Promise<InspirationIssue[]> => {
  const params = parseSearchQuery(searchQuery)
  if (!params) {
    Logger.error('fetchAzureDevOpsIssues: could not parse searchQuery')
    return []
  }
  const {kinds, startAt, endAt, projects} = params
  if (kinds.length === 0) return []
  const ctx = {dataLoader, teamId, userId}
  const [manager, workItems] = await Promise.all([
    getAzureDevOpsManager(ctx),
    searchAzureDevOpsWorkItems(ctx, {
      where: buildAzureDevOpsWorkWiql({kinds, startAt, endAt}),
      projects,
      limit: MAX_ISSUES
    })
  ])
  if (!manager) return []
  if (workItems instanceof Error) {
    Logger.error(workItems.message)
    return []
  }
  return Promise.all(
    workItems.map(async (workItem): Promise<InspirationIssue> => {
      const {id, instanceId, teamProject, projectName, title, type, state, url} = workItem
      const comments = await manager.listComments(instanceId, teamProject, id, MAX_ISSUE_COMMENTS)
      return {
        kind: type,
        title,
        reference: `#${id}`,
        subtitle: projectName,
        status: state,
        url,
        updatedAt: workItem.updatedAt,
        description: toText(workItem.descriptionHTML),
        comments:
          comments instanceof Error
            ? []
            : comments.reverse().map((comment) => ({
                author: comment.createdBy?.displayName ?? 'unknown',
                body: toText(comment.text ?? '')
              }))
      }
    })
  )
}

export default fetchAzureDevOpsIssues
