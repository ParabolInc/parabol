import type {GraphQLResolveInfo} from 'graphql'
import {
  type InspirationIssue,
  MAX_ISSUES,
  TIMELINE_PAGE_SIZE
} from '../../../../integrations/platform/InspirationIssue'
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

// Renders issues for the AI, grouped by the tool they came from, each labeled with its id
export const formatNumberedIssues = (numberedIssues: readonly NumberedIssue[]) => {
  const services = [...new Set(numberedIssues.map(({service}) => service))]
  return services
    .map((service) => {
      const sourceIssues = numberedIssues.filter(
        (numberedIssue) => numberedIssue.service === service
      )
      return `## ${sourceLabel(service)}\n\n${formatIssuesForAI(
        sourceIssues.map(({issue}) => issue),
        sourceIssues.map(({id}) => id)
      )}`
    })
    .join('\n\n')
}

// Numbers every source's issues W1, W2, … so the AI can refer back to each one. With a page, only
// that page of a retro's timeline: the work just older than its `before`.
const gatherInspirationIssues = async (
  sources: readonly InspirationSourceInput[],
  teamId: string,
  viewerId: string,
  context: GQLContext,
  info: GraphQLResolveInfo,
  page: {before: Date | null} | null
) => {
  const issuePage = page
    ? {before: page.before, first: TIMELINE_PAGE_SIZE}
    : {before: null, first: MAX_ISSUES}
  const fetchedSources = await Promise.all(
    sources.map(async ({service, searchQuery}) => ({
      service,
      sourceIssues: await fetchIssues(
        service,
        searchQuery,
        teamId,
        viewerId,
        context,
        info,
        issuePage
      )
    }))
  )
  const {nextBefore, pagedSources} = page
    ? pageInspirationIssues(fetchedSources, issuePage)
    : {nextBefore: null, pagedSources: fetchedSources}
  let nextId = 1
  const numberedIssues = pagedSources.flatMap(({service, sourceIssues}) =>
    sourceIssues.map((issue): NumberedIssue => ({id: `W${nextId++}`, service, issue}))
  )
  return {numberedIssues, nextBefore}
}

export default gatherInspirationIssues
