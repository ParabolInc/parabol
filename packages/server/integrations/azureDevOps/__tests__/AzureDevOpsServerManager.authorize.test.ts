jest.mock('../../helpers/authorizeOAuth2', () => ({authorizeOAuth2: jest.fn()}))

import type {IntegrationProviderAzureDevOps} from '../../../postgres/types/IntegrationProvider'
import {authorizeOAuth2} from '../../helpers/authorizeOAuth2'
import AzureDevOpsServerManager, {type AzureDevOpsProfile} from '../AzureDevOpsServerManager'

const mockedAuthorize = authorizeOAuth2 as jest.MockedFunction<typeof authorizeOAuth2>

const provider = {
  clientId: 'cid',
  clientSecret: 'secret',
  tenantId: 'tid'
} as unknown as IntegrationProviderAzureDevOps

const azureDevOpsProfile: AzureDevOpsProfile = {
  id: 'ado-profile-id',
  displayName: 'Ada Lovelace',
  emailAddress: 'ada@example.com'
}

const stubFetch = (manager: AzureDevOpsServerManager, body: unknown) => {
  const calls: {url: string; init?: RequestInit}[] = []
  manager.fetch = (async (url: unknown, init?: RequestInit) => {
    calls.push({url: String(url), init})
    return new Response(JSON.stringify(body), {headers: {'Content-Type': 'application/json'}})
  }) as typeof manager.fetch
  return calls
}

describe('AzureDevOpsServerManager.authorize', () => {
  let getProfileSpy: jest.SpyInstance

  beforeEach(() => {
    mockedAuthorize.mockResolvedValue({
      accessToken: 'ado_at',
      refreshToken: 'r',
      scopes: 'vso.work_write',
      expiresIn: 3599
    })
    getProfileSpy = jest
      .spyOn(AzureDevOpsServerManager.prototype, 'getProfile')
      .mockResolvedValue(azureDevOpsProfile)
  })

  afterEach(() => {
    getProfileSpy.mockRestore()
  })

  it('returns the profile id as providerUserId', async () => {
    const manager = new AzureDevOpsServerManager(null, provider)
    await expect(manager.authorize('code', 'verifier')).resolves.toMatchObject({
      accessToken: 'ado_at',
      refreshToken: 'r',
      scopes: 'vso.work_write',
      providerUserId: 'ado-profile-id'
    })
    expect(getProfileSpy).toHaveBeenCalledTimes(1)
  })

  it('exchanges the code and its verifier at the tenant’s token endpoint', async () => {
    const manager = new AzureDevOpsServerManager(null, provider)
    await manager.authorize('code', 'verifier')
    expect(mockedAuthorize).toHaveBeenCalledWith({
      authUrl: 'https://login.microsoftonline.com/tid/oauth2/v2.0/token',
      contentType: 'application/x-www-form-urlencoded',
      body: {
        grant_type: 'authorization_code',
        code: 'code',
        code_verifier: 'verifier',
        redirect_uri: expect.stringMatching(/\/auth\/ado2$/),
        client_id: 'cid',
        client_secret: 'secret'
      }
    })
  })

  it('fails the connection when the profile lookup errors', async () => {
    getProfileSpy.mockResolvedValue(new Error('nope'))
    const manager = new AzureDevOpsServerManager(null, provider)
    await expect(manager.authorize('code', 'verifier')).resolves.toBeInstanceOf(Error)
  })

  it('fails the connection when the profile is missing', async () => {
    getProfileSpy.mockRestore()
    const manager = new AzureDevOpsServerManager(null, provider)
    stubFetch(manager, {})
    const res = await manager.authorize('code', 'verifier')
    expect(res).toBeInstanceOf(Error)
    expect(res).toHaveProperty('message', 'Azure DevOps: could not read the authorized user')
  })

  it('requires a code verifier', async () => {
    const manager = new AzureDevOpsServerManager(null, provider)
    await expect(manager.authorize('code', null)).resolves.toBeInstanceOf(Error)
    expect(mockedAuthorize).not.toHaveBeenCalled()
    expect(getProfileSpy).not.toHaveBeenCalled()
  })

  it('does not look up the profile when the token exchange fails', async () => {
    mockedAuthorize.mockResolvedValue(new Error('bad code'))
    const manager = new AzureDevOpsServerManager(null, provider)
    await expect(manager.authorize('code', 'verifier')).resolves.toBeInstanceOf(Error)
    expect(getProfileSpy).not.toHaveBeenCalled()
  })

  it('authorizes the profile request with the freshly minted access token', async () => {
    getProfileSpy.mockRestore()
    const manager = new AzureDevOpsServerManager(null, provider)
    const calls = stubFetch(manager, azureDevOpsProfile)
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
    expect(getProfileSpy).not.toHaveBeenCalled()
  })
})
