import type {GraphQLResolveInfo} from 'graphql'
import {Threshold} from 'parabol-client/types/constEnums'
import type {GQLContext} from '../../../graphql'
import importTasksForPoker from '../../../mutations/helpers/importTasksForPoker'
import updatePokerScope from '../updatePokerScope'

jest.mock('../../../../utils/RedisLockQueue', () => {
  const events: string[] = []
  class MockRedisLockQueue {
    lock = async () => {
      events.push('lock')
    }
    unlock = async () => {
      events.push('unlock')
    }
  }
  return {__esModule: true, default: MockRedisLockQueue, events}
})
jest.mock('../../../../postgres/getKysely', () => {
  const setPayloads: {facilitatorStageId: string; phases: string}[] = []
  const kysely = {
    updateTable: () => ({
      set: (payload: {facilitatorStageId: string; phases: string}) => {
        setPayloads.push(payload)
        return {where: () => ({execute: async () => undefined})}
      }
    }),
    insertInto: () => ({values: () => ({execute: async () => undefined})})
  }
  return {__esModule: true, default: () => kysely, setPayloads}
})
jest.mock('../../../../utils/getRedis', () => {
  const multiCalls: string[][][] = []
  return {
    __esModule: true,
    default: () => ({
      multi: (writes: string[][]) => {
        multiCalls.push(writes)
        return {exec: async () => undefined}
      }
    }),
    multiCalls
  }
})
jest.mock('../../../../utils/publish', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../../../mutations/helpers/importTasksForPoker', () => ({
  __esModule: true,
  default: jest.fn(async (additiveUpdates: {serviceTaskId: string}[]) =>
    additiveUpdates.map((update) => ({...update, taskId: `task:${update.serviceTaskId}`}))
  )
}))

const {events} = jest.requireMock('../../../../utils/RedisLockQueue') as {events: string[]}
const {setPayloads} = jest.requireMock('../../../../postgres/getKysely') as {
  setPayloads: {facilitatorStageId: string; phases: string}[]
}
const {multiCalls} = jest.requireMock('../../../../utils/getRedis') as {
  multiCalls: string[][][]
}
const importTasks = jest.mocked(importTasksForPoker)

type Stage = {
  id: string
  taskId: string
  serviceTaskId: string
  sortOrder: number
  dimensionRefIdx: number
}
type Phase = {phaseType: string; stages: Stage[]}

const meetingId = 'meeting1'

const buildMeeting = (endedAt: Date | null = null) => ({
  id: meetingId,
  meetingType: 'poker',
  teamId: 'team1',
  templateRefId: 'ref1',
  endedAt,
  facilitatorStageId: 'stageParabol',
  phases: [
    {
      phaseType: 'ESTIMATE',
      stages: [
        {
          id: 'stageJira',
          taskId: 'taskJira',
          serviceTaskId: 'cloud1:WEB-12',
          sortOrder: 1,
          dimensionRefIdx: 0
        },
        {
          id: 'stageParabol',
          taskId: 'taskParabol',
          serviceTaskId: 'taskParabol',
          sortOrder: 2,
          dimensionRefIdx: 0
        }
      ]
    }
  ] as Phase[]
})

const buildContext = (meeting: ReturnType<typeof buildMeeting>) => {
  const loaders: Record<string, unknown> = {
    newMeetings: {
      load: async () => {
        events.push('load')
        return meeting
      }
    },
    templateRefs: {loadNonNull: async () => ({dimensions: [{name: 'Story Points'}]})}
  }
  return {
    authToken: {sub: 'viewer1'},
    socketId: 'socket1',
    dataLoader: {
      get: (name: string) => loaders[name],
      share: () => 'op',
      clearAll: () => undefined
    }
  } as unknown as GQLContext
}

const info = {} as GraphQLResolveInfo
const resolve = updatePokerScope
if (typeof resolve !== 'function') throw new Error('resolver must be a function')

