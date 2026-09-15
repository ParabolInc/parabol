jest.mock('../../../public/rootSchema', () => ({
  __esModule: true,
  default: {},
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn()
}))
jest.mock('../../../../utils/logError', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../../../../postgres/select', () => {
  const rows: {id: string; integrationHash: string}[] = []
  const chain = {where: () => chain, execute: async () => rows}
  return {__esModule: true, selectTasks: () => chain, rows}
})
jest.mock('../../../../postgres/getKysely', () => {
  const inserted: Record<string, unknown>[][] = []
  return {
    __esModule: true,
    default: () => ({
      insertInto: () => ({
        values: (values: Record<string, unknown>[]) => {
          inserted.push(values)
          return {execute: async () => undefined}
        }
      })
    }),
    inserted
  }
})

import type {IntegrationCtx} from '../../../../integrations/platform/ServerIntegrationDefinition'
import logError from '../../../../utils/logError'
import importTasksForPoker from '../importTasksForPoker'

const {rows} = jest.requireMock('../../../../postgres/select') as {
  rows: {id: string; integrationHash: string}[]
}
const {inserted} = jest.requireMock('../../../../postgres/getKysely') as {
  inserted: Record<string, unknown>[][]
}

const ctx = {
  teamId: 't1',
  userId: 'u1',
  dataLoader: {get: () => ({load: jest.fn().mockResolvedValue(null)})}
} as unknown as IntegrationCtx

beforeEach(() => {
  rows.splice(0, rows.length)
  inserted.splice(0, inserted.length)
})

test('a PARABOL add keeps its task id and inserts nothing', async () => {
  const res = await importTasksForPoker(
    [{service: 'PARABOL', serviceTaskId: 'task1', action: 'ADD'}],
    ctx,
    'm1'
  )
  expect(res).toEqual([
    {service: 'PARABOL', serviceTaskId: 'task1', action: 'ADD', taskId: 'task1'}
  ])
  expect(inserted).toHaveLength(0)
})

test('a new integrated add inserts a task with the parsed integration', async () => {
  const res = await importTasksForPoker(
    [{service: 'jira', serviceTaskId: 'cloud1:WEB-12', action: 'ADD'}],
    ctx,
    'm1'
  )
  expect(inserted).toHaveLength(1)
  const [task] = inserted[0]!
  expect(task).toMatchObject({
    teamId: 't1',
    createdBy: 'u1',
    meetingId: 'm1',
    integrationHash: 'cloud1:WEB-12',
    integration: JSON.stringify({
      accessUserId: 'u1',
      service: 'jira',
      cloudId: 'cloud1',
      issueKey: 'WEB-12',
      projectKey: 'WEB'
    })
  })
  expect(res).toEqual([
    {service: 'jira', serviceTaskId: 'cloud1:WEB-12', action: 'ADD', taskId: task!.id}
  ])
})

test('an add whose task already exists reuses that task id', async () => {
  rows.push({id: 'existing', integrationHash: 'cloud1:WEB-12'})
  const res = await importTasksForPoker(
    [{service: 'jira', serviceTaskId: 'cloud1:WEB-12', action: 'ADD'}],
    ctx,
    'm1'
  )
  expect(inserted).toHaveLength(0)
  expect(res[0]!.taskId).toBe('existing')
})

test('an unparseable hash is logged and dropped without blocking the others', async () => {
  const res = await importTasksForPoker(
    [
      {service: 'jira', serviceTaskId: 'nope', action: 'ADD'},
      {service: 'PARABOL', serviceTaskId: 'task1', action: 'ADD'}
    ],
    ctx,
    'm1'
  )
  expect(res.map(({taskId}) => taskId)).toEqual(['task1'])
  expect(logError).toHaveBeenCalledWith(
    expect.objectContaining({message: expect.stringContaining('nope')}),
    {tags: {service: 'jira', teamId: 't1'}, userId: 'u1'}
  )
})
