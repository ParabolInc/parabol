import type {GraphQLResolveInfo} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import TeamNotificationSettingsId from '../../../../../client/shared/gqlIds/TeamNotificationSettingsId'
import type {GQLContext} from '../../../graphql'
import setTeamNotificationSetting from '../setTeamNotificationSetting'

jest.mock('../../../../postgres/getKysely', () => {
  const builder = {set: () => builder, where: () => builder, execute: async () => []}
  const kysely = {updateTable: () => builder}
  return {__esModule: true, default: () => kysely}
})

jest.mock('../../../../utils/publish', () => ({__esModule: true, default: jest.fn()}))

const publish = jest.requireMock('../../../../utils/publish').default as jest.Mock

const teamId = 'team1'
const settingId = 42
const setting = {id: settingId, teamId, events: ['MEETING_STAGE_TIME_LIMIT_END']}
const context = {
  authToken: {sub: 'viewer1', tms: [teamId]},
  socketId: 'socket1',
  dataLoader: {
    share: () => 'op',
    get: () => ({load: async () => setting})
  }
} as unknown as GQLContext
const info = {} as GraphQLResolveInfo

const resolve = setTeamNotificationSetting
if (typeof resolve !== 'function') throw new Error('resolver must be a function')

describe('setTeamNotificationSetting', () => {
  beforeEach(() => {
    publish.mockClear()
  })

  it('publishes under a field name that exists on TeamSubscriptionPayload', async () => {
    await resolve(
      {},
      {
        id: TeamNotificationSettingsId.join(settingId),
        event: 'MEETING_STAGE_TIME_LIMIT_END',
        isEnabled: false
      },
      context,
      info
    )
    expect(publish).toHaveBeenCalledTimes(1)
    expect(publish.mock.calls[0]!.slice(0, 3)).toEqual([
      SubscriptionChannel.TEAM,
      teamId,
      'SetTeamNotificationSettingSuccess'
    ])
  })
})
