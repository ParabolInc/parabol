jest.mock('../searchClickUpTasks', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../../../utils/Logger', () => ({
  Logger: {log: jest.fn(), error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn()}
}))

import type {GraphQLResolveInfo} from 'graphql'
import type {DataLoaderWorker, GQLContext} from '../../../graphql/graphql'
import {MAX_ISSUES} from '../../platform/InspirationIssue'
import listClickUpIssues from '../listClickUpIssues'
import type {ClickUpTaskSource} from '../mapClickUpTask'
import searchClickUpTasks from '../searchClickUpTasks'

const mockedSearch = jest.mocked(searchClickUpTasks)

const START_AT = '2026-10-01T00:00:00.000Z'
const END_AT = '2026-10-07T23:59:59.999Z'
const SPRINT_LIST_ID = '901423080038'
const CLIENT_SEARCH_QUERY =
  '{"startAt":"2026-10-01T00:00:00.000Z","endAt":"2026-10-07T23:59:59.999Z","listIds":["901423080038"]}'

const ctx = {
  dataLoader: {} as DataLoaderWorker,
  teamId: 'team1',
  userId: 'user1',
  context: {} as GQLContext,
  info: {} as GraphQLResolveInfo
}

const searchQuery = (overrides: Record<string, unknown> = {}) =>
  JSON.stringify({startAt: START_AT, endAt: END_AT, listIds: [SPRINT_LIST_ID], ...overrides})

const task = (taskId: string, overrides: Partial<ClickUpTaskSource> = {}): ClickUpTaskSource => ({
  service: 'clickup',
  id: `9015::${taskId}`,
  title: `Task ${taskId}`,
  taskId,
  customId: null,
  url: `https://app.clickup.com/t/${taskId}`,
  description: '',
  status: {name: 'in progress', color: '#4194f6', type: 'custom'},
  listId: SPRINT_LIST_ID,
  listName: 'Sprint 1',
  folderName: 'Q4',
  spaceId: '9016',
  customItemId: 0,
  customFields: [],
  updatedAt: new Date('2026-10-02T00:00:00.000Z'),
  workspaceId: '9015',
  ...overrides
})

const run = (query: string) => listClickUpIssues(ctx, query)

describe('listClickUpIssues', () => {
  beforeEach(() => {
    mockedSearch.mockResolvedValue({tasks: [], nextPage: null})
  })

  it('reads the JSON the drawer sends and searches the tasks assigned to the viewer, closed ones too, in its date window', async () => {
    expect(CLIENT_SEARCH_QUERY).toBe(searchQuery())
    await run(CLIENT_SEARCH_QUERY)
    expect(mockedSearch).toHaveBeenCalledWith(ctx, {
      queryString: '',
      listIds: [SPRINT_LIST_ID],
      assignedToViewer: true,
      updatedAfter: new Date(START_AT),
      updatedBefore: new Date(END_AT),
      includeClosed: true,
      page: 0,
      minResults: MAX_ISSUES
    })
  })

  it('searches every list, keeping only list ids that are strings', async () => {
    await run(searchQuery({listIds: undefined}))
    expect(mockedSearch).toHaveBeenLastCalledWith(ctx, expect.objectContaining({listIds: []}))
    await run(searchQuery({listIds: [SPRINT_LIST_ID, 7, null]}))
    expect(mockedSearch).toHaveBeenLastCalledWith(
      ctx,
      expect.objectContaining({listIds: [SPRINT_LIST_ID]})
    )
  })

  it('searches an open-ended window when the query has no dates', async () => {
    await run(searchQuery({startAt: undefined, endAt: undefined}))
    expect(mockedSearch).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({updatedAfter: null, updatedBefore: null})
    )
  })

  it.each([
    ['is not JSON', '{startAt'],
    ['is JSON null', 'null'],
    ['has an unreadable start date', searchQuery({startAt: 'last tuesday'})],
    ['has a null end date', searchQuery({endAt: null})],
    ['has a start date that is not a string', searchQuery({startAt: 1790812800000})]
  ])('returns nothing, without searching, when the query %s', async (_label, query) => {
    await expect(run(query)).resolves.toEqual([])
    expect(mockedSearch).not.toHaveBeenCalled()
  })

  it('describes each task by its custom id, or its task id when it has none, under Folder / List', async () => {
    const updatedAt = new Date('2026-10-03T12:00:00.000Z')
    mockedSearch.mockResolvedValue({
      tasks: [
        task('86bd03p5u', {
          title: 'Ship the login page',
          customId: 'ENG-12',
          description: 'Users *cannot* sign in',
          status: {name: 'review', color: '#a875ff', type: 'custom'},
          updatedAt
        }),
        task('86bd03p5w', {folderName: null})
      ],
      nextPage: null
    })
    await expect(run(searchQuery())).resolves.toEqual([
      {
        kind: 'Task',
        title: 'Ship the login page',
        reference: 'ENG-12',
        subtitle: 'Q4 / Sprint 1',
        status: 'review',
        url: 'https://app.clickup.com/t/86bd03p5u',
        updatedAt,
        description: 'Users *cannot* sign in'
      },
      {
        kind: 'Task',
        title: 'Task 86bd03p5w',
        reference: '86bd03p5w',
        subtitle: 'Sprint 1',
        status: 'in progress',
        url: 'https://app.clickup.com/t/86bd03p5w',
        updatedAt: new Date('2026-10-02T00:00:00.000Z'),
        description: ''
      }
    ])
  })

  it(`keeps the first ${MAX_ISSUES} tasks the search returns`, async () => {
    const tasks = Array.from({length: MAX_ISSUES + 5}, (_, i) => task(`t${i}`))
    mockedSearch.mockResolvedValue({tasks, nextPage: 1})
    const issues = await run(searchQuery())
    expect(issues.map(({reference}) => reference)).toEqual(
      tasks.slice(0, MAX_ISSUES).map(({taskId}) => taskId)
    )
  })

  it('returns nothing when the search fails', async () => {
    mockedSearch.mockResolvedValue(new Error('ClickUp rate limit reached, try again in a minute'))
    await expect(run(searchQuery())).resolves.toEqual([])
  })
})
