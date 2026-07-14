import '../../../../scripts/webpack/utils/dotenv'
import {createPGTables, truncatePGTables} from '../../__tests__/common'
import getKysely from '../../postgres/getKysely'
import RootDataLoader from '../RootDataLoader'

const TEST_DB = 'taskSecondaryStatusesTest'

beforeAll(async () => {
  const pg = getKysely(TEST_DB)
  await pg.schema.createSchema(TEST_DB).ifNotExists().execute()
  await createPGTables('TaskSecondaryStatus')
})

afterEach(async () => {
  await truncatePGTables('TaskSecondaryStatus')
})

afterAll(async () => {
  const pg = getKysely()
  await pg.schema.dropSchema(TEST_DB).cascade().execute()
  await pg.destroy()
})

// LIKE-clones drop FK constraints, so we can insert rows without real Team rows
const seed = async () => {
  const pg = getKysely()
  const rows = await pg
    .insertInto('TaskSecondaryStatus')
    .values([
      {teamId: 'teamA', status: 'active', label: 'In review', sortOrder: 2},
      {teamId: 'teamA', status: 'active', label: 'In progress', sortOrder: 1},
      {teamId: 'teamA', status: 'stuck', label: 'Blocked', sortOrder: 1},
      {teamId: 'teamB', status: 'active', label: 'In progress', sortOrder: 1}
    ])
    .returning('id')
    .execute()
  return rows.map(({id}) => id)
}

test('taskSecondaryStatuses primary loader loads by id', async () => {
  const [firstId] = await seed()
  const dataLoader = new RootDataLoader()
  const row = await dataLoader.get('taskSecondaryStatuses').load(firstId!)
  expect(row).toMatchObject({teamId: 'teamA', status: 'active', label: 'In review'})
})

test('taskSecondaryStatusesByTeamId returns team rows ordered by status then sortOrder', async () => {
  await seed()
  const dataLoader = new RootDataLoader()
  const rows = await dataLoader.get('taskSecondaryStatusesByTeamId').load('teamA')
  expect(rows.map(({label}) => label)).toEqual(['In progress', 'In review', 'Blocked'])
  expect(rows.every(({teamId}) => teamId === 'teamA')).toBe(true)
})

test('unique index rejects case-insensitive duplicate label per (team, status)', async () => {
  await seed()
  const pg = getKysely()
  await expect(
    pg
      .insertInto('TaskSecondaryStatus')
      .values({teamId: 'teamA', status: 'active', label: 'IN REVIEW', sortOrder: 9})
      .execute()
  ).rejects.toMatchObject({code: '23505'})
})
