import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import MockDB from 'server/__tests__/setup/MockDB';

import {PERSONAL, PRO, ENTERPRISE} from 'universal/utils/constants';

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

    // TEST
    try {
      await updateTeamCheckInQuestion.resolve(
        undefined,
        {teamId: team.id, checkInQuestion: 'New check-in question'},
        {authToken}
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

    // TEST
    try {
      await updateTeamCheckInQuestion.resolve(
        undefined,
        {teamId: team.id, checkInQuestion: 'New check-in question'},
        {authToken}
      );
    } catch (error) {
      expect(error.message).toMatch('Unauthorized');
    }
  });

  it('allows super-users to edit the check-in question regardless of membership or price tier', async () => {
    expect.assertions(1);

    // SETUP
    const db = new MockDB();
    const {user: [user], team: [team]} = await db
      .newTeam({tier: PERSONAL})
      .newUser({name: 'super-user'});
    const authToken = mockAuthToken(user, {rol: 'su'});
    const checkInQuestion = 'New check-in question';

    // TEST
    const updatedQuestion = await updateTeamCheckInQuestion.resolve(
      undefined,
      {teamId: team.id, checkInQuestion},
      {authToken}
    );
    expect(updatedQuestion).toEqual(checkInQuestion);
  });

  it('allows team members of paid teams to edit the check-in question', async () => {
    expect.assertions(1);

    // SETUP
    const db = new MockDB();
    const {user: [user], team: [team]} = await db
      .newTeam({tier: ENTERPRISE})
      .newUser({name: 'enterprise-user'});
    await db.newTeamMember({teamId: team.id, userId: user.id});
    const authToken = mockAuthToken(user);
    const checkInQuestion = 'New check-in question';

    // TEST
    const updatedQuestion = await updateTeamCheckInQuestion.resolve(
      undefined,
      {teamId: team.id, checkInQuestion},
      {authToken}
    );
    expect(updatedQuestion).toEqual(checkInQuestion);
  });

  it('removes trailing `?` from the check-in question', async () => {
    expect.assertions(1);

    // SETUP
    const db = new MockDB();
    const {user: [user], team: [team]} = await db
      .newTeam({tier: PRO})
      .newUser({name: 'pro-user'});
    await db.newTeamMember({teamId: team.id, userId: user.id});
    const authToken = mockAuthToken(user);

    // TEST
    const updatedQuestion = await updateTeamCheckInQuestion.resolve(
      undefined,
      {teamId: team.id, checkInQuestion: 'New check-in question?'},
      {authToken}
    );
    expect(updatedQuestion).toEqual('New check-in question');
  });
});
