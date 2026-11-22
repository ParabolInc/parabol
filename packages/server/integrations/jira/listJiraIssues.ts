import ms from 'ms'
import {Logger} from '../../utils/Logger'
import {
  compareNewestFirst,
  type InspirationIssue,
  type IssuePage
} from '../platform/InspirationIssue'
import type {GqlIntegrationCtx} from '../platform/ServerIntegrationDefinition'
import AtlassianServerManager from './AtlassianServerManager'
import adfToPlaintext from './adfToPlaintext'

const ORDER_BY = /\s*\border\s+by\b\s*/i

// JQL compares dates to the minute in the viewer's Jira time zone. A bound relative to now needs no time zone, and it
// is a minute late on purpose so it can't fall short of `before`; the newer page already showed what lands after it
const narrowToBefore = (jql: string, before: Date | null) => {
  if (!before) return jql
  const minutesAgo = Math.max(0, Math.floor((Date.now() - before.getTime()) / ms('1m')) - 1)
  const [where = '', orderBy] = jql.split(ORDER_BY)
  const bound = `updated <= "-${minutesAgo}m"`
  const narrowed = where.trim() ? `(${where}) AND ${bound}` : bound
  return orderBy ? `${narrowed} order by ${orderBy}` : narrowed
}

// Re-runs the Jira search the user saw in the Your Work drawer, server-side, fetching the full
// description for each issue so the AI has enough context to draft a response. Returns the
// normalized issues, or [] if there's nothing to send.
const listJiraIssues = async (
  ctx: GqlIntegrationCtx,
  searchQuery: string,
  {before, first}: IssuePage
): Promise<InspirationIssue[]> => {
  const {dataLoader, teamId, userId} = ctx
  const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId})
  if (!auth) return []
  const cloudNameLookup = await dataLoader.get('atlassianCloudNameLookup').load({teamId, userId})
  const cloudIds = Object.keys(cloudNameLookup)
  if (cloudIds.length === 0) return []

  const manager = new AtlassianServerManager(auth.accessToken)
  const jql = narrowToBefore(searchQuery, before)
  const cloudResults = await Promise.all(
    cloudIds.map(async (cloudId): Promise<InspirationIssue[]> => {
      const {error, issues} = await manager.getIssues(cloudId, jql, true, [], first)
      if (error) {
        Logger.error(error.message)
        return []
      }
      const cloudName = cloudNameLookup[cloudId]
      return issues.map((issue) => ({
        kind: 'Issue',
        title: issue.summary,
        reference: issue.issueKey,
        url: `https://${cloudName}.atlassian.net/browse/${issue.issueKey}`,
        updatedAt: new Date(issue.lastUpdated),
        description: adfToPlaintext(issue.description),
        // the drawer only searches issues assigned to or reported by the viewer
        isOwnWork: true
      }))
    })
  )

  return cloudResults.flat().sort(compareNewestFirst).slice(0, first)
}

export default listJiraIssues
