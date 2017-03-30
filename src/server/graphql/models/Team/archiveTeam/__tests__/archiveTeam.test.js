import MockDate from 'mockdate';
import {__now} from 'server/__tests__/setup/mockTimes';
import MockDB from 'server/__tests__/setup/MockDB';
import archiveTeam from 'server/graphql/models/Team/archiveTeam/archiveTeam';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import socket from 'server/__mocks__/socket';

MockDate.set(__now);
console.error = jest.fn();

describe('ArchiveTeam', () => {
  test('archives a team', async () => {
    // SETUP
    const mockDB = new MockDB();
    const {user, team, teamMember} = await mockDB.init();
    const updatedTeam = team[0];
    updatedTeam.isArchived = true;
    updatedTeam.name = updatedTeam.teamName;
    const teamLeadId = teamMember.find((tm) => tm.teamId === updatedTeam.id && tm.isLead).userId;
    const teamLead = user.find((usr) => usr.id === teamLeadId);
    const authToken = mockAuthToken(teamLead);
    // TEST
    await archiveTeam.resolve(undefined, {updatedTeam}, {authToken, socket});
  });
});
