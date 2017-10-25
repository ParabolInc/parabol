import DynamicSerializer from 'dynamic-serializer';
import MockDate from 'mockdate';
import getRethink from 'server/database/rethinkDriver';
import {__now} from 'server/__tests__/setup/mockTimes';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import MockDB from 'server/__tests__/setup/MockDB';
import archiveTeam from 'server/graphql/models/Team/archiveTeam/archiveTeam';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import exchange from 'server/__mocks__/exchange';
import socket from 'server/__mocks__/socket';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import MockPubSub from 'server/__mocks__/MockPubSub';
import * as getPubSub from 'server/utils/getPubSub';
import * as tmsSignToken from 'server/utils/tmsSignToken';

MockDate.set(__now);
console.error = jest.fn();

describe('ArchiveTeam', () => {
  test('archives a team', async () => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockPubSub = new MockPubSub();
    const mockDB = new MockDB();
    const {user, team: [updatedTeam], teamMember} = await mockDB.init();
    updatedTeam.isArchived = true;
    const teamLeadId = teamMember.find((tm) => tm.teamId === updatedTeam.id && tm.isLead).userId;
    const teamLead = user.find((usr) => usr.id === teamLeadId);
    const authToken = mockAuthToken(teamLead);
    auth0ManagementClient.__initMock(mockDB.db);
    auth0ManagementClient.users.updateAppMetadata.mockReset();
    getPubSub.default = () => mockPubSub;
    tmsSignToken.default = jest.fn(() => 'FAKEENCODEDJWT');
    // TEST
    await archiveTeam.resolve(undefined, {teamId: updatedTeam.id}, {authToken, exchange, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      notification: r.table('Notification').getAll(updatedTeam.orgId, {index: 'orgId'}).orderBy('startAt'),
      team: r.table('Team').get(updatedTeam.id)
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
    expect(auth0ManagementClient.users.updateAppMetadata.mock.calls.length)
      .toBe(teamMember.length);
    expect(mockPubSub.__serialize(dynamicSerializer)).toMatchSnapshot();
  });

  test('deletes a team when it has no projects or other team members', async () => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockPubSub = new MockPubSub();
    const mockDB = new MockDB();
    const {user: [user], team: [updatedTeam]} = await mockDB
      .newOrg({name: 'Sad Sacks, Inc.'})
      .newTeam({name: 'The Lonely Ones'})
      .newUser({name: 'Leader of One'})
      .newTeamMember({isLead: true});
    updatedTeam.isArchived = true;
    const authToken = mockAuthToken(user);
    auth0ManagementClient.__initMock(mockDB.db);
    auth0ManagementClient.users.updateAppMetadata.mockReset();
    exchange.publish.mockReset();
    getPubSub.default = () => mockPubSub;
    tmsSignToken.default = jest.fn(() => 'FAKEENCODEDJWT');
    // TEST
    await archiveTeam.resolve(undefined, {teamId: updatedTeam.id}, {authToken, exchange, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      notification: r.table('Notification').getAll(updatedTeam.orgId, {index: 'orgId'}).orderBy('startAt'),
      team: r.table('Team').get(updatedTeam.id).default({}),
      teamMember: r.table('TeamMember').getAll(updatedTeam.id, {index: 'teamId'}).default([]),
      user: r.table('User').get(user.id)
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
    expect(auth0ManagementClient.users.updateAppMetadata.mock.calls.length)
      .toBe(1);
    expect(mockPubSub.__serialize(dynamicSerializer)).toMatchSnapshot();
  });
});
