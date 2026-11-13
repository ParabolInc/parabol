import {fetch, Response} from '@whatwg-node/fetch'
import {authorizeOAuth2} from '../../integrations/helpers/authorizeOAuth2'
import getKysely from '../../postgres/getKysely'
import deactivateTeamMemberIntegrationAuthFamily from '../../postgres/queries/deactivateTeamMemberIntegrationAuthFamily'
import {selectTeamMemberIntegrationAuth} from '../../postgres/select'
import {Logger} from '../../utils/Logger'
import logError from '../../utils/logError'
import {OAuth2TokenError} from '../../utils/OAuth2TokenError'
import {ThirdPartyResponseError} from '../../utils/ThirdPartyResponseError'
import handleAuthRefreshFailure from '../handleAuthRefreshFailure'

jest.mock('@whatwg-node/fetch', () => ({
  ...jest.requireActual<typeof import('@whatwg-node/fetch')>('@whatwg-node/fetch'),
  fetch: jest.fn()
}))
jest.mock('../../postgres/getKysely')
jest.mock('../../postgres/queries/deactivateTeamMemberIntegrationAuthFamily', () => {
  const actual = jest.requireActual<
    typeof import('../../postgres/queries/deactivateTeamMemberIntegrationAuthFamily')
  >('../../postgres/queries/deactivateTeamMemberIntegrationAuthFamily')
  return {__esModule: true, default: jest.fn(actual.default)}
})
jest.mock('../../postgres/select', () => ({selectTeamMemberIntegrationAuth: jest.fn()}))
jest.mock('../../utils/logError')

const auth = {
  id: 42,
  userId: 'user1',
  teamId: 'team1',
  providerId: 7,
  providerUserId: null,
  service: 'gcal' as const,
  accessToken: 'old'
}

const mockSelect = (row: {accessToken: string} | undefined) => {
  const chain = {where: jest.fn(), executeTakeFirst: jest.fn().mockResolvedValue(row)}
  chain.where.mockReturnValue(chain)
  ;(selectTeamMemberIntegrationAuth as jest.Mock).mockReturnValue(chain)
  return chain
}

const mockUpdateChain = () => {
  const chain = {
    updateTable: jest.fn(),
    set: jest.fn(),
    where: jest.fn(),
    $if: jest.fn(),
    execute: jest.fn().mockResolvedValue(undefined)
  }
  chain.updateTable.mockReturnValue(chain)
  chain.set.mockReturnValue(chain)
  chain.where.mockReturnValue(chain)
  chain.$if.mockImplementation((cond: boolean, cb: (qb: typeof chain) => typeof chain) =>
    cond ? cb(chain) : chain
  )
  ;(getKysely as jest.Mock).mockReturnValue(chain)
  return chain
}

