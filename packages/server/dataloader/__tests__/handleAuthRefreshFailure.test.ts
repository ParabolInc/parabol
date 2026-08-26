import getKysely from '../../postgres/getKysely'
import logError from '../../utils/logError'
import handleAuthRefreshFailure from '../handleAuthRefreshFailure'

jest.mock('../../postgres/getKysely')
jest.mock('../../utils/logError')

const auth = {id: 42, userId: 'user1', teamId: 'team1', service: 'gcal'}

const mockUpdateChain = () => {
  const execute = jest.fn().mockResolvedValue(undefined)
  const chain = {
    updateTable: jest.fn(),
    set: jest.fn(),
    where: jest.fn(),
    execute
  }
  chain.updateTable.mockReturnValue(chain)
  chain.set.mockReturnValue(chain)
  chain.where.mockReturnValue(chain)
  ;(getKysely as jest.Mock).mockReturnValue(chain)
  return chain
}

describe('handleAuthRefreshFailure', () => {
  beforeEach(() => jest.clearAllMocks())

  it('logs with user and team/service tags', async () => {
    mockUpdateChain()
    const error = new Error('fetch failed')
    await handleAuthRefreshFailure(error, auth)
    expect(logError).toHaveBeenCalledWith(error, {
      userId: 'user1',
      tags: {teamId: 'team1', service: 'gcal'}
    })
  })

  it('does not touch the row for a transient error', async () => {
    const chain = mockUpdateChain()
    await handleAuthRefreshFailure(new Error('fetch failed'), auth)
    expect(chain.updateTable).not.toHaveBeenCalled()
  })

  it('deactivates exactly that row for a revoked grant', async () => {
    const chain = mockUpdateChain()
    await handleAuthRefreshFailure(new Error('refresh_token is invalid'), auth)
    expect(chain.updateTable).toHaveBeenCalledWith('TeamMemberIntegrationAuth')
    expect(chain.set).toHaveBeenCalledWith({isActive: false})
    expect(chain.where).toHaveBeenCalledWith('id', '=', 42)
    expect(chain.execute).toHaveBeenCalledTimes(1)
  })
})
