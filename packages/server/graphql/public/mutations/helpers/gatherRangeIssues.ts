import type {GraphQLResolveInfo} from 'graphql'
import type {InspirationIssue, IssuePage} from '../../../../integrations/platform/InspirationIssue'
import type {GQLContext} from '../../../graphql'
import type {InspirationSourceInput} from '../../resolverTypes'
import fetchIssues from './fetchIssues'

// The most every service sends at once: a GitHub search caps a page at 100
const RANGE_PAGE_SIZE = 100
const MAX_PAGES_PER_SOURCE = 4

const toTime = ({updatedAt}: InspirationIssue) => {
  const time = updatedAt?.getTime()
  return time === undefined || Number.isNaN(time) ? null : time
}

const toKey = ({kind, url, title}: InspirationIssue) => `${kind}:${url || title}`

// Pages back through one source's search, newest first, to the start of its date range. A service rounds `before`
// up, so it sends the newest issues of each older page again; each issue is kept once. A page that brings nothing
// new or reaches no further back ends it, so a service that rounds dates can't keep sending the same page.
const pageWholeRange = async (fetchPage: (page: IssuePage) => Promise<InspirationIssue[]>) => {
  const issuesByKey = new Map<string, InspirationIssue>()
  let before: Date | null = null
  for (let pageIndex = 0; pageIndex < MAX_PAGES_PER_SOURCE; pageIndex++) {
    const pageIssues = await fetchPage({before, first: RANGE_PAGE_SIZE})
    const newIssues = pageIssues.filter((issue) => !issuesByKey.has(toKey(issue)))
    newIssues.forEach((issue) => issuesByKey.set(toKey(issue), issue))
    if (pageIssues.length < RANGE_PAGE_SIZE || newIssues.length === 0) break
    const times = pageIssues.flatMap((issue) => toTime(issue) ?? [])
    if (times.length === 0) break
    const oldest = Math.min(...times)
    if (before && oldest >= before.getTime()) break
    before = new Date(oldest)
  }
  return [...issuesByKey.values()]
}

// Every source's issues across the whole date range, which a retrospective's AI reads at once to find themes
const gatherRangeIssues = (
  sources: readonly InspirationSourceInput[],
  teamId: string,
  viewerId: string,
  context: GQLContext,
  info: GraphQLResolveInfo
) =>
  Promise.all(
    sources.map(async ({service, searchQuery}) => ({
      service,
      sourceIssues: await pageWholeRange((page) =>
        fetchIssues(service, searchQuery, teamId, viewerId, context, info, page)
      )
    }))
  )

export default gatherRangeIssues
