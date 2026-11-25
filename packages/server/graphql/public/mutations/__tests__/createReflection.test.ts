import type {GraphQLResolveInfo} from 'graphql'
import type {GQLContext} from '../../../graphql'
import createReflection from '../createReflection'

type Call = {table: string; values?: Record<string, unknown>}

jest.mock('../../../../postgres/getKysely', () => {
  const calls: Call[] = []
  const chain = (call: Call) => {
    const builder: Record<string, unknown> = {
      values: (values: Record<string, unknown>) => {
        call.values = values
        return builder
      },
      with: (_name: string, fn: (qc: unknown) => unknown) => {
        fn({insertInto: (table: string) => chain({table})})
        return builder
      },
      insertInto: (table: string) => {
        const next = {table}
        calls.push(next)
        return chain(next)
      },
      updateTable: () => builder,
      set: () => builder,
      where: () => builder,
      execute: async () => []
    }
    return builder
  }
  const kysely = {
    with: (_name: string, fn: (qc: unknown) => unknown) => {
      fn({insertInto: (table: string) => chain({table})})
      return chain({table: ''})
    },
    updateTable: () => chain({table: ''})
  }
  return {__esModule: true, default: () => kysely, calls}
})
jest.mock('../../../../utils/publish', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../../../mutations/helpers/updateGroupTitle', () => ({
  __esModule: true,
  default: jest.fn(async () => undefined)
}))
jest.mock('../../../mutations/helpers/embedRetroReflection', () => ({
  embedRetroReflection: jest.fn(async () => undefined)
}))

const publish = jest.requireMock('../../../../utils/publish').default as jest.Mock
const updateGroupTitle = jest.requireMock('../../../mutations/helpers/updateGroupTitle')
  .default as jest.Mock

const ownPrompt = {id: 'ownPrompt', templateId: 'template1'}
const foreignPrompt = {id: 'foreignPrompt', templateId: 'template2'}

const meeting = {
  id: 'meeting1',
  teamId: 'team1',
  endedAt: null,
  phases: [
    {phaseType: 'reflect', stages: []},
    {phaseType: 'group', stages: [{isNavigableByFacilitator: true, isComplete: false}]}
  ]
}

const buildContext = () => {
  const prompts = [ownPrompt, foreignPrompt]
  const loaders: Record<string, unknown> = {
    templatePrompts: {load: async (id: string) => prompts.find((p) => p.id === id)},
    newMeetings: {load: async () => meeting},
    templatePromptsByMeetingId: {load: async () => [ownPrompt]}
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
const resolve = createReflection
if (typeof resolve !== 'function') throw new Error('resolver must be a function')

const run = (promptId: string) =>
  resolve(
    {},
    {input: {meetingId: 'meeting1', promptId, content: 'We shipped it', sortOrder: 0}},
    buildContext(),
    info
  )

describe('createReflection', () => {
  beforeEach(() => {
    publish.mockClear()
    updateGroupTitle.mockClear()
  })

  it('creates a reflection under a prompt of the meeting template', async () => {
    const res = await run('ownPrompt')
    expect(res).toMatchObject({meetingId: 'meeting1'})
    expect(updateGroupTitle).toHaveBeenCalledTimes(1)
    expect(publish).toHaveBeenCalledTimes(1)
  })

  it('rejects a prompt of another template without writing anything', async () => {
    await expect(run('foreignPrompt')).rejects.toThrow('Category not found')
    expect(updateGroupTitle).not.toHaveBeenCalled()
    expect(publish).not.toHaveBeenCalled()
  })

  it('rejects a prompt that does not exist with the same error', async () => {
    await expect(run('missingPrompt')).rejects.toThrow('Category not found')
    expect(publish).not.toHaveBeenCalled()
  })
})