describe('handleAuthRefreshFailure', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns the row a concurrent refresh already rotated without logging or disconnecting', async () => {
    const chain = mockUpdateChain()
    const winner = {...auth, accessToken: 'new'}
    mockSelect(winner)
    await expect(handleAuthRefreshFailure(new Error('invalid_grant'), auth)).resolves.toBe(winner)
    expect(chain.updateTable).not.toHaveBeenCalled()
    expect(logError).not.toHaveBeenCalled()
  })

  it('logs with user and team/service tags and disconnects when the provider rejects our client', async () => {
    const chain = mockUpdateChain()
    mockSelect({...auth})
    const error = new OAuth2TokenError('Unauthorized', 'invalid_client')
    await expect(handleAuthRefreshFailure(error, auth)).resolves.toBeNull()
    expect(logError).toHaveBeenCalledWith(error, {
      userId: 'user1',
      tags: {teamId: 'team1', service: 'gcal'}
    })
    expect(chain.updateTable).toHaveBeenCalledWith('TeamMemberIntegrationAuth')
    expect(chain.set).toHaveBeenCalledWith({isActive: false, expiredAt: expect.anything()})
    expect(chain.where).toHaveBeenCalledWith('userId', '=', 'user1')
    expect(chain.where).toHaveBeenCalledWith('providerId', '=', 7)
    expect(chain.where).toHaveBeenCalledWith('teamId', '=', 'team1')
    expect(chain.execute).toHaveBeenCalledTimes(1)
  })

  it('disconnects without logging an error when the provider says the grant is dead', async () => {
    mockUpdateChain()
    mockSelect({...auth})
    const logInfo = jest.spyOn(Logger, 'info').mockImplementation(() => {})
    jest.mocked(fetch).mockResolvedValue(
      new Response(
        '{"error":"unauthorized_client","error_description":"Token was globally revoked"}',
        {
          status: 403,
          headers: {'content-type': 'application/json'}
        }
      )
    )
    const error = await authorizeOAuth2({authUrl: 'https://auth.atlassian.com/oauth/token'})
    await expect(handleAuthRefreshFailure(error as Error, auth)).resolves.toBeNull()
    expect(logError).not.toHaveBeenCalled()
    expect(logInfo).toHaveBeenCalledWith(error, {
      userId: 'user1',
      tags: {teamId: 'team1', service: 'gcal'}
    })
    expect(deactivateTeamMemberIntegrationAuthFamily).toHaveBeenCalledWith(auth)
  })

  it('deactivates the token family through the shared helper', async () => {
    mockUpdateChain()
    mockSelect({...auth})
    await handleAuthRefreshFailure(new Error('invalid_grant'), auth)
    expect(deactivateTeamMemberIntegrationAuthFamily).toHaveBeenCalledWith(auth)
  })

  it('keeps the grant when the provider answered with something other than an OAuth2 verdict', async () => {
    const chain = mockUpdateChain()
    mockSelect({...auth})
    const error = new ThirdPartyResponseError('Received non-JSON OAuth2 Response', {
      integration: 'oauth2',
      method: 'POST',
      endpoint: 'auth.example.com/oauth/token',
      path: '/oauth/token',
      status: 503,
      contentType: 'text/html',
      body: '<html>Service Unavailable</html>'
    })
    await expect(handleAuthRefreshFailure(error, auth)).resolves.toBeNull()
    expect(logError).toHaveBeenCalledWith(error, {
      userId: 'user1',
      tags: {teamId: 'team1', service: 'gcal'}
    })
    expect(chain.updateTable).not.toHaveBeenCalled()
    expect(deactivateTeamMemberIntegrationAuthFamily).not.toHaveBeenCalled()
  })

  it('keeps the grant when the token endpoint answers a JSON 503 without a token', async () => {
    const chain = mockUpdateChain()
    mockSelect({...auth})
    jest.mocked(fetch).mockResolvedValue(
      new Response('{"message":"Service Unavailable"}', {
        status: 503,
        headers: {'content-type': 'application/json'}
      })
    )
    const error = await authorizeOAuth2({authUrl: 'https://auth.example.com/oauth/token'})
    expect(error).toBeInstanceOf(ThirdPartyResponseError)
    await expect(handleAuthRefreshFailure(error as Error, auth)).resolves.toBeNull()
    expect(chain.updateTable).not.toHaveBeenCalled()
    expect(deactivateTeamMemberIntegrationAuthFamily).not.toHaveBeenCalled()
  })

  it('disconnects every team row of the same provider account when the account is known', async () => {
    const chain = mockUpdateChain()
    mockSelect({...auth})
    await handleAuthRefreshFailure(new Error('invalid_grant'), {...auth, providerUserId: 'acct'})
    expect(chain.where).toHaveBeenCalledWith('providerUserId', '=', 'acct')
    expect(chain.where).not.toHaveBeenCalledWith('teamId', '=', 'team1')
  })

  it('disconnects when the row was already deactivated elsewhere', async () => {
    const chain = mockUpdateChain()
    mockSelect(undefined)
    await expect(handleAuthRefreshFailure(new Error('x'), auth)).resolves.toBeNull()
    expect(chain.execute).toHaveBeenCalledTimes(1)
  })
})
