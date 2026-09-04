import type {IntegrationAccountProbeRow} from '../../../dataloader/integrationProbeLoaders'
import type {Integrationproviderserviceenum, Probematchtypeenum} from '../../../postgres/types/pg'
import {CipherId} from '../../../utils/CipherId'
import getDomainFromEmail from '../../../utils/getDomainFromEmail'
import type {DataLoaderWorker} from '../../graphql'
import type {SuggestedServiceResolvers} from '../resolverTypes'

export interface SuggestedServiceSource {
  id: number
  service: Integrationproviderserviceenum
  matchType: Probematchtypeenum
  evidence: Record<string, unknown>
  detectedAt: Date
}

const MATCH_RANK: Record<Probematchtypeenum, number> = {account: 1, organization: 0}

/**
 * Both of the viewer's subjects: their address, and their company's domain. Domain rows are
 * shared across everyone at that company, so they may already exist from a colleague's signup.
 */
export const loadSuggestedServiceRows = async (email: string, dataLoader: DataLoaderWorker) => {
  const domain = getDomainFromEmail(email)
  const loader = dataLoader.get('integrationAccountProbesBySubject')
  const [emailRows, domainRows] = await Promise.all([
    loader.load({subject: email, subjectType: 'email'}),
    domain ? loader.load({subject: domain, subjectType: 'domain'}) : Promise.resolve([])
  ])
  return {emailRows, domainRows}
}

/**
 * Project completed lookups into suggestions, keeping only positive matches — a `notFound` is not
 * a suggestion, and an `inconclusive` means we never got an answer.
 *
 * A service can be detected two ways (gitlab.com by email, self-hosted GitLab by domain), so
 * collapse to one suggestion per service and keep the strongest: an `account` match beats an
 * `organization` one, and a newer lookup beats an older one.
 */
export const toSuggestedServices = (
  rows: IntegrationAccountProbeRow[]
): SuggestedServiceSource[] => {
  const bestByService = new Map<Integrationproviderserviceenum, SuggestedServiceSource>()
  rows.forEach(({id, service, verdict, matchType, evidence, detectedAt}) => {
    if (verdict !== 'found' || !matchType || !detectedAt) return
    const candidate: SuggestedServiceSource = {
      id,
      service,
      matchType,
      evidence:
        evidence && typeof evidence === 'object' ? (evidence as Record<string, unknown>) : {},
      detectedAt
    }
    const incumbent = bestByService.get(service)
    if (
      !incumbent ||
      MATCH_RANK[matchType] > MATCH_RANK[incumbent.matchType] ||
      (MATCH_RANK[matchType] === MATCH_RANK[incumbent.matchType] &&
        detectedAt > incumbent.detectedAt)
    ) {
      bestByService.set(service, candidate)
    }
  })
  return [...bestByService.values()].sort((a, b) => {
    const byRank = MATCH_RANK[b.matchType] - MATCH_RANK[a.matchType]
    return byRank !== 0 ? byRank : a.service.localeCompare(b.service)
  })
}

const SuggestedService: SuggestedServiceResolvers = {
  id: ({id}) => CipherId.toClient(id, 'suggestedService'),
  evidence: ({evidence}) =>
    Object.entries(evidence)
      .filter(([, value]) => value !== null && value !== undefined)
      .map(([key, value]) => ({key, value: String(value)}))
}

export default SuggestedService
