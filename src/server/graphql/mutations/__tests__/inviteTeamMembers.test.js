import MockDate from 'mockdate';
import makeDataLoader from 'server/__tests__/setup/makeDataLoader';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import {__now} from 'server/__tests__/setup/mockTimes';
import inviteTeamMembers from 'server/graphql/mutations/inviteTeamMembers';

MockDate.set(__now);
console.error = jest.fn();

describe('inviteTeamMembers', () => {
  test('returns error if the caller is not on the team', async () => {
    // SETUP
    const authToken = mockAuthToken({id: 1, tms: ['fakeTeam'], lastSeenAt: new Date()});
    const invitees = [];
    const teamId = 'realTeam';
    const dataLoader = makeDataLoader(authToken);
    // VERIFY
    const res = await inviteTeamMembers.resolve(undefined, {invitees, teamId}, {authToken, dataLoader});
    expect(res).toEqual(expect.objectContaining({error: expect.any(Object)}))
  });
});
