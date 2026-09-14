import type {GraphQLResolveInfo} from 'graphql'
import {Threshold} from 'parabol-client/types/constEnums'
import type {GQLContext} from '../../../graphql'
import importTasksForPoker from '../../../mutations/helpers/importTasksForPoker'
import type {ResolvedScopeAdd} from '../../../mutations/helpers/resolveScopeAdds'
import resolveScopeAdds from '../../../mutations/helpers/resolveScopeAdds'
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
jest.mock('../../../mutations/helpers/resolveScopeAdds', () => ({
  __esModule: true,
  default: jest.fn()
}))
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
const resolveAdds = jest.mocked(resolveScopeAdds)
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

const buildContext = (
  meeting: ReturnType<typeof buildMeeting>,
  freshMeeting: ReturnType<typeof buildMeeting> | null = meeting
) => {
  let loadCount = 0
  const loaders: Record<string, unknown> = {
    newMeetings: {
      load: async () => {
        events.push('load')
        loadCount += 1
        return loadCount === 1 ? meeting : freshMeeting
      },
      clear: (id: string) => {
        events.push(`clear:${id}`)
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

const run = (
  updates: ScopeUpdate[],
  meeting = buildMeeting(),
  freshMeeting: ReturnType<typeof buildMeeting> | null = meeting
) =>
  resolve(
    {},
    {meetingId, updates} as Parameters<typeof resolve>[1],
    buildContext(meeting, freshMeeting),
    info
  )

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
    resolveAdds.mockResolvedValue([])
  })

  it('removes a stage deleted by taskId', async () => {
    const res = await run([{service: 'jira', serviceTaskId: 'taskJira', action: 'DELETE'}])
    expect(writtenStages().map(({id}) => id)).toEqual(['stageParabol'])
    expect(res).toEqual({meetingId, newStageIds: []})
  })

  it('removes a stage deleted by integration hash', async () => {
    await run([{service: 'jira', serviceTaskId: 'cloud1:WEB-12', action: 'DELETE'}])
    expect(writtenStages().map(({id}) => id)).toEqual(['stageParabol'])
  })

  it('dedupes an add that resolves to a hash already in scope', async () => {
    resolveAdds.mockResolvedValue([
      {
        service: 'jira',
        serviceTaskId: 'cloud1:WEB-12',
        action: 'ADD',
        integration: null
      } as ResolvedScopeAdd
    ])
    const res = await run([{service: 'jira', serviceTaskId: 'anything', action: 'ADD'}])
    expect(writtenStages().map(({id}) => id)).toEqual(['stageJira', 'stageParabol'])
    expect(res).toEqual({meetingId, newStageIds: []})
  })

  it('adds a stage for an unused hash', async () => {
    resolveAdds.mockResolvedValue([
      {
        service: 'jira',
        serviceTaskId: 'cloud1:WEB-99',
        action: 'ADD',
        integration: null
      } as ResolvedScopeAdd
    ])
    await run([{service: 'jira', serviceTaskId: 'anything', action: 'ADD'}])
    const stages = writtenStages()
    expect(stages.map(({serviceTaskId}) => serviceTaskId)).toEqual([
      'cloud1:WEB-12',
      'taskParabol',
      'cloud1:WEB-99'
    ])
    expect(stages.at(-1)!.taskId).toBe('task:cloud1:WEB-99')
  })

  it('surfaces an unresolvable add without taking the lock', async () => {
    resolveAdds.mockResolvedValue(new Error('Jira issue not found'))
    const res = await run([{service: 'jira', serviceTaskId: 'nope', action: 'ADD'}])
    expect(res).toEqual({error: {message: 'Jira issue not found'}})
    expect(events).not.toContain('lock')
    expect(setPayloads).toHaveLength(0)
  })

  it('guards an ended meeting before taking the lock', async () => {
    const res = await run(
      [{service: 'jira', serviceTaskId: 'taskJira', action: 'DELETE'}],
      buildMeeting(new Date())
    )
    expect(res).toEqual({error: {message: 'Meeting already ended'}})
    expect(events).toEqual(['load'])
  })

  it('re-reads the meeting fresh inside the lock', async () => {
    await run([{service: 'jira', serviceTaskId: 'taskJira', action: 'DELETE'}])
    expect(events).toEqual(['load', 'lock', `clear:${meetingId}`, 'load', 'unlock'])
  })

  it('reports a meeting deleted between the snapshot and the in-lock re-read', async () => {
    const res = await run(
      [{service: 'jira', serviceTaskId: 'taskJira', action: 'DELETE'}],
      buildMeeting(),
      null
    )
    expect(res).toEqual({error: {message: 'Meeting not found'}})
    expect(setPayloads).toHaveLength(0)
  })

  it('rejects an over-limit scope before any side effect runs', async () => {
    resolveAdds.mockResolvedValue(
      Array.from(
        {length: Threshold.MAX_POKER_STORIES},
        (_, idx) =>
          ({
            service: 'jira',
            serviceTaskId: `cloud1:WEB-${idx}`,
            action: 'ADD',
            integration: null
          }) as ResolvedScopeAdd
      )
    )
    const res = await run([
      {service: 'jira', serviceTaskId: 'taskJira', action: 'DELETE'},
      {service: 'jira', serviceTaskId: 'anything', action: 'ADD'}
    ])
    expect(res).toEqual({error: {message: 'Story limit reached'}})
    expect(importTasks).not.toHaveBeenCalled()
    expect(multiCalls).toHaveLength(0)
    expect(setPayloads).toHaveLength(0)
  })
})
