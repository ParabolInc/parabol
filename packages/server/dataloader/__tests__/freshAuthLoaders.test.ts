import createOAuth2Manager from '../../integrations/platform/createOAuth2Manager'
import syncTeamMemberIntegrationAuthTokens from '../../postgres/queries/syncTeamMemberIntegrationAuthTokens'
import type {TeamMemberIntegrationAuth} from '../../postgres/types'
import {type FreshAuthKey, freshAuth} from '../freshAuthLoaders'
import handleAuthRefreshFailure from '../handleAuthRefreshFailure'
import type RootDataLoader from '../RootDataLoader'

jest.mock('../../integrations/platform/createOAuth2Manager')
jest.mock('../../postgres/queries/syncTeamMemberIntegrationAuthTokens')
jest.mock('../handleAuthRefreshFailure')
jest.mock('../../utils/logError')

const key = {service: 'gitlab' as const, teamId: 'team1', userId: 'user1'}
const provider = {id: 7, service: 'gitlab', authStrategy: 'oauth2'}

const makeParent = (auth: Partial<TeamMemberIntegrationAuth> | null) =>
  ({
    dataLoaderOptions: {},
    get: jest.fn((name: string) => {
      if (name === 'teamMemberIntegrationAuthsByServiceTeamAndUserId') {
        return {load: jest.fn().mockResolvedValue(auth)}
      }
      if (name === 'integrationProviders') {
        return {loadNonNull: jest.fn().mockResolvedValue(provider)}
      }
      throw new Error(`Unexpected loader ${name}`)
    })
  }) as unknown as RootDataLoader

const past = new Date(Date.now() - 60_000)
const expiredAuth = {
  id: 1,
  ...key,
  providerId: 7,
  providerUserId: null,
  accessToken: 'old',
  refreshToken: 'refresh-old',
  scopes: 'api',
  expiresAt: past
}

describe('freshAuth', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns a fresh row untouched', async () => {
    const auth = {...expiredAuth, expiresAt: new Date(Date.now() + 60_000)}
    await expect(freshAuth(makeParent(auth)).load(key)).resolves.toBe(auth)
    expect(createOAuth2Manager).not.toHaveBeenCalled()
  })

  it('keys the cache by service, so one team member can hold many auths', async () => {
    const freshRow = {...expiredAuth, expiresAt: new Date(Date.now() + 60_000)}
    const load = jest.fn((key: FreshAuthKey) => Promise.resolve({...freshRow, ...key}))
    const parent = {
      dataLoaderOptions: {},
      get: jest.fn((name: string) => {
        if (name === 'teamMemberIntegrationAuthsByServiceTeamAndUserId') return {load}
        throw new Error(`Unexpected loader ${name}`)
      })
    } as unknown as RootDataLoader
    const loader = freshAuth(parent)
    const [gcal, gitlab] = await Promise.all([
      loader.load({service: 'gcal', teamId: 'team1', userId: 'user1'}),
      loader.load({service: 'gitlab', teamId: 'team1', userId: 'user1'})
    ])
    expect(gcal?.service).toBe('gcal')
    expect(gitlab?.service).toBe('gitlab')
    expect(load).toHaveBeenCalledTimes(2)
  })

  it('returns null when there is no row', async () => {
    await expect(freshAuth(makeParent(null)).load(key)).resolves.toBeNull()
  })

  it('refreshes an expired row, keeping the old refresh token when none is rotated', async () => {
    ;(createOAuth2Manager as jest.Mock).mockReturnValue({
      refresh: jest.fn().mockResolvedValue({accessToken: 'new', expiresIn: 3600})
    })
    const result = await freshAuth(makeParent(expiredAuth)).load(key)
    expect(result).toMatchObject({accessToken: 'new', refreshToken: 'refresh-old', scopes: 'api'})
    expect(result?.expiresAt?.getTime()).toBeGreaterThan(Date.now())
    expect(syncTeamMemberIntegrationAuthTokens).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user1',
        teamId: 'team1',
        providerId: 7,
        providerUserId: null,
        accessToken: 'new',
        refreshToken: 'refresh-old'
      })
    )
  })

  it('stores a rotated refresh token', async () => {
    ;(createOAuth2Manager as jest.Mock).mockReturnValue({
      refresh: jest.fn().mockResolvedValue({accessToken: 'new', refreshToken: 'refresh-new'})
    })
    const result = await freshAuth(makeParent(expiredAuth)).load(key)
    expect(result?.refreshToken).toBe('refresh-new')
  })

  it('hands a failed refresh to handleAuthRefreshFailure and returns null', async () => {
    const error = new Error('invalid_grant')
    ;(createOAuth2Manager as jest.Mock).mockReturnValue({
      refresh: jest.fn().mockResolvedValue(error)
    })
    await expect(freshAuth(makeParent(expiredAuth)).load(key)).resolves.toBeNull()
    expect(handleAuthRefreshFailure).toHaveBeenCalledWith(error, expiredAuth)
    expect(syncTeamMemberIntegrationAuthTokens).not.toHaveBeenCalled()
  })

  it('returns an expired row as stored when the provider has no OAuth2 manager', async () => {
    ;(createOAuth2Manager as jest.Mock).mockReturnValue(null)
    await expect(freshAuth(makeParent(expiredAuth)).load(key)).resolves.toBe(expiredAuth)
  })

  it('returns null and logs when an expired row has no refresh token', async () => {
    const auth = {...expiredAuth, refreshToken: null}
    await expect(freshAuth(makeParent(auth)).load(key)).resolves.toBeNull()
    expect(createOAuth2Manager).not.toHaveBeenCalled()
  })
})
