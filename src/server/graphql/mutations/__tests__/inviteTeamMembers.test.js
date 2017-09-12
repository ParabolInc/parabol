import MockDate from 'mockdate';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import {__now} from 'server/__tests__/setup/mockTimes';
import expectAsyncToThrow from 'server/__tests__/utils/expectAsyncToThrow';
import inviteTeamMembers from 'server/graphql/mutations/inviteTeamMembers';

MockDate.set(__now);
console.error = jest.fn();

describe('inviteTeamMembers', () => {
  test('throws in the caller is not on the team', async () => {
    // SETUP
    const authToken = mockAuthToken({id: 1, tms: ['fakeTeam'], lastSeenAt: new Date()});
    const invitees = [];
    const teamId = 'realTeam';

    // VERIFY
    await expectAsyncToThrow(
      inviteTeamMembers.resolve(undefined, {invitees, teamId}, {authToken}),
      [teamId]
    );
  });
});
