import buildAzureDevOpsWorkWiql, {
  AZURE_DEVOPS_CLOSED_STATES,
  type AzureDevOpsWorkKind
} from 'parabol-client/integrations/azureDevOps/shared/buildAzureDevOpsWorkWiql'
import {Logger} from '../../utils/Logger'
import {
  type InspirationIssue,
  type IssuePage,
  MAX_ISSUE_COMMENTS,
  MAX_ISSUES
} from '../platform/InspirationIssue'
import type {GqlIntegrationCtx} from '../platform/ServerIntegrationDefinition'
import azureDevOpsHtmlToText from './azureDevOpsHtmlToText'
import getAzureDevOpsManager from './getAzureDevOpsManager'
import searchAzureDevOpsWorkItems from './searchAzureDevOpsWorkItems'

const KINDS: readonly AzureDevOpsWorkKind[] = ['assigned', 'created']

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
const listAzureDevOpsIssues = async (
  ctx: GqlIntegrationCtx,
  searchQuery: string,
  {before, first}: IssuePage
): Promise<InspirationIssue[]> => {
  const params = parseSearchQuery(searchQuery)
  if (!params) {
    Logger.error('listAzureDevOpsIssues: could not parse searchQuery')
    return []
  }
  const {kinds, startAt, projects} = params
  const endAt =
    before && (!params.endAt || before < new Date(params.endAt))
      ? before.toISOString()
      : params.endAt
  if (kinds.length === 0) return []
  const [manager, workItems] = await Promise.all([
    getAzureDevOpsManager(ctx),
    searchAzureDevOpsWorkItems(ctx, {
      where: buildAzureDevOpsWorkWiql({kinds, startAt, endAt}),
      projects,
      limit: first
    })
  ])
  if (!manager) return []
  if (workItems instanceof Error) {
    Logger.error(workItems.message)
    return []
  }
  // Each work item's comments are a request of their own, so only the newest ones bring theirs
  return Promise.all(
    workItems.map(async (workItem, idx): Promise<InspirationIssue> => {
      const {id, instanceId, teamProject, projectName, title, type, state, url} = workItem
      const comments =
        idx < MAX_ISSUES
          ? await manager.listComments(instanceId, teamProject, id, MAX_ISSUE_COMMENTS)
          : []
      return {
        kind: type,
        title,
        reference: `#${id}`,
        subtitle: projectName,
        status: state,
        url,
        updatedAt: workItem.updatedAt,
        description: azureDevOpsHtmlToText(workItem.descriptionHTML),
        comments:
          comments instanceof Error
            ? []
            : comments.reverse().map((comment) => ({
                author: comment.createdBy?.displayName ?? 'unknown',
                body: azureDevOpsHtmlToText(comment.text ?? '')
              })),
        isOwnWork: true,
        isClosed: AZURE_DEVOPS_CLOSED_STATES.includes(state),
        commentCount: comments instanceof Error ? 0 : comments.length
      }
    })
  )
}

export default listAzureDevOpsIssues
