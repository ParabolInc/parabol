import DynamicSerializer from 'dynamic-serializer';
import MockDate from 'mockdate';
import getRethink from 'server/database/rethinkDriver';
import {__now} from 'server/__tests__/setup/mockTimes';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import MockDB from 'server/__tests__/setup/MockDB';
import archiveTeam from 'server/graphql/models/Team/archiveTeam/archiveTeam';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import socket from 'server/__mocks__/socket';

MockDate.set(__now);
console.error = jest.fn();

describe('ArchiveTeam', () => {
  test('archives a team', async () => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const {user, team: [updatedTeam], teamMember} = await mockDB.init();
    updatedTeam.isArchived = true;
    updatedTeam.name = updatedTeam.teamName;
    const teamLeadId = teamMember.find((tm) => tm.teamId === updatedTeam.id && tm.isLead).userId;
    const teamLead = user.find((usr) => usr.id === teamLeadId);
    const authToken = mockAuthToken(teamLead);

    // TEST
    await archiveTeam.resolve(undefined, {updatedTeam}, {authToken, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      team: r.table('Team').get(updatedTeam.id),
      notification: r.table('Notification').getAll(updatedTeam.orgId, {index: 'orgId'}).orderBy('startAt')
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
  });
});
