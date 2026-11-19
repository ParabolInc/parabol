import type {GraphQLResolveInfo} from 'graphql'
import type {InspirationIssue} from '../../../../integrations/platform/InspirationIssue'
import {getServerIntegration} from '../../../../integrations/platform/registry'
import type {GQLContext} from '../../../graphql'
import type {InspirationSourceInput, ServiceEnum} from '../../resolverTypes'
import fetchIssues from './fetchIssues'
import {formatIssuesForAI} from './issuesForAI'
import pageInspirationIssues from './pageInspirationIssues'

// A draft combines every source, so its items share this key instead of a service
export const INSPIRATION_DRAFT_SERVICE = 'draft'

export interface NumberedIssue {
  id: string
  service: ServiceEnum
  issue: InspirationIssue
}

const sourceLabel = (service: ServiceEnum) =>
  service === 'PARABOL' ? 'Parabol' : (getServerIntegration(service)?.title ?? service)

// Numbers every source's issues W1, W2, … so the AI can refer back to each one, and renders them
// grouped by the tool they came from. With a page, only that page of a timeline: the work just older than its `before`.
const gatherInspirationIssues = async (
  sources: readonly InspirationSourceInput[],
  teamId: string,
  viewerId: string,
  context: GQLContext,
  info: GraphQLResolveInfo,
  page: {before: Date | null} | null
) => {
  const before = page?.before ?? null
  const fetchedSources = await Promise.all(
    sources.map(async ({service, searchQuery}) => ({
      service,
      sourceIssues: await fetchIssues(service, searchQuery, teamId, viewerId, context, info, before)
    }))
  )
  const {nextBefore, pagedSources} = page
    ? pageInspirationIssues(fetchedSources, before)
    : {nextBefore: null, pagedSources: fetchedSources}
  let nextId = 1
  const numberedIssues = pagedSources.flatMap(({service, sourceIssues}) =>
    sourceIssues.map((issue): NumberedIssue => ({id: `W${nextId++}`, service, issue}))
  )
  const issuesText = pagedSources
    .filter(({sourceIssues}) => sourceIssues.length > 0)
    .map(({service, sourceIssues}) => {
      const ids = numberedIssues
        .filter((numberedIssue) => numberedIssue.service === service)
        .map(({id}) => id)
      return `## ${sourceLabel(service)}\n\n${formatIssuesForAI(sourceIssues, ids)}`
    })
    .join('\n\n')
  return {numberedIssues, issuesText, nextBefore}
}

export default gatherInspirationIssues
