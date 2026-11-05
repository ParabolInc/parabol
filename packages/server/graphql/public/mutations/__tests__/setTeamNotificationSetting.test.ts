import {readFileSync} from 'node:fs'
import path from 'node:path'
import type {GraphQLResolveInfo} from 'graphql'
import {buildSchema, type GraphQLObjectType} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import publish from '../../../../utils/publish'
import type {GQLContext} from '../../../graphql'
import setTeamNotificationSetting from '../setTeamNotificationSetting'

jest.mock('../../../../postgres/getKysely', () => {
  const builder = {
    set: () => builder,
    where: () => builder,
    execute: async () => []
  }
  return {__esModule: true, default: () => ({updateTable: () => builder})}
})
jest.mock('../../../../utils/publish', () => ({__esModule: true, default: jest.fn()}))

const setting = {id: 7, teamId: 'team1', events: [] as string[]}

const buildContext = () =>
  ({
    authToken: {sub: 'viewer1', tms: ['team1']},
    socketId: 'socket1',
    dataLoader: {
      get: () => ({load: async () => setting}),
      share: () => 'op'
    }
  }) as unknown as GQLContext

const info = {} as GraphQLResolveInfo
const resolve = setTeamNotificationSetting
if (typeof resolve !== 'function') throw new Error('resolver must be a function')

const schema = buildSchema(readFileSync(path.join(__dirname, '../../schema.graphql'), 'utf8'))

describe('setTeamNotificationSetting', () => {
  it('publishes under a field of TeamSubscriptionPayload so the client can handle it', async () => {
    await resolve(
      {},
      {id: 'teamNotificationSettings:7', event: 'meetingStart', isEnabled: true},
      buildContext(),
      info
    )
    const [channel, teamId, fieldName] = jest.mocked(publish).mock.calls[0]!
    expect(channel).toBe(SubscriptionChannel.TEAM)
    expect(teamId).toBe('team1')
    const teamPayloadFields = (
      schema.getType('TeamSubscriptionPayload') as GraphQLObjectType
    ).getFields()
    expect(Object.keys(teamPayloadFields)).toContain(fieldName)
  })
})
