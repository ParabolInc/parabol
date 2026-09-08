import type {IntegrationAccountProbeRow} from '../../../dataloader/integrationProbeLoaders'
import {toSuggestedServices} from '../../../graphql/public/types/SuggestedService'

let nextId = 1
const makeRow = (
  overrides: Partial<IntegrationAccountProbeRow> &
    Pick<IntegrationAccountProbeRow, 'service' | 'verdict'>
): IntegrationAccountProbeRow => ({
  id: nextId++,
  subject: 'someone@acme.com',
  subjectType: 'email',
  matchType: 'account',
  evidence: {},
  status: 'done',
  error: null,
  detectedAt: new Date('2026-09-01T00:00:00Z'),
  createdAt: new Date('2026-09-01T00:00:00Z'),
  updatedAt: new Date('2026-09-01T00:00:00Z'),
  ...overrides
})

test('keeps only positive matches', () => {
  const suggestions = toSuggestedServices([
    makeRow({service: 'github', verdict: 'found'}),
    makeRow({service: 'gitlab', verdict: 'notFound'}),
    makeRow({service: 'linear', verdict: 'inconclusive'})
  ])
  expect(suggestions.map(({service}) => service)).toEqual(['github'])
})

test('an account match outranks an organization match for the same service', () => {
  const suggestions = toSuggestedServices([
    makeRow({
      service: 'gitlab',
      verdict: 'found',
      matchType: 'organization',
      subjectType: 'domain'
    }),
    makeRow({service: 'gitlab', verdict: 'found', matchType: 'account'})
  ])
  expect(suggestions).toHaveLength(1)
  expect(suggestions[0]!.matchType).toBe('account')
})

test('the newer lookup wins between two matches of equal strength', () => {
  const older = new Date('2026-01-01T00:00:00Z')
  const newer = new Date('2026-08-01T00:00:00Z')
  const suggestions = toSuggestedServices([
    makeRow({service: 'jira', verdict: 'found', matchType: 'organization', detectedAt: older}),
    makeRow({
      service: 'jira',
      verdict: 'found',
      matchType: 'organization',
      detectedAt: newer,
      evidence: {siteUrl: 'https://acme.atlassian.net'}
    })
  ])
  expect(suggestions).toHaveLength(1)
  expect(suggestions[0]!.evidence).toEqual({siteUrl: 'https://acme.atlassian.net'})
})

test('drops rows that never completed, so a half-written row cannot become a suggestion', () => {
  const suggestions = toSuggestedServices([
    makeRow({service: 'github', verdict: 'found', matchType: null}),
    makeRow({service: 'jira', verdict: 'found', detectedAt: null})
  ])
  expect(suggestions).toEqual([])
})

test('account matches sort ahead of organization matches', () => {
  const suggestions = toSuggestedServices([
    makeRow({service: 'gcal', verdict: 'found', matchType: 'organization', subjectType: 'domain'}),
    makeRow({service: 'msTeams', verdict: 'found', matchType: 'account'})
  ])
  expect(suggestions.map(({service}) => service)).toEqual(['msTeams', 'gcal'])
})

test('non-object evidence degrades to an empty object rather than throwing', () => {
  const suggestions = toSuggestedServices([
    makeRow({service: 'github', verdict: 'found', evidence: 'not an object'})
  ])
  expect(suggestions[0]!.evidence).toEqual({})
})
