jest.mock('../../helpers/authorizeOAuth2', () => ({authorizeOAuth2: jest.fn()}))
jest.mock('../../../utils/AtlassianServerManager')

import AtlassianServerManager from '../../../utils/AtlassianServerManager'
import {makeOAuth2Redirect} from '../../../utils/makeOAuth2Redirect'
import {authorizeOAuth2} from '../../helpers/authorizeOAuth2'
import JiraOAuth2Manager from '../JiraOAuth2Manager'

const MockedManager = AtlassianServerManager as jest.MockedClass<typeof AtlassianServerManager>
const mockedAuthorize = authorizeOAuth2 as jest.MockedFunction<typeof authorizeOAuth2>

const jwtWithSub = (sub: string) =>
  `h.${Buffer.from(JSON.stringify({sub})).toString('base64url')}.s`

const grant = (overrides: Partial<{accessToken: string; refreshToken?: string; scopes?: string}>) =>
  mockedAuthorize.mockResolvedValue({
    accessToken: 'tok',
    refreshToken: 'r',
    scopes: 'read:jira-work read:jira-user write:jira-work offline_access',
    expiresIn: 3600,
    ...overrides
  })

describe('JiraOAuth2Manager', () => {
  const manager = new JiraOAuth2Manager('cid', 'secret', 'https://api.atlassian.com')

  beforeEach(() => {
    mockedAuthorize.mockReset()
    MockedManager.mockReset()
    MockedManager.prototype.getAccessibleResources = jest
      .fn()
      .mockResolvedValue([{id: 'cloud-1', scopes: ['read:jira-work']}])
    MockedManager.prototype.getMyself = jest.fn().mockResolvedValue({accountId: 'acct-1'})
  })

  it('posts client creds + code + the server-owned redirect URI to auth.atlassian.com', async () => {
    grant({})
    await manager.authorize('code')
    expect(mockedAuthorize).toHaveBeenCalledWith({
      authUrl: 'https://auth.atlassian.com/oauth/token',
      body: {
        grant_type: 'authorization_code',
        code: 'code',
        redirect_uri: makeOAuth2Redirect(),
        client_id: 'cid',
        client_secret: 'secret'
      }
    })
  })

  it('returns the tokens with accountId as providerUserId and cloudIds in meta', async () => {
    grant({})
    await expect(manager.authorize('code')).resolves.toEqual({
      accessToken: 'tok',
      refreshToken: 'r',
      scopes: 'read:jira-work read:jira-user write:jira-work offline_access',
      expiresIn: 3600,
      providerUserId: 'acct-1',
      meta: {cloudIds: ['cloud-1']}
    })
  })

  it('rejects a grant without a refresh token', async () => {
    grant({refreshToken: undefined})
    await expect(manager.authorize('code')).resolves.toBeInstanceOf(Error)
    expect(MockedManager.prototype.getAccessibleResources).not.toHaveBeenCalled()
  })

  it('falls back to the JWT sub for a Confluence-only grant', async () => {
    MockedManager.prototype.getAccessibleResources = jest
      .fn()
      .mockResolvedValue([{id: 'cloud-1', scopes: ['read:confluence-content.all']}])
    grant({
      accessToken: jwtWithSub('acct-conf'),
      scopes: 'read:confluence-content.all offline_access'
    })
    await expect(manager.authorize('code')).resolves.toMatchObject({
      providerUserId: 'acct-conf'
    })
    expect(MockedManager.prototype.getMyself).not.toHaveBeenCalled()
  })

  it('derives scopes from the sites when the token response omits them', async () => {
    MockedManager.prototype.getAccessibleResources = jest
      .fn()
      .mockResolvedValue([{id: 'cloud-1', scopes: ['read:confluence-content.all']}])
    grant({accessToken: jwtWithSub('acct'), scopes: undefined})
    await expect(manager.authorize('code')).resolves.toMatchObject({
      scopes: 'read:confluence-content.all offline_access'
    })
  })

  it('returns an Error when no site is accessible', async () => {
    MockedManager.prototype.getAccessibleResources = jest.fn().mockResolvedValue([])
    grant({})
    await expect(manager.authorize('code')).resolves.toBeInstanceOf(Error)
  })
})
