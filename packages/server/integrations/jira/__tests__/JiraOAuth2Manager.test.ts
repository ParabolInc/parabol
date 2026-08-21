jest.mock('../../helpers/authorizeOAuth2', () => ({authorizeOAuth2: jest.fn()}))
jest.mock('../../../utils/AtlassianServerManager')

import AtlassianServerManager from '../../../utils/AtlassianServerManager'
import {authorizeOAuth2} from '../../helpers/authorizeOAuth2'
import JiraOAuth2Manager from '../JiraOAuth2Manager'

const MockedManager = AtlassianServerManager as jest.MockedClass<typeof AtlassianServerManager>
const mockedAuthorize = authorizeOAuth2 as jest.MockedFunction<typeof authorizeOAuth2>

const jwtWithSub = (sub: string) =>
  `h.${Buffer.from(JSON.stringify({sub})).toString('base64url')}.s`

describe('JiraOAuth2Manager', () => {
  const manager = new JiraOAuth2Manager('cid', 'secret', 'https://api.atlassian.com')

  beforeEach(() => {
    mockedAuthorize.mockReset()
    MockedManager.mockReset()
  })

  it('authorize posts client creds + code as a form body to auth.atlassian.com', async () => {
    mockedAuthorize.mockResolvedValue({
      accessToken: 'a',
      refreshToken: 'r',
      scopes: 'read:jira-work',
      expiresIn: 3600
    })
    await manager.authorize('code', 'https://redirect')
    expect(mockedAuthorize).toHaveBeenCalledWith({
      authUrl: 'https://auth.atlassian.com/oauth/token',
      body: {
        grant_type: 'authorization_code',
        code: 'code',
        redirect_uri: 'https://redirect',
        client_id: 'cid',
        client_secret: 'secret'
      }
    })
  })

  it('afterAuthorize returns accountId as providerUserId and cloudIds in meta', async () => {
    MockedManager.prototype.getAccessibleResources = jest
      .fn()
      .mockResolvedValue([{id: 'cloud-1', scopes: ['read:jira-work']}])
    MockedManager.prototype.getMyself = jest.fn().mockResolvedValue({accountId: 'acct-1'})
    const patch = await manager.afterAuthorize({
      accessToken: 'tok',
      refreshToken: 'r',
      scopes: 'read:jira-work read:jira-user write:jira-work offline_access'
    })
    expect(patch).toEqual({
      providerUserId: 'acct-1',
      meta: {cloudIds: ['cloud-1']},
      scopes: 'read:jira-work read:jira-user write:jira-work offline_access'
    })
  })

  it('afterAuthorize rejects a grant without a refresh token', async () => {
    MockedManager.prototype.getAccessibleResources = jest.fn()
    const patch = await manager.afterAuthorize({
      accessToken: 'tok',
      refreshToken: undefined,
      scopes: 'read:jira-work'
    })
    expect(patch).toBeInstanceOf(Error)
    expect(MockedManager.prototype.getAccessibleResources).not.toHaveBeenCalled()
  })

  it('afterAuthorize falls back to the JWT sub for a Confluence-only grant', async () => {
    MockedManager.prototype.getAccessibleResources = jest
      .fn()
      .mockResolvedValue([{id: 'cloud-1', scopes: ['read:confluence-content.all']}])
    const patch = await manager.afterAuthorize({
      accessToken: jwtWithSub('acct-conf'),
      refreshToken: 'r',
      scopes: 'read:confluence-content.all offline_access'
    })
    expect(patch).toMatchObject({providerUserId: 'acct-conf'})
  })

  it('afterAuthorize derives scopes from the sites when the token response omits them', async () => {
    MockedManager.prototype.getAccessibleResources = jest
      .fn()
      .mockResolvedValue([{id: 'cloud-1', scopes: ['read:confluence-content.all']}])
    const patch = await manager.afterAuthorize({
      accessToken: jwtWithSub('acct'),
      refreshToken: 'r',
      scopes: undefined as unknown as string
    })
    expect(patch).toMatchObject({scopes: 'read:confluence-content.all offline_access'})
  })

  it('afterAuthorize returns an Error when no site is accessible', async () => {
    MockedManager.prototype.getAccessibleResources = jest.fn().mockResolvedValue([])
    const patch = await manager.afterAuthorize({accessToken: 'tok', refreshToken: 'r', scopes: ''})
    expect(patch).toBeInstanceOf(Error)
  })
})
