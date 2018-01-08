import convertToRichText from 'server/__tests__/setup/convertToRichText';
import makeDataLoader from 'server/__tests__/setup/makeDataLoader';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import MockDB from 'server/__tests__/setup/MockDB';
import getRethink from 'server/database/rethinkDriver';
import {ENTERPRISE, PERSONAL, PRO} from 'universal/utils/constants';
import updateTeamCheckInQuestion from '../updateTeamCheckInQuestion';

console.error = jest.fn();

describe('updateTeamCheckInQuestion mutation resolver', () => {
  it('throws an `unauthorized` error when a non-team member tries to update the question', async () => {
    expect.assertions(1);

    // SETUP
    const db = new MockDB();
    const {user: [user], team: [team]} = await db
      .newUser({name: 'non-team-member'})
      .newTeam({tier: PRO});
    const authToken = mockAuthToken(user);
    const dataLoader = makeDataLoader(authToken);

    // TEST
    try {
      await updateTeamCheckInQuestion.resolve(
        undefined,
        {teamId: team.id, checkInQuestion: 'New check-in question'},
        {authToken, dataLoader}
      );
    } catch (error) {
      expect(error.message).toMatch('You do not have access to team');
    }
  });

  it('throws an `unauthorized` error when a member of a non-paid team tries to update the question', async () => {
    expect.assertions(1);

    // SETUP
    const db = new MockDB();
    const {user: [user], team: [team]} = await db
      .newTeam({tier: PERSONAL})
      .newUser({name: 'personal-user'});
    await db.newTeamMember({teamId: team.id, userId: user.id});
    const authToken = mockAuthToken(user);
    const dataLoader = makeDataLoader(authToken);
    // TEST
    try {
      await updateTeamCheckInQuestion.resolve(
        undefined,
        {teamId: team.id, checkInQuestion: 'New check-in question'},
        {authToken, dataLoader}
      );
    } catch (error) {
      expect(error.message).toMatch('Unauthorized');
    }
  });

  it('allows team members of paid teams to edit the check-in question', async () => {
    expect.assertions(2);
    const r = getRethink();
    // SETUP
    const db = new MockDB();
    const {user: [user], team: [team]} = await db
      .newTeam({tier: ENTERPRISE})
      .newUser({name: 'enterprise-user'});
    await db.newTeamMember({teamId: team.id, userId: user.id});
    const authToken = mockAuthToken(user);
    const dataLoader = makeDataLoader(authToken);
    const checkInQuestion = convertToRichText('New check-in question');

    // TEST
    const {teamId} = await updateTeamCheckInQuestion.resolve(
      undefined,
      {teamId: team.id, checkInQuestion},
      {authToken, dataLoader}
    );
    const updatedTeam = await r.table('Team').get(teamId);
    expect(updatedTeam.checkInQuestion).toEqual(checkInQuestion);
    expect(dataLoader.isShared()).toEqual(true);
  });
});
