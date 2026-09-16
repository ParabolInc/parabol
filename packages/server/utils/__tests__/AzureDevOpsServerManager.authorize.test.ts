jest.mock('../../integrations/helpers/authorizeOAuth2', () => ({authorizeOAuth2: jest.fn()}))

import {authorizeOAuth2} from '../../integrations/helpers/authorizeOAuth2'
import type {IntegrationProviderAzureDevOps} from '../../postgres/types/IntegrationProvider'
import AzureDevOpsServerManager, {type AzureDevOpsUser} from '../AzureDevOpsServerManager'

const mockedAuthorize = authorizeOAuth2 as jest.MockedFunction<typeof authorizeOAuth2>

const provider = {
  clientId: 'cid',
  clientSecret: 'secret',
  tenantId: 'tid'
} as unknown as IntegrationProviderAzureDevOps

const azureDevOpsUser = {id: 'ado-profile-id'} as AzureDevOpsUser

describe('AzureDevOpsServerManager.authorize', () => {
  let getMeSpy: jest.SpyInstance

  beforeEach(() => {
    mockedAuthorize.mockResolvedValue({
      accessToken: 'ado_at',
      refreshToken: 'r',
      scopes: 'vso.work_write',
      expiresIn: 3599
    })
    getMeSpy = jest
      .spyOn(AzureDevOpsServerManager.prototype, 'getMe')
      .mockResolvedValue({error: undefined, azureDevOpsUser})
  })

  afterEach(() => {
    getMeSpy.mockRestore()
  })

  it('returns the profile id as providerUserId', async () => {
    const manager = new AzureDevOpsServerManager(null, provider)
    await expect(manager.authorize('code', 'verifier')).resolves.toMatchObject({
      accessToken: 'ado_at',
      refreshToken: 'r',
      scopes: 'vso.work_write',
      providerUserId: 'ado-profile-id'
    })
    expect(getMeSpy).toHaveBeenCalledTimes(1)
  })

  it('fails the connection when the profile lookup errors', async () => {
    getMeSpy.mockResolvedValue({error: new Error('nope'), azureDevOpsUser: undefined})
    const manager = new AzureDevOpsServerManager(null, provider)
    await expect(manager.authorize('code', 'verifier')).resolves.toBeInstanceOf(Error)
  })

  it('fails the connection when the profile is missing', async () => {
    getMeSpy.mockResolvedValue({error: undefined, azureDevOpsUser: undefined})
    const manager = new AzureDevOpsServerManager(null, provider)
    await expect(manager.authorize('code', 'verifier')).resolves.toBeInstanceOf(Error)
  })

  it('requires a code verifier', async () => {
    const manager = new AzureDevOpsServerManager(null, provider)
    await expect(manager.authorize('code', null)).resolves.toBeInstanceOf(Error)
    expect(getMeSpy).not.toHaveBeenCalled()
  })

  it('does not look up the profile when the token exchange fails', async () => {
    mockedAuthorize.mockResolvedValue(new Error('bad code'))
    const manager = new AzureDevOpsServerManager(null, provider)
    await expect(manager.authorize('code', 'verifier')).resolves.toBeInstanceOf(Error)
    expect(getMeSpy).not.toHaveBeenCalled()
  })

  it('authorizes the profile request with the freshly minted access token', async () => {
    getMeSpy.mockRestore()
    const manager = new AzureDevOpsServerManager(null, provider)
    const calls: {url: string; init?: RequestInit}[] = []
    manager.fetch = (async (url: unknown, init?: RequestInit) => {
      calls.push({url: String(url), init})
      return new Response(JSON.stringify(azureDevOpsUser), {
        headers: {'Content-Type': 'application/json'}
      })
    }) as typeof manager.fetch
    await expect(manager.authorize('code', 'verifier')).resolves.toMatchObject({
      providerUserId: 'ado-profile-id'
    })
    expect(calls[0]!.url).toBe(
      'https://app.vssps.visualstudio.com/_apis/profile/profiles/me?api-version=7.1'
    )
    expect((calls[0]!.init!.headers as Record<string, string>)['Authorization']).toBe(
      'Bearer ado_at'
    )
  })

  it('refresh does not look up the profile', async () => {
    const manager = new AzureDevOpsServerManager(null, provider)
    await manager.refresh('r')
    expect(getMeSpy).not.toHaveBeenCalled()
  })
})
