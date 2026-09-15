import '../../../../../scripts/webpack/utils/dotenv'
import {getNewDataLoader} from '../../../dataloader/getNewDataLoader'
import getKysely from '../../../postgres/getKysely'
import type {AccountProber} from '../AccountProber'

const mockProbe = jest.fn()
const mockDomainProbe = jest.fn()

jest.mock('../proberRegistry', () => ({
  proberRegistry: [
    {
      service: 'github',
      subjectType: 'email',
      matchType: 'account',
      isEnabled: () => true,
      probe: (subject: string) => mockProbe(subject)
    },
    {
      service: 'jira',
      subjectType: 'domain',
      matchType: 'organization',
      isEnabled: () => true,
      probe: (subject: string) => mockDomainProbe(subject)
    }
  ] satisfies AccountProber[]
}))

const EMAIL = 'probe-test@parabol.fun'
const FREEMAIL = 'probe-test@gmail.com'
const dataLoader = getNewDataLoader('test')
const pg = getKysely()

const getRows = (subject: string) =>
  pg.selectFrom('IntegrationAccountProbe').selectAll().where('subject', '=', subject).execute()

const cleanup = () =>
  pg
    .deleteFrom('IntegrationAccountProbe')
    .where('subject', 'in', [EMAIL, FREEMAIL, 'parabol.fun', 'gmail.com'])
    .execute()

beforeEach(async () => {
  process.env.SUGGESTED_SERVICES_ENABLED = 'true'
  await cleanup()
})

afterAll(async () => {
  await cleanup()
  dataLoader.dispose()
})

test('records a match with its evidence', async () => {
  mockProbe.mockResolvedValue({verdict: 'found', evidence: {login: 'octocat'}})
  mockDomainProbe.mockResolvedValue({verdict: 'notFound', evidence: {}})

  const detectServicesForUser = (await import('../detectServicesForUser')).default
  const found = await detectServicesForUser('user1', EMAIL, dataLoader)

  expect(found).toBe(1)
  const rows = await getRows(EMAIL)
  expect(rows).toHaveLength(1)
  expect(rows[0]).toMatchObject({
    service: 'github',
    verdict: 'found',
    matchType: 'account',
    status: 'done',
    evidence: {login: 'octocat'}
  })
  expect(rows[0]!.detectedAt).toBeInstanceOf(Date)
})

test('a prober that throws leaves the row retryable, never stuck at running', async () => {
  mockProbe.mockRejectedValue(new Error('vendor exploded'))
  mockDomainProbe.mockResolvedValue({verdict: 'notFound', evidence: {}})

  const detectServicesForUser = (await import('../detectServicesForUser')).default
  await detectServicesForUser('user1', EMAIL, dataLoader)

  const rows = await getRows(EMAIL)
  expect(rows).toHaveLength(1)
  expect(rows[0]!.status).toBe('error')
  expect(rows[0]!.error).toBe('vendor exploded')
})

test('a completed lookup is never repeated', async () => {
  mockProbe.mockResolvedValue({verdict: 'notFound', evidence: {}})
  mockDomainProbe.mockResolvedValue({verdict: 'notFound', evidence: {}})

  const detectServicesForUser = (await import('../detectServicesForUser')).default
  await detectServicesForUser('user1', EMAIL, dataLoader)
  expect(mockProbe).toHaveBeenCalledTimes(1)

  await detectServicesForUser('user1', EMAIL, dataLoader)
  expect(mockProbe).toHaveBeenCalledTimes(1)
})

test('a freemail address gets no domain lookup', async () => {
  mockProbe.mockResolvedValue({verdict: 'notFound', evidence: {}})
  mockDomainProbe.mockResolvedValue({verdict: 'found', evidence: {}})

  const detectServicesForUser = (await import('../detectServicesForUser')).default
  await detectServicesForUser('user1', FREEMAIL, dataLoader)

  expect(mockProbe).toHaveBeenCalledWith(FREEMAIL)
  expect(mockDomainProbe).not.toHaveBeenCalled()
})

test('a company domain is looked up under the domain, not the address', async () => {
  mockProbe.mockResolvedValue({verdict: 'notFound', evidence: {}})
  mockDomainProbe.mockResolvedValue({verdict: 'found', evidence: {siteUrl: 'https://x'}})

  const detectServicesForUser = (await import('../detectServicesForUser')).default
  await detectServicesForUser('user1', EMAIL, dataLoader)

  expect(mockDomainProbe).toHaveBeenCalledWith('parabol.fun')
  const domainRows = await getRows('parabol.fun')
  expect(domainRows).toHaveLength(1)
  expect(domainRows[0]).toMatchObject({subjectType: 'domain', verdict: 'found'})
})

test('the kill switch stops every outbound lookup', async () => {
  process.env.SUGGESTED_SERVICES_ENABLED = 'false'
  mockProbe.mockResolvedValue({verdict: 'found', evidence: {}})

  const detectServicesForUser = (await import('../detectServicesForUser')).default
  const found = await detectServicesForUser('user1', EMAIL, dataLoader)

  expect(found).toBe(0)
  expect(mockProbe).not.toHaveBeenCalled()
  expect(await getRows(EMAIL)).toHaveLength(0)
})
