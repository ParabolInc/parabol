/* eslint-env jest */
import DynamicSerializer from 'dynamic-serializer'
import MockDate from 'mockdate'
import MockPubSub from '../../../__mocks__/MockPubSub'
import socket from '../../../__mocks__/socket'
import makeDataLoader from '../../../__tests__/setup/makeDataLoader'
import mockAuthToken from '../../../__tests__/setup/mockAuthToken'
import MockDB from '../../../__tests__/setup/MockDB'
import {__now} from '../../../__tests__/setup/mockTimes'
import fetchAndSerialize from '../../../__tests__/utils/fetchAndSerialize'
import getRethink from '../../../database/rethinkDriver'
import archiveTeam from '../archiveTeam'
import {auth0ManagementClient} from '../../../utils/auth0Helpers'
import * as tmsSignToken from '../../../utils/tmsSignToken'

MockDate.set(__now)
console.error = jest.fn()

describe('ArchiveTeam', () => {
  test('archives a team', async () => {
    // SETUP
    const r = getRethink()
    const dynamicSerializer = new DynamicSerializer()
    const mockPubSub = new MockPubSub()
    const mockDB = new MockDB()
    const {
      user,
      team: [updatedTeam],
      teamMember
    } = await mockDB.init()
    updatedTeam.isArchived = true
    const teamLeadId = teamMember.find((tm) => tm.teamId === updatedTeam.id && tm.isLead).userId
    const teamLead = user.find((usr) => usr.id === teamLeadId)
    const authToken = mockAuthToken(teamLead)
    const dataLoader = makeDataLoader(authToken)
    auth0ManagementClient.__initMock(mockDB.db)
    auth0ManagementClient.users.updateAppMetadata.mockReset()
    tmsSignToken.default = jest.fn(() => 'FAKEENCODEDJWT')
    // TEST
    await archiveTeam.resolve(undefined, {teamId: updatedTeam.id}, {authToken, dataLoader, socket})

    // VERIFY
    const db = await fetchAndSerialize(
      {
        notification: r
          .table('Notification')
          .getAll(updatedTeam.orgId, {index: 'orgId'})
          .orderBy('startAt'),
        team: r.table('Team').get(updatedTeam.id)
      },
      dynamicSerializer
    )
    expect(db).toMatchSnapshot()
    expect(auth0ManagementClient.users.updateAppMetadata.mock.calls.length).toBe(teamMember.length)
    expect(mockPubSub.__serialize(dynamicSerializer)).toMatchSnapshot()
  })
})
