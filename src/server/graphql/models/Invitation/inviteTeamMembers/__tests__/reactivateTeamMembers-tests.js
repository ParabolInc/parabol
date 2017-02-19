import orgGenerator from 'server/__tests__/Organization/data/orgGenerator.js';
import cleanupOrgData from 'server/__tests__/utils/cleanupOrgData';
import refreshAuthToken from 'server/__tests__/utils/refreshAuthToken';
import {
  mockAuth0AuthenticationClientTokensGetInfo,
  mockAuth0ManagementClientUsersUpdateAppMetadata
} from 'server/__tests__/utils/mockAuth0.js';
import {
  mockStripeCustomersCreate,
  mockStripeSubscriptionsCreate,
  mockStripeSubscriptionsUpdate
} from 'server/__tests__/utils/mockStripe';
import signupTeam from 'server/__tests__/utils/signupTeam';
import signupTeamLeader from 'server/__tests__/utils/signupTeamLeader';

import {
  ADD_TO_TEAM,
  KICK_OUT,
  REJOIN_TEAM,
  PRESENCE,
  USER_MEMO
} from 'universal/subscriptions/constants';
import getRethink from 'server/database/rethinkDriver';
import teamMemberMutation from 'server/graphql/models/TeamMember/teamMemberMutation';

import reactivateTeamMembers from '../reactivateTeamMembers';

const testOrg = orgGenerator(2);

mockAuth0AuthenticationClientTokensGetInfo(testOrg.allTeamMembers);
mockAuth0ManagementClientUsersUpdateAppMetadata();
mockStripeCustomersCreate();
mockStripeSubscriptionsUpdate();
mockStripeSubscriptionsCreate();
console.error = jest.fn();

afterAll(async() => {
  const r = getRethink();
  await r.getPoolMaster().drain();
});

signupTeamLeader(testOrg.billingLeader);
signupTeam(
  testOrg.team,
  testOrg.billingLeader,
  testOrg.otherTeamMembers,
  () => refreshAuthToken(testOrg.billingLeader.id)
);

describe('team member reactivation', () => {
  test('member leaves a team', async() => {
    // SETUP
    const authToken = await refreshAuthToken(testOrg.billingLeader.id);
    const {resolve} = teamMemberMutation.removeTeamMember;
    const teamMemberId = `${testOrg.otherTeamMembers[0].id}::${testOrg.team.id}`;
    const exchange = { publish: jest.fn() };
    const socket = jest.fn();
    // TEST
    const result = await resolve({}, {teamMemberId}, {authToken, exchange, socket});
    // VERIFY
    const r = getRethink();
    const user = await r.table('User').get(testOrg.otherTeamMembers[0].id);
    expect(user.tms.length).toBe(0);
    expect(result).toBeTruthy();
    expect(exchange.publish.mock.calls.length).toBe(1);
    const [channel, message] = exchange.publish.mock.calls[0];
    expect(channel).toBe(`${USER_MEMO}/${testOrg.otherTeamMembers[0].id}`);
    expect(message).toEqual({
      type: KICK_OUT,
      teamId: testOrg.team.id,
      teamName: testOrg.team.name
    });
    expect(socket.mock.calls.length).toBe(0);
  });

  test('member reactivated on team', async() => {
    // SETUP
    const teamMemberId = `${testOrg.otherTeamMembers[0].id}::${testOrg.team.id}`;
    const exchange = { publish: jest.fn() };
    // TEST
    await reactivateTeamMembers(
      [teamMemberId],
      testOrg.team.id,
      testOrg.team.name,
      exchange,
      testOrg.billingLeader.id
    );
    // VERIFY
    const r = getRethink();
    const user = await r.table('User').get(testOrg.otherTeamMembers[0].id);
    expect(user.tms.length).toBe(1);
    expect(user.tms.includes(testOrg.team.id)).toBeTruthy();
    expect(exchange.publish.mock.calls.length).toBe(2);
    const [maybeUserMemo, maybeAddToTeamMessage] = exchange.publish.mock.calls[0];
    expect(maybeUserMemo).toBe(
      `${USER_MEMO}/${testOrg.otherTeamMembers[0].id}`
    );
    expect(maybeAddToTeamMessage).toEqual({
      type: ADD_TO_TEAM,
      teamId: testOrg.team.id,
      teamName: testOrg.team.name
    });
    const [maybePresence, maybeRejoinTeam] = exchange.publish.mock.calls[1];
    expect(maybePresence).toBe(
      `${PRESENCE}/${testOrg.team.id}`
    );
    expect(maybeRejoinTeam).toEqual({
      type: REJOIN_TEAM,
      name: testOrg.otherTeamMembers[0].auth0UserInfo.nickname,
      sender: testOrg.billingLeader.id
    });
  });
});

cleanupOrgData(testOrg.billingLeader, testOrg.otherTeamMembers);
