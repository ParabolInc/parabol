import type {GraphQLResolveInfo} from 'graphql'
import type {GQLContext} from '../../../graphql'
import renameTemplatePrompt from '../renameTemplatePrompt'

type Call = {table: string; values?: Record<string, unknown>; set?: Record<string, unknown>}

jest.mock('../../../../postgres/getKysely', () => {
  const calls: Call[] = []
  const state: {answeredTables: string[]} = {answeredTables: []}
  const chain = (call: Call) => {
    const builder = {
      set: (set: Record<string, unknown>) => {
        call.set = set
        return builder
      },
      values: (values: Record<string, unknown>) => {
        call.values = values
        return builder
      },
      where: () => builder,
      execute: async () => []
    }
    return builder
  }
  const record = (table: string) => {
    const call: Call = {table}
    calls.push(call)
    return chain(call)
  }
  const kysely = {
    selectFrom: (table: string) => ({
      select: () => ({
        where: () => ({
          limit: () => ({
            executeTakeFirst: async () =>
              state.answeredTables.includes(table) ? {id: 1} : undefined
          })
        })
      })
    }),
    updateTable: record,
    insertInto: record,
    transaction: () => ({execute: async (fn: (trx: unknown) => Promise<void>) => fn(kysely)})
  }
  return {__esModule: true, default: () => kysely, calls, state}
})
jest.mock('../../../../generateUID', () => ({__esModule: true, default: () => 'newPrompt'}))
jest.mock('../../../../utils/publish', () => ({__esModule: true, default: jest.fn()}))

const {calls, state} = jest.requireMock('../../../../postgres/getKysely') as {
  calls: Call[]
  state: {answeredTables: string[]}
}

const prompt = {
  id: 'oldPrompt',
  templateId: 'template1',
  teamId: 'team1',
  question: 'What did you ship?',
  description: 'Anything that landed',
  groupColor: '#66BC8C',
  sortOrder: '"',
  removedAt: null
}

const buildContext = () => {
  const loaders: Record<string, unknown> = {
    templatePrompts: {load: async () => prompt},
    templatePromptsByTemplateId: {load: async () => [prompt]}
  }
  return {
    authToken: {sub: 'viewer1'},
    socketId: 'socket1',
    dataLoader: {get: (name: string) => loaders[name], share: () => 'op', clearAll: () => undefined}
  } as unknown as GQLContext
}

const info = {} as GraphQLResolveInfo
const resolve = renameTemplatePrompt
if (typeof resolve !== 'function') throw new Error('resolver must be a function')

const run = (question: string) => resolve({}, {promptId: prompt.id, question}, buildContext(), info)

describe('renameTemplatePrompt', () => {
  beforeEach(() => {
    calls.splice(0, calls.length)
    state.answeredTables = []
  })

  it('renames an unanswered prompt in place', async () => {
    const res = await run('What did you finish?')
    expect(res).toEqual({promptId: 'oldPrompt'})
    expect(calls).toEqual([{table: 'TemplatePrompt', set: {question: 'What did you finish?'}}])
  })

  it('retires a prompt with stand-up responses and inserts its replacement so past meetings keep the old wording', async () => {
    state.answeredTables = ['TeamPromptResponse']
    const res = await run('What did you finish?')
    expect(res).toEqual({promptId: 'newPrompt'})
    expect(calls).toHaveLength(2)
    const [retire, replace] = calls
    expect(retire!.table).toBe('TemplatePrompt')
    expect(retire!.set!.removedAt).toBeInstanceOf(Date)
    expect(replace!.table).toBe('TemplatePrompt')
    expect(replace!.values).toEqual({
      id: 'newPrompt',
      templateId: 'template1',
      teamId: 'team1',
      sortOrder: '"',
      question: 'What did you finish?',
      description: 'Anything that landed',
      groupColor: '#66BC8C',
      createdAt: retire!.set!.removedAt,
      removedAt: null
    })
  })

  it('retires a prompt with retro reflections the same way', async () => {
    state.answeredTables = ['RetroReflection']
    const res = await run('What did you finish?')
    expect(res).toEqual({promptId: 'newPrompt'})
    expect(
      calls.map(({table, set, values}) => [table, set ? 'retire' : values ? 'insert' : ''])
    ).toEqual([
      ['TemplatePrompt', 'retire'],
      ['TemplatePrompt', 'insert']
    ])
    expect(calls[1]!.values!.question).toBe('What did you finish?')
  })

  it('rejects a question already asked by an active prompt', async () => {
    state.answeredTables = ['TeamPromptResponse']
    await expect(run('What did you ship?')).rejects.toThrow('Duplicate question template')
    expect(calls).toEqual([])
  })
})
