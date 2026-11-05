import {getMigrationPlan} from '../getMigrationPlan'

const addUser = '2026-01-01T00:00:00.000Z_addUser'
const addTeam = '2026-02-01T00:00:00.000Z_addTeam'
const addMeeting = '2026-03-01T00:00:00.000Z_addMeeting'

test('migrates a fresh database', () => {
  expect(getMigrationPlan([addUser, addTeam], [])).toEqual({type: 'migrate'})
})

test('migrates when the database only has migrations this build ships', () => {
  expect(getMigrationPlan([addUser, addTeam], [addUser])).toEqual({type: 'migrate'})
})

test('skips when a newer build already migrated the database', () => {
  expect(getMigrationPlan([addUser, addTeam], [addUser, addTeam, addMeeting])).toEqual({
    type: 'skip',
    newerMigrationNames: [addMeeting]
  })
})

test('lets kysely reject a database that is ahead while this build has pending migrations', () => {
  expect(getMigrationPlan([addUser, addTeam], [addUser, addMeeting])).toEqual({type: 'migrate'})
})

test('lets kysely reject a database with an older migration this build never had', () => {
  expect(getMigrationPlan([addUser, addMeeting], [addUser, addTeam, addMeeting])).toEqual({
    type: 'migrate'
  })
})
