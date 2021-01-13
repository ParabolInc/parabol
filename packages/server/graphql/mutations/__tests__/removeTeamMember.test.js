/* eslint-env jest */
import DynamicSerializer from 'dynamic-serializer'
import MockDate from 'mockdate'
import MockPubSub from '../../../__mocks__/MockPubSub'
import makeDataLoader from '../../../__tests__/setup/makeDataLoader'
import mockAuthToken from '../../../__tests__/setup/mockAuthToken'
import MockDB from '../../../__tests__/setup/MockDB'
import {__now} from '../../../__tests__/setup/mockTimes'
import fetchAndSerialize from '../../../__tests__/utils/fetchAndSerialize'
import getRethink from '../../../database/rethinkDriver'
import removeTeamMember from '../removeTeamMember'

MockDate.set(__now)
console.error = jest.fn()

describe('removeTeamMember', () => {
  test('promotes another member if the person removed was the lead', async () => {})

  test('removes the teamMember, reassigns active tasks to the lead', async () => {
    // SETUP
    const r = await getRethink()
    const mockPubSub = new MockPubSub()
    const mockDB = new MockDB()
    const dynamicSerializer = new DynamicSerializer()
    await mockDB.init().newTask()
    const userToBoot = mockDB.db.user[7]
    const authToken = mockAuthToken(mockDB.db.user[0])
    const dataLoader = makeDataLoader(authToken)
    const teamId = mockDB.db.team[0].id
    // TEST
    const teamMemberId = mockDB.db.teamMember[7].id
    await removeTeamMember.resolve(undefined, {teamMemberId}, {authToken, dataLoader})

    const db = await fetchAndSerialize(
      {
        teamMember: r
          .table('TeamMember')
          .getAll(teamId, {index: 'teamId'})
          .orderBy('checkInOrder'),
        task: r.table('Task').getAll(teamId, {index: 'teamId'}),
        user: r.table('User').get(userToBoot.id)
      },
      dynamicSerializer
    )
    expect(db).toMatchSnapshot()
    expect(mockPubSub.__serialize(dynamicSerializer)).toMatchSnapshot()
  })

  test('return error if the caller is not self or team lead', async () => {
    // reassigns their tasks

    // deactivates providers

    // inserts notification in table if kickout

    // sends notification via pubsub

    // remove github repos

    // archive githug tasks attached to those repos
    // SETUP
    const mockDB = new MockDB()
    await mockDB.init().newTask()
    const authToken = mockAuthToken(mockDB.db.user[1])
    const dataLoader = makeDataLoader(authToken)
    // TEST
    const teamMemberId = mockDB.db.teamMember[7].id
    const res = await removeTeamMember.resolve(undefined, {teamMemberId}, {authToken, dataLoader})
    expect(res).toEqual(expect.objectContaining({error: expect.any(Object)}))
  })
})