type ScopeUpdate = {service: string; serviceTaskId: string; action: string}

const run = (updates: ScopeUpdate[], meeting = buildMeeting()) =>
  resolve({}, {meetingId, updates} as Parameters<typeof resolve>[1], buildContext(meeting), info)

const writtenStages = () => {
  const payload = setPayloads.at(-1)!
  const phases = JSON.parse(payload.phases) as Phase[]
  return phases.find((phase) => phase.phaseType === 'ESTIMATE')!.stages
}

describe('updatePokerScope', () => {
  beforeEach(() => {
    events.splice(0, events.length)
    setPayloads.splice(0, setPayloads.length)
    multiCalls.splice(0, multiCalls.length)
    importTasks.mockClear()
  })

  it('removes a stage deleted by integration hash', async () => {
    const res = await run([{service: 'jira', serviceTaskId: 'cloud1:WEB-12', action: 'DELETE'}])
    expect(writtenStages().map(({id}) => id)).toEqual(['stageParabol'])
    expect(res).toEqual({meetingId, newStageIds: []})
  })

  it('dedupes an add whose hash is already in scope', async () => {
    const res = await run([{service: 'jira', serviceTaskId: 'cloud1:WEB-12', action: 'ADD'}])
    expect(writtenStages().map(({id}) => id)).toEqual(['stageJira', 'stageParabol'])
    expect(importTasks).toHaveBeenCalledWith([], expect.anything(), meetingId)
    expect(res).toEqual({meetingId, newStageIds: []})
  })

  it('dedupes the same hash sent twice in one request', async () => {
    await run([
      {service: 'jira', serviceTaskId: 'cloud1:WEB-99', action: 'ADD'},
      {service: 'jira', serviceTaskId: 'cloud1:WEB-99', action: 'ADD'}
    ])
    expect(importTasks.mock.calls[0]![0]).toHaveLength(1)
    expect(
      writtenStages().filter(({serviceTaskId}) => serviceTaskId === 'cloud1:WEB-99')
    ).toHaveLength(1)
  })

  it('adds a stage for an unused hash', async () => {
    await run([{service: 'jira', serviceTaskId: 'cloud1:WEB-99', action: 'ADD'}])
    const stages = writtenStages()
    expect(stages.map(({serviceTaskId}) => serviceTaskId)).toEqual([
      'cloud1:WEB-12',
      'taskParabol',
      'cloud1:WEB-99'
    ])
    expect(stages.at(-1)!.taskId).toBe('task:cloud1:WEB-99')
  })

  it('reports an add that could not be imported', async () => {
    importTasks.mockResolvedValueOnce([])
    await expect(run([{service: 'jira', serviceTaskId: 'nope', action: 'ADD'}])).rejects.toThrow(
      'Could not add that issue'
    )
    expect(setPayloads).toHaveLength(0)
    expect(events).toEqual(['lock', 'load', 'unlock'])
  })

  it('guards an ended meeting', async () => {
    await expect(
      run(
        [{service: 'jira', serviceTaskId: 'cloud1:WEB-12', action: 'DELETE'}],
        buildMeeting(new Date())
      )
    ).rejects.toThrow('Meeting already ended')
    expect(events).toEqual(['lock', 'load', 'unlock'])
  })

  it('rejects an over-limit scope before any side effect runs', async () => {
    await expect(
      run([
        {service: 'jira', serviceTaskId: 'cloud1:WEB-12', action: 'DELETE'},
        ...Array.from({length: Threshold.MAX_POKER_STORIES}, (_, idx) => ({
          service: 'jira',
          serviceTaskId: `cloud1:WEB-${idx}`,
          action: 'ADD'
        }))
      ])
    ).rejects.toThrow('Story limit reached')
    expect(importTasks).not.toHaveBeenCalled()
    expect(multiCalls).toHaveLength(0)
    expect(setPayloads).toHaveLength(0)
  })
})
