import DataLoader from 'dataloader'
import type {GraphQLResolveInfo} from 'graphql'
import type RootDataLoader from '../../../../dataloader/RootDataLoader'
import {selectTeamMemberIntegrationAuth} from '../../../../postgres/select'
import type {GQLContext} from '../../../graphql'
import updateOAuthRefreshTokens from '../updateOAuthRefreshTokens'

jest.mock('../../../../postgres/select', () => ({selectTeamMemberIntegrationAuth: jest.fn()}))

type StaleRow = {userId: string; teamId: string}

const mockStaleRows = (rows: StaleRow[]) => {
  const chain = {select: jest.fn(), where: jest.fn(), execute: jest.fn().mockResolvedValue(rows)}
  chain.select.mockReturnValue(chain)
  chain.where.mockReturnValue(chain)
  ;(selectTeamMemberIntegrationAuth as jest.Mock).mockReturnValue(chain)
}

const refreshStaleTokens = (load: (key: StaleRow) => Promise<StaleRow | null>) => {
  if (typeof updateOAuthRefreshTokens !== 'function')
    throw new Error('Expected a resolver function')
  const freshAtlassianAuth = new DataLoader<StaleRow, StaleRow | null, string>(
    (keys) => Promise.all(keys.map(load)),
    {cacheKeyFn: ({userId, teamId}) => `${userId}:${teamId}`}
  )
  const dataLoader = {get: () => freshAtlassianAuth} as unknown as RootDataLoader
  return updateOAuthRefreshTokens(
    {},
    {updatedBefore: new Date()},
    {dataLoader} as unknown as GQLContext,
    {} as GraphQLResolveInfo
  )
}

test('refreshes every stale user a few at a time instead of in one burst', async () => {
  const rows = Array.from({length: 40}, (_, idx) => ({userId: `user${idx}`, teamId: 'team1'}))
  mockStaleRows([...rows, {userId: 'user0', teamId: 'team2'}])
  let inFlightCount = 0
  let peakInFlightCount = 0
  const refreshedUserIds: string[] = []
  const load = async (key: StaleRow) => {
    inFlightCount++
    peakInFlightCount = Math.max(peakInFlightCount, inFlightCount)
    await new Promise((resolve) => setTimeout(resolve, 1))
    inFlightCount--
    refreshedUserIds.push(key.userId)
    return key.userId === 'user7' ? null : key
  }
  await expect(refreshStaleTokens(load)).resolves.toBe(39)
  expect(peakInFlightCount).toBe(3)
  expect(refreshedUserIds.sort()).toEqual(rows.map((row) => row.userId).sort())
})
