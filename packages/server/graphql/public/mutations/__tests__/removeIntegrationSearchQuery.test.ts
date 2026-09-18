import type {GraphQLResolveInfo} from 'graphql'
import {CipherId} from '../../../../utils/CipherId'
import type {GQLContext} from '../../../graphql'
import removeIntegrationSearchQuery from '../removeIntegrationSearchQuery'

jest.mock('../../../../integrations/platform/registry', () => ({
  isRegisteredServerIntegration: (service: string) => service === 'jira'
}))

jest.mock('../../../../postgres/getKysely', () => {
  const executeTakeFirst = jest.fn()
  const where = jest.fn()
  const builder = {where, returning: () => ({executeTakeFirst})}
  where.mockReturnValue(builder)
  const kysely = {deleteFrom: () => builder}
  return {__esModule: true, default: () => kysely, executeTakeFirst, where}
})

jest.mock('../../../../utils/publish', () => ({__esModule: true, default: jest.fn()}))

const {executeTakeFirst: deletedRow, where} = jest.requireMock(
  '../../../../postgres/getKysely'
) as {
  executeTakeFirst: jest.Mock<Promise<{service: string} | undefined>, []>
  where: jest.Mock
}
const publish = jest.requireMock('../../../../utils/publish').default as jest.Mock

const teamId = 'team1'
const viewerId = 'viewer1'
const context = {
  authToken: {sub: viewerId},
  socketId: 'socket1',
  dataLoader: {share: () => 'op'}
} as unknown as GQLContext
const info = {} as GraphQLResolveInfo

const resolve = removeIntegrationSearchQuery
if (typeof resolve !== 'function') throw new Error('resolver must be a function')
const run = (id: string) => resolve({}, {id, teamId}, context, info)

describe('removeIntegrationSearchQuery', () => {
  beforeEach(() => {
    deletedRow.mockReset()
    where.mockClear()
    publish.mockClear()
  })

  it('throws when the id belongs to another entity, without touching the table', async () => {
    await expect(run(CipherId.toClient(7, 'task'))).rejects.toThrow('Search query not found')
    expect(deletedRow).not.toHaveBeenCalled()
  })

  it('throws when no row matches the viewer and team', async () => {
    deletedRow.mockResolvedValue(undefined)
    await expect(run(CipherId.toClient(7, 'integrationSearchQuery'))).rejects.toThrow(
      'Search query not found'
    )
    expect(publish).not.toHaveBeenCalled()
  })

  it('throws when the removed row belongs to a retired service', async () => {
    deletedRow.mockResolvedValue({service: 'trello'})
    await expect(run(CipherId.toClient(7, 'integrationSearchQuery'))).rejects.toThrow(
      'Search query not found'
    )
  })

  it('scopes the delete to the viewer and returns the service source', async () => {
    deletedRow.mockResolvedValue({service: 'jira'})
    const result = await run(CipherId.toClient(7, 'integrationSearchQuery'))
    expect(result).toEqual({teamId, userId: viewerId, service: 'jira'})
    expect(where.mock.calls).toEqual([
      ['id', '=', 7],
      ['userId', '=', viewerId],
      ['teamId', '=', teamId]
    ])
    expect(publish).toHaveBeenCalledTimes(1)
  })
})
