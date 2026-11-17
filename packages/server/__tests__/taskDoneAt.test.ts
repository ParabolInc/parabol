import {sql} from 'kysely'
import getKysely from '../postgres/getKysely'
import {createPGTables, truncatePGTables} from './common'

const TEST_DB = 'taskDoneAtTest'
const pg = getKysely(TEST_DB)

const insertTask = (id: string, status: 'active' | 'done', doneAt?: Date) =>
  pg
    .insertInto('Task')
    .values({
      id,
      content: JSON.stringify({}),
      createdBy: 'user1',
      plaintextContent: '',
      teamId: 'team1',
      status,
      doneAt
    })
    .execute()

const setStatus = (id: string, status: 'active' | 'done', doneAt?: Date) =>
  pg.updateTable('Task').set({status, doneAt}).where('id', '=', id).execute()

const getDoneAt = async (id: string) => {
  const {doneAt} = await pg
    .selectFrom('Task')
    .select('doneAt')
    .where('id', '=', id)
    .executeTakeFirstOrThrow()
  return doneAt
}

beforeAll(async () => {
  await pg.schema.createSchema(TEST_DB).ifNotExists().execute()
  await createPGTables('Task')
  // a copied table has no triggers, so attach the migration's own trigger to it
  const {rows} = await sql<{definition: string}>`
    SELECT pg_get_triggerdef(oid) AS definition FROM pg_trigger
    WHERE tgname = 'set_Task_doneAt' AND tgrelid = 'public."Task"'::regclass
  `.execute(pg)
  const [trigger] = rows
  if (!trigger) throw new Error('The set_Task_doneAt trigger is missing. Run the migrations first')
  await sql.raw(trigger.definition.replace(' ON public."Task" ', ' ON "Task" ')).execute(pg)
})

afterEach(async () => {
  await truncatePGTables('Task')
})

afterAll(async () => {
  await pg.schema.dropSchema(TEST_DB).cascade().execute()
  await pg.destroy()
})

test('an active task has no doneAt', async () => {
  await insertTask('task1', 'active')
  expect(await getDoneAt('task1')).toBeNull()
})

test('a task created as done gets a doneAt', async () => {
  await insertTask('task1', 'done')
  expect(await getDoneAt('task1')).toBeInstanceOf(Date)
})

test('marking a task done sets doneAt, and reopening it clears doneAt', async () => {
  await insertTask('task1', 'active')
  await setStatus('task1', 'done')
  expect(await getDoneAt('task1')).toBeInstanceOf(Date)
  await setStatus('task1', 'active')
  expect(await getDoneAt('task1')).toBeNull()
})

test('setting a done task to done again keeps its first doneAt', async () => {
  await insertTask('task1', 'done')
  const firstDoneAt = await getDoneAt('task1')
  await setStatus('task1', 'done')
  expect(await getDoneAt('task1')).toEqual(firstDoneAt)
})

test('editing a done task without touching its status keeps its doneAt', async () => {
  await insertTask('task1', 'done')
  const firstDoneAt = await getDoneAt('task1')
  await pg.updateTable('Task').set({plaintextContent: 'edited'}).where('id', '=', 'task1').execute()
  expect(await getDoneAt('task1')).toEqual(firstDoneAt)
})

test('a doneAt given while marking a task done is kept', async () => {
  const doneAt = new Date('2026-01-02T03:04:05.000Z')
  await insertTask('task1', 'active')
  await setStatus('task1', 'done', doneAt)
  expect(await getDoneAt('task1')).toEqual(doneAt)
})

test('a doneAt given to an active task is cleared', async () => {
  await insertTask('task1', 'active', new Date('2026-01-02T03:04:05.000Z'))
  expect(await getDoneAt('task1')).toBeNull()
})
