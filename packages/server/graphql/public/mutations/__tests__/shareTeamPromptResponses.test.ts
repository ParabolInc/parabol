import type {GraphQLResolveInfo} from 'graphql'
import type {GQLContext} from '../../../graphql'
import {IntegrationNotifier} from '../../../mutations/helpers/notifications/IntegrationNotifier'
import publishNotification from '../helpers/publishNotification'
import createTeamPromptMentionNotifications from '../helpers/publishTeamPromptMentions'
import shareTeamPromptResponses from '../shareTeamPromptResponses'

jest.mock('../../../../postgres/getKysely', () => {
  type UpdateBuilder = {
    where: (column: string, operator: string, value: unknown) => UpdateBuilder
    returning: (column: string) => UpdateBuilder
    returningAll: () => UpdateBuilder
    execute: () => Promise<{id: number}[]>
  }
  const updatedIdBatches: number[][] = []
  const updateResult: {rows: {id: number}[]} = {rows: []}
  const makeUpdateBuilder = (): UpdateBuilder => {
    const builder: UpdateBuilder = {
      where: (column, _operator, value) => {
        if (column === 'id') updatedIdBatches.push(value as number[])
        return builder
      },
      returning: () => builder,
      returningAll: () => builder,
      execute: async () => updateResult.rows
    }
    return builder
  }
  const kysely = {
    updateTable: () => ({set: () => makeUpdateBuilder()})
  }
  return {__esModule: true, default: () => kysely, updatedIdBatches, updateResult}
})
jest.mock('../../../mutations/helpers/notifications/IntegrationNotifier', () => ({
  __esModule: true,
  IntegrationNotifier: {
    standupResponseSubmitted: jest.fn(),
    sendNotificationToUser: jest.fn()
  }
}))
jest.mock('../../../../utils/analytics/analytics', () => ({
  __esModule: true,
  analytics: {responseAdded: jest.fn()}
}))
jest.mock('../../../../utils/publish', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../helpers/publishNotification', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../helpers/publishTeamPromptMentions', () => ({
  __esModule: true,
  default: jest.fn(async () => [])
}))

const {updatedIdBatches, updateResult} = jest.requireMock('../../../../postgres/getKysely') as {
  updatedIdBatches: number[][]
  updateResult: {rows: {id: number}[]}
}
const {analytics} = jest.requireMock('../../../../utils/analytics/analytics') as {
  analytics: {responseAdded: jest.Mock}
}
const standupResponseSubmitted = jest.mocked(IntegrationNotifier.standupResponseSubmitted)
const publishMention = jest.mocked(publishNotification)
const createMentions = jest.mocked(createTeamPromptMentionNotifications)

const meetingId = 'meeting1'
const viewerId = 'viewer1'
const emptyDoc = {type: 'doc', content: []}
const filledDoc = {
  type: 'doc',
  content: [{type: 'paragraph', content: [{type: 'text', text: 'shipped'}]}]
}

type ResponseSeed = {id: number; content: unknown; sharedAt: Date | null}

const buildResponse = ({id, content, sharedAt}: ResponseSeed) => ({
  id,
  meetingId,
  userId: viewerId,
  promptId: `prompt${id}`,
  content,
  plaintextContent: 'shipped',
  sharedAt,
  reactjis: [],
  sortOrder: id,
  createdAt: new Date(),
  updatedAt: new Date()
})

const buildContext = (responses: ResponseSeed[], endedAt: Date | null = null) => {
  const loaders: Record<string, unknown> = {
    newMeetings: {
      load: async () => ({id: meetingId, meetingType: 'teamPrompt', teamId: 'team1', endedAt})
    },
    users: {loadNonNull: async () => ({id: viewerId, email: 'viewer@parabol.co'})},
    teamPromptResponsesByMeetingIdAndUserId: {load: async () => responses.map(buildResponse)}
  }
  return {
    authToken: {sub: viewerId},
    socketId: 'socket1',
    dataLoader: {
      get: (name: string) => loaders[name],
      share: () => 'op',
      clearAll: () => undefined
    }
  } as unknown as GQLContext
}

const info = {} as GraphQLResolveInfo
const resolve = shareTeamPromptResponses
if (typeof resolve !== 'function') throw new Error('resolver must be a function')

const run = (responses: ResponseSeed[], endedAt: Date | null = null) =>
  resolve({}, {meetingId} as Parameters<typeof resolve>[1], buildContext(responses, endedAt), info)

describe('shareTeamPromptResponses', () => {
  beforeEach(() => {
    updatedIdBatches.splice(0, updatedIdBatches.length)
    updateResult.rows = []
    createMentions.mockResolvedValue([])
  })

  it('shares every draft, notifies Slack once and tracks each shared answer', async () => {
    updateResult.rows = [{id: 1}, {id: 2}]
    createMentions.mockResolvedValueOnce([
      {
        id: 'notification1',
        type: 'RESPONSE_MENTIONED',
        userId: 'teammate1',
        responseId: 1,
        meetingId
      }
    ])
    const res = await run([
      {id: 1, content: filledDoc, sharedAt: null},
      {id: 2, content: filledDoc, sharedAt: null}
    ])
    expect(updatedIdBatches).toEqual([[1, 2]])
    expect(createMentions).toHaveBeenCalledTimes(2)
    expect(publishMention).toHaveBeenCalledTimes(1)
    expect(standupResponseSubmitted).toHaveBeenCalledTimes(1)
    expect(standupResponseSubmitted).toHaveBeenCalledWith(
      expect.anything(),
      meetingId,
      'team1',
      viewerId
    )
    expect(analytics.responseAdded).toHaveBeenCalledTimes(2)
    expect(res).toEqual({meetingId, userId: viewerId})
  })

  it('fires nothing when every answer is already shared', async () => {
    const res = await run([
      {id: 1, content: filledDoc, sharedAt: new Date()},
      {id: 2, content: filledDoc, sharedAt: new Date()}
    ])
    expect(updatedIdBatches).toEqual([])
    expect(createMentions).not.toHaveBeenCalled()
    expect(standupResponseSubmitted).not.toHaveBeenCalled()
    expect(analytics.responseAdded).not.toHaveBeenCalled()
    expect(res).toEqual({meetingId, userId: viewerId})
  })

  it('fires nothing when a concurrent share already claimed the rows', async () => {
    updateResult.rows = []
    const res = await run([
      {id: 1, content: filledDoc, sharedAt: null},
      {id: 2, content: filledDoc, sharedAt: null}
    ])
    expect(updatedIdBatches).toEqual([[1, 2]])
    expect(createMentions).not.toHaveBeenCalled()
    expect(publishMention).not.toHaveBeenCalled()
    expect(standupResponseSubmitted).not.toHaveBeenCalled()
    expect(analytics.responseAdded).not.toHaveBeenCalled()
    expect(res).toEqual({meetingId, userId: viewerId})
  })

  it('rejects a share with nothing written', async () => {
    await expect(run([{id: 1, content: emptyDoc, sharedAt: null}])).rejects.toThrow(
      'Answer at least one prompt to share'
    )
    expect(updatedIdBatches).toEqual([])
    expect(standupResponseSubmitted).not.toHaveBeenCalled()
  })

  it('rejects an ended meeting', async () => {
    await expect(run([{id: 1, content: filledDoc, sharedAt: null}], new Date())).rejects.toThrow(
      'Meeting already ended'
    )
    expect(updatedIdBatches).toEqual([])
    expect(standupResponseSubmitted).not.toHaveBeenCalled()
  })
})
