import type {RepoFetchCtx} from '../../platform/ServerIntegrationDefinition'
import AzureDevOpsServerManager, {NOT_SHARED_MESSAGE} from '../AzureDevOpsServerManager'
import getAzureDevOpsManager from '../getAzureDevOpsManager'

const ACME = 'dev.azure.com/acme'
const WEB_PROJECT_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'
const BILLING_PROJECT_ID = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e'
const WEB_ID = `${ACME}:${WEB_PROJECT_ID}`
const BILLING_ID = `${ACME}:${BILLING_PROJECT_ID}`

const loadAuth = jest.fn()
const loadProvider = jest.fn()
const loaders: Record<string, unknown> = {
  freshAzureDevOpsAuth: {load: loadAuth},
  integrationProviders: {loadNonNull: loadProvider}
}
const ctx = {
  teamId: 'team1',
  userId: 'user1',
  dataLoader: {get: (name: string) => loaders[name]}
} as unknown as RepoFetchCtx

const authWith = (meta: unknown, accessToken: string | null = 'access-token') => ({
  id: 7,
  providerId: 3,
  teamId: 'team1',
  userId: 'user1',
  accessToken,
  meta
})

const getManager = async () => {
  const manager = await getAzureDevOpsManager(ctx)
  if (!manager) throw new Error('expected a manager')
  return manager
}

describe('getAzureDevOpsManager', () => {
  beforeEach(() => {
    loadProvider.mockResolvedValue({id: 3, service: 'azureDevOps', tenantId: 'tid'})
  })

  it.each([
    ['no connection', null],
    ['a connection without a token', authWith({repoAccess: 'all'}, null)],
    ['a connection with an empty token', authWith({repoAccess: 'all'}, '')]
  ])('is null for %s, without loading a provider', async (_label, auth) => {
    loadAuth.mockResolvedValue(auth)
    await expect(getAzureDevOpsManager(ctx)).resolves.toBeNull()
    expect(loadAuth).toHaveBeenCalledWith({teamId: 'team1', userId: 'user1'})
    expect(loadProvider).not.toHaveBeenCalled()
  })

  it('is null when the connection’s provider belongs to another service', async () => {
    loadAuth.mockResolvedValue(authWith({repoAccess: 'all'}))
    loadProvider.mockResolvedValue({id: 3, service: 'jiraServer'})
    await expect(getAzureDevOpsManager(ctx)).resolves.toBeNull()
    expect(loadProvider).toHaveBeenCalledWith(3)
  })

  it.each([
    ['never chose what to share', null],
    ['stores something unreadable', 'all'],
    ['shares an empty selection', {repoAccess: 'selected', repos: []}]
  ])('reaches no project for a connection that %s', async (_label, meta) => {
    loadAuth.mockResolvedValue(authWith(meta))
    const manager = await getManager()
    expect(manager).toBeInstanceOf(AzureDevOpsServerManager)
    expect(manager.access.mode).toBe('selected')
    expect(manager.access.allows(WEB_ID)).toBe(false)
  })

  it('reaches only the projects stored on the connection', async () => {
    loadAuth.mockResolvedValue(
      authWith({repoAccess: 'selected', repos: [{id: WEB_ID, name: 'Web'}]})
    )
    const manager = await getManager()
    expect(manager.access.allows(WEB_ID)).toBe(true)
    expect(manager.access.allows(BILLING_ID)).toBe(false)
  })

  it('reaches every project for a connection that shares everything', async () => {
    loadAuth.mockResolvedValue(authWith({repoAccess: 'all'}))
    const manager = await getManager()
    expect(manager.access.mode).toBe('all')
    expect(manager.access.allows(BILLING_ID)).toBe(true)
  })

  it('builds a manager that enforces that access with the connection’s own token', async () => {
    loadAuth.mockResolvedValue(
      authWith({repoAccess: 'selected', repos: [{id: WEB_ID, name: 'Web'}]})
    )
    const manager = await getManager()
    const fetchMock = jest.fn<Promise<Response>, [string, RequestInit]>(
      async () =>
        new Response(JSON.stringify({value: []}), {headers: {'Content-Type': 'application/json'}})
    )
    manager.fetch = fetchMock as unknown as typeof manager.fetch

    const refused = await manager.listComments(ACME, BILLING_PROJECT_ID, '42', 5)
    expect(refused).toHaveProperty('message', NOT_SHARED_MESSAGE)
    expect(fetchMock).not.toHaveBeenCalled()

    await expect(manager.listFields(ACME, WEB_PROJECT_ID)).resolves.toEqual([])
    const headers = fetchMock.mock.calls[0]![1].headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer access-token')
  })
})
