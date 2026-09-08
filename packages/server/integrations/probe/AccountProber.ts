import type {Integrationproviderserviceenum} from '../../postgres/types/pg'

export type ProbeSubjectType = 'email' | 'domain'
export type ProbeVerdict = 'found' | 'notFound' | 'inconclusive'

/**
 * account: the subject's own account was found on the service.
 * organization: only the subject's company was found to use the service, which says
 * nothing about whether this particular person has an account there.
 */
export type ProbeMatchType = 'account' | 'organization'

export type ProbeEvidence = Record<string, unknown>

export interface ProbeResult {
  verdict: ProbeVerdict
  evidence: ProbeEvidence
}

export interface AccountProber {
  service: Integrationproviderserviceenum
  subjectType: ProbeSubjectType
  matchType: ProbeMatchType
  /**
   * false when this deployment has no credentials for the lookup. A disabled prober records
   * `inconclusive` rather than an error, so a self-hosted install without vendor creds
   * degrades to the DNS-only probers instead of filling the table with failures.
   */
  isEnabled: () => boolean
  /**
   * Minimum gap between two outbound calls to this vendor across the whole fleet, enforced with a
   * Redis lock whose TTL is the gap. Set it for vendors with a tight published quota (GitHub
   * search allows 30/min); leave it off for DNS lookups and endpoints we self-host against.
   */
  minIntervalMs?: number
  probe: (subject: string) => Promise<ProbeResult>
}

export const notFound: ProbeResult = {verdict: 'notFound', evidence: {}}
export const inconclusive = (reason: string): ProbeResult => ({
  verdict: 'inconclusive',
  evidence: {reason}
})
