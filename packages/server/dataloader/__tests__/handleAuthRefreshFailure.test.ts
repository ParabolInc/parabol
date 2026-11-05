import getKysely from '../../postgres/getKysely'
import {selectTeamMemberIntegrationAuth} from '../../postgres/select'
import logError from '../../utils/logError'
import {ThirdPartyResponseError} from '../../utils/ThirdPartyResponseError'
import handleAuthRefreshFailure from '../handleAuthRefreshFailure'

jest.mock('../../postgres/getKysely')
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

  it('logs with user and team/service tags and disconnects when the provider rejects the grant', async () => {
    const chain = mockUpdateChain()
    mockSelect({...auth})
    const error = new Error('Token was globally revoked')
    await expect(handleAuthRefreshFailure(error, auth)).resolves.toBeNull()
    expect(logError).toHaveBeenCalledWith(error, {
      userId: 'user1',
      tags: {teamId: 'team1', service: 'gcal'}
    })
    expect(chain.updateTable).toHaveBeenCalledWith('TeamMemberIntegrationAuth')
    expect(chain.set).toHaveBeenCalledWith({isActive: false})
    expect(chain.where).toHaveBeenCalledWith('userId', '=', 'user1')
    expect(chain.where).toHaveBeenCalledWith('providerId', '=', 7)
    expect(chain.where).toHaveBeenCalledWith('teamId', '=', 'team1')
    expect(chain.execute).toHaveBeenCalledTimes(1)
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
