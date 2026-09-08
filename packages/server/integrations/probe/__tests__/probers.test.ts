import dns from 'dns/promises'
import {fetchUntrusted} from '../../../utils/fetchUntrusted'
import {AtlassianSiteProber} from '../AtlassianSiteProber'
import {GitHubEmailProber} from '../GitHubEmailProber'
import {GitLabEmailProber} from '../GitLabEmailProber'
import {JiraServerDnsProber} from '../JiraServerDnsProber'
import {MattermostDnsProber} from '../MattermostDnsProber'
import {MSTeamsRealmProber} from '../MSTeamsRealmProber'
import probeFetchJson from '../probeFetchJson'

// Explicit factories, not automocks: fetchUntrusted reads the __APP_VERSION__ build global at
// module scope, so the real module must never be evaluated here.
jest.mock('../probeFetchJson', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../../../utils/fetchUntrusted', () => ({fetchUntrusted: jest.fn()}))
jest.mock('dns/promises', () => ({__esModule: true, default: {resolveMx: jest.fn()}}))

const mockFetchJson = probeFetchJson as jest.MockedFunction<typeof probeFetchJson>
const mockFetchUntrusted = fetchUntrusted as jest.MockedFunction<typeof fetchUntrusted>
const mockResolveMx = dns.resolveMx as jest.MockedFunction<typeof dns.resolveMx>

const asBody = (json: unknown, status = 200) => ({status, json})
const asDocument = (json: unknown) => ({
  buffer: Buffer.from(JSON.stringify(json)),
  contentType: 'application/json',
  size: 0
})

describe('GitHubEmailProber', () => {
  beforeEach(() => {
    process.env.GITHUB_LOOKUP_TOKEN = 'token'
  })
  afterEach(() => {
    delete process.env.GITHUB_LOOKUP_TOKEN
  })

  test('reports the matched login', async () => {
    mockFetchJson.mockResolvedValue(
      asBody({total_count: 1, items: [{login: 'octocat', html_url: 'https://github.com/octocat'}]})
    )
    const result = await GitHubEmailProber.probe('someone@acme.com')
    expect(result.verdict).toBe('found')
    expect(result.evidence).toEqual({
      login: 'octocat',
      profileUrl: 'https://github.com/octocat'
    })
  })

  test('an empty result set is a real negative', async () => {
    mockFetchJson.mockResolvedValue(asBody({total_count: 0, items: []}))
    expect((await GitHubEmailProber.probe('someone@acme.com')).verdict).toBe('notFound')
  })

  test('a spent rate limit is inconclusive, never a negative', async () => {
    mockFetchJson.mockResolvedValue(asBody({message: 'rate limited'}, 403))
    expect((await GitHubEmailProber.probe('someone@acme.com')).verdict).toBe('inconclusive')
  })

  test('a failed request is inconclusive', async () => {
    mockFetchJson.mockResolvedValue(null)
    expect((await GitHubEmailProber.probe('someone@acme.com')).verdict).toBe('inconclusive')
  })

  test('a malformed 200 does not crash', async () => {
    mockFetchJson.mockResolvedValue(asBody({total_count: 3, items: [{}]}))
    expect((await GitHubEmailProber.probe('someone@acme.com')).verdict).toBe('notFound')
  })

  test('without a token it is disabled and reports inconclusive', async () => {
    delete process.env.GITHUB_LOOKUP_TOKEN
    expect(GitHubEmailProber.isEnabled()).toBe(false)
    expect((await GitHubEmailProber.probe('someone@acme.com')).verdict).toBe('inconclusive')
    expect(mockFetchJson).not.toHaveBeenCalled()
  })
})

describe('GitLabEmailProber', () => {
  beforeEach(() => {
    process.env.GITLAB_LOOKUP_TOKEN = 'token'
  })
  afterEach(() => {
    delete process.env.GITLAB_LOOKUP_TOKEN
  })

  test('reports the matched username', async () => {
    mockFetchJson.mockResolvedValue(
      asBody([{username: 'octo', web_url: 'https://gitlab.com/octo'}])
    )
    const result = await GitLabEmailProber.probe('someone@acme.com')
    expect(result.verdict).toBe('found')
    expect(result.evidence).toEqual({username: 'octo', profileUrl: 'https://gitlab.com/octo'})
  })

  test('an empty array is a real negative', async () => {
    mockFetchJson.mockResolvedValue(asBody([]))
    expect((await GitLabEmailProber.probe('someone@acme.com')).verdict).toBe('notFound')
  })
})

describe('MSTeamsRealmProber', () => {
  test('a managed tenant is a match', async () => {
    mockFetchJson.mockResolvedValue(
      asBody({NameSpaceType: 'Managed', DomainName: 'acme.com', FederationBrandName: 'Acme'})
    )
    const result = await MSTeamsRealmProber.probe('someone@acme.com')
    expect(result.verdict).toBe('found')
    expect(result.evidence).toMatchObject({nameSpaceType: 'Managed', domainName: 'acme.com'})
  })

  test('an unknown namespace means no Microsoft account', async () => {
    mockFetchJson.mockResolvedValue(asBody({NameSpaceType: 'Unknown'}))
    expect((await MSTeamsRealmProber.probe('nobody@nowhere.example')).verdict).toBe('notFound')
  })
})

describe('AtlassianSiteProber', () => {
  test('a reachable status document is a match', async () => {
    mockFetchUntrusted.mockResolvedValue(asDocument({state: 'RUNNING'}))
    const result = await AtlassianSiteProber.probe('acme.com')
    expect(result.verdict).toBe('found')
    expect(result.evidence).toEqual({siteUrl: 'https://acme.atlassian.net', state: 'RUNNING'})
  })

  test('a 200 that is not the status document is a parked page, not a site', async () => {
    mockFetchUntrusted.mockResolvedValue({
      buffer: Buffer.from('<html>nope</html>'),
      contentType: 'text/html',
      size: 0
    })
    expect((await AtlassianSiteProber.probe('acme.com')).verdict).toBe('notFound')
  })

  test('an unreachable site is a negative', async () => {
    mockFetchUntrusted.mockResolvedValue(null)
    expect((await AtlassianSiteProber.probe('acme.com')).verdict).toBe('notFound')
  })
})

describe('self-hosted probers', () => {
  test('Jira Data Center is identified by its serverInfo document', async () => {
    mockFetchUntrusted.mockResolvedValue(
      asDocument({version: '9.4.0', baseUrl: 'https://jira.acme.com', serverTitle: 'Acme Jira'})
    )
    const result = await JiraServerDnsProber.probe('acme.com')
    expect(result.verdict).toBe('found')
    expect(result.evidence).toMatchObject({baseUrl: 'https://jira.acme.com', version: '9.4.0'})
  })

  test('a JSON response from something that is not Jira is rejected', async () => {
    mockFetchUntrusted.mockResolvedValue(asDocument({hello: 'world'}))
    expect((await JiraServerDnsProber.probe('acme.com')).verdict).toBe('notFound')
  })

  test('Mattermost is identified by its ping document', async () => {
    mockFetchUntrusted.mockResolvedValue(asDocument({status: 'OK'}))
    expect((await MattermostDnsProber.probe('acme.com')).verdict).toBe('found')
  })

  // The hostname is assembled from a user-controlled email domain, so this is the SSRF boundary.
  describe('SSRF guard', () => {
    test('routes every request through fetchUntrusted, never a bare fetch', async () => {
      mockFetchUntrusted.mockResolvedValue(null)
      await JiraServerDnsProber.probe('acme.com')
      expect(mockFetchUntrusted).toHaveBeenCalledWith(
        'https://jira.acme.com/rest/api/2/serverInfo',
        expect.any(Number)
      )
    })

    test.each([
      ['localhost', 'no dot, so not a public domain'],
      ['acme.com:8080', 'a port is not part of a hostname'],
      ['acme.com/../evil', 'path traversal'],
      ['-acme.com', 'a label may not start with a hyphen'],
      ['', 'empty'],
      ['acme .com', 'whitespace']
    ])('refuses %s before making any request', async (domain) => {
      mockFetchUntrusted.mockResolvedValue(asDocument({status: 'OK'}))
      const result = await MattermostDnsProber.probe(domain)
      expect(result.verdict).toBe('notFound')
      expect(mockFetchUntrusted).not.toHaveBeenCalled()
    })
  })
})

describe('GcalWorkspaceProber', () => {
  test('Google-hosted MX is a match', async () => {
    mockResolveMx.mockResolvedValue([
      {exchange: 'ALT1.ASPMX.L.GOOGLE.COM', priority: 10},
      {exchange: 'mail.acme.com', priority: 20}
    ])
    // imported lazily so the dns mock is installed first
    const {GcalWorkspaceProber} = await import('../GcalWorkspaceProber')
    const result = await GcalWorkspaceProber.probe('acme.com')
    expect(result.verdict).toBe('found')
    expect(result.evidence).toEqual({mxHost: 'ALT1.ASPMX.L.GOOGLE.COM'})
  })

  test('a domain with no MX records at all is a negative, not an error', async () => {
    const notFoundError = new Error('queryMx ENOTFOUND') as NodeJS.ErrnoException
    notFoundError.code = 'ENOTFOUND'
    mockResolveMx.mockRejectedValue(notFoundError)
    const {GcalWorkspaceProber} = await import('../GcalWorkspaceProber')
    expect((await GcalWorkspaceProber.probe('nowhere.example')).verdict).toBe('notFound')
  })

  test('a resolver failure is inconclusive, not a negative', async () => {
    const serverError = new Error('queryMx ESERVFAIL') as NodeJS.ErrnoException
    serverError.code = 'ESERVFAIL'
    mockResolveMx.mockRejectedValue(serverError)
    const {GcalWorkspaceProber} = await import('../GcalWorkspaceProber')
    expect((await GcalWorkspaceProber.probe('acme.com')).verdict).toBe('inconclusive')
  })
})
