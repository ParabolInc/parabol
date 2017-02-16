import test from 'ava';
import sinon from 'sinon';
import shortid from 'shortid';
import {verify} from 'jsonwebtoken';

import getRethink from '../database/rethinkDriver';
import mintToken, {mintTokenSigned} from './utils/mintToken';
import {
  auth0AuthenticationClient,
  auth0ManagementClient,
  clientSecret as auth0ClientSecret
} from '../utils/auth0Helpers';

import invitationMutation from '../graphql/models/Invitation/invitationMutation';
import teamMutation from '../graphql/models/Team/teamMutation';
import teamMemberMutation from '../graphql/models/TeamMember/teamMemberMutation';
import userMutation from '../graphql/models/User/userMutation';

const ORG1_BILLING_LEADER = {
  id: 'avajs|captainAmerica',
  auth0UserInfo: {
    email: 'captain.america@avengers.org',
    email_verified: false,
    name: 'Captain America',
    nickname: 'Captain America',
    picture: null,
    user_id: 'avajs|captainAmerica',
    created_at: '2017-02-14T00:00:00Z',
    updated_at: '2017-02-14T00:00:00Z',
  }
};

const ORG1_TEAM_MEMBERS = [
  {
    id: 'avajs|vision',
    auth0UserInfo: {
      email: 'vision@avengers.org',
      email_verified: false,
      name: 'Vision',
      nickname: 'Vision',
      picture: null,
      user_id: 'avajs|vision',
      created_at: '2017-02-14T00:00:00Z',
      updated_at: '2017-02-14T00:00:00Z',
    }
  },
  {
    id: 'avajs|warmachine',
    auth0UserInfo: {
      email: 'war.machine@avengers.org',
      email_verified: false,
      name: 'War Machine',
      nickname: 'War Machine',
      picture: null,
      user_id: 'avajs|warmachine',
      created_at: '2017-02-14T00:00:00Z',
      updated_at: '2017-02-14T00:00:00Z',
    }
  },
];

const ORG1_TEAM = {
  id: shortid.generate(),
  name: 'The Avengers'
};

/*
 * Simulate a new user signup from auth0, generate a token:
 */

test.before(() => {
  sinon
    .stub(auth0AuthenticationClient.tokens, 'getInfo')
    .callsFake(auth0Token => {
      const authToken = verify(auth0Token, Buffer.from(auth0ClientSecret, 'base64'));
      const match = [ORG1_BILLING_LEADER, ...ORG1_TEAM_MEMBERS].find((teamMember) =>
        teamMember.id === authToken.sub);
      if (match) {
        return match.auth0UserInfo;
      }
      throw new Error(
        `auth0Client.tokens.getInfo (mock): unknown id ${authToken.sub}`
      );
    });

  sinon
    .stub(auth0ManagementClient.users, 'updateAppMetadata')
    .callsFake(() => true);
});

test.serial('user signup from auth0', async(t) => {
  t.plan(2);
  const auth0Token = mintTokenSigned(ORG1_BILLING_LEADER.id);
  const {resolve} = userMutation.updateUserWithAuthToken;
  const result = await resolve({}, {auth0Token, isUnitTest: true});
  t.is(result.id, ORG1_BILLING_LEADER.id);
  t.is(result.email, ORG1_BILLING_LEADER.auth0UserInfo.email);
});

test.beforeEach(async(t) => {
  const r = getRethink();
  const {id: userId} = ORG1_BILLING_LEADER;
  const user = await r.table('User').get(userId).default({tms: null});
  t.context.authToken = mintToken(userId, {tms: user.tms});
});

test.serial('update user profile', async(t) => {
  t.plan(2);
  const expectedName = 'Cpt. America';
  const {authToken} = t.context;
  const {resolve} = userMutation.updateUserProfile;
  const updatedUser = {
    id: ORG1_BILLING_LEADER.id,
    preferredName: expectedName
  };
  const result = await resolve({}, {updatedUser}, {authToken});
  t.is(result.id, ORG1_BILLING_LEADER.id);
  t.is(result.preferredName, expectedName);
});

/*
 * We must wait for the work performed in setTimeout()
 * to complete, therefore this test must be a callback,
 * not a promise.
 */
test.cb.serial('createFirstTeam', (t) => {
  const {authToken} = t.context;
  const unitTestCb = () => {
    t.pass();
    t.end();
  };
  const {resolve} = teamMutation.createFirstTeam;
  const newTeam = { ...ORG1_TEAM };
  resolve({}, {newTeam}, {authToken, unitTestCb})
  .then((result) => t.is(typeof result, 'string'))
  .catch((e) => {
    t.fail(`${e}`);
    t.end();
  });
});

test.serial('createFirstTeam disallow second team', (t) => {
  const {authToken} = t.context;
  const {resolve} = teamMutation.createFirstTeam;
  const newTeam = { ...ORG1_TEAM };
  t.throws(resolve({}, {newTeam}, {authToken}));
});

test.cb.serial('invite team members and accept invitations', (t) => {
  // Done as one test, because we need inviteeTokens to test
  // the acceptInvitation endpoint
  const unitTestCb = async(inviteesWithTokens) => {
    const {resolve: acceptInvitation} = teamMemberMutation.acceptInvitation;
    const exchange = { publish: () => console.log('publish!') };
    const acceptPromises = inviteesWithTokens.map(async(inviteeWithToken) => {
      const {email, inviteToken} = inviteeWithToken;
      const {id: userId} = ORG1_TEAM_MEMBERS.find((member) =>
        member.auth0UserInfo.email === email);
      const auth0Token = mintTokenSigned(userId);
      const {resolve: updateUserWithAuthToken} = userMutation.updateUserWithAuthToken;
      await updateUserWithAuthToken({}, {auth0Token, isUnitTest: true});
      const authToken = mintToken(userId);
      return acceptInvitation({}, {inviteToken}, {authToken, exchange});
      // use token and stubbed exchangeApi to accept invitation
    });
    try {
      await Promise.all(acceptPromises);
    } catch (e) {
      console.log(`exception: ${e}`);
      console.trace();
      t.fail();
      t.end();
    }
    // validate that number of invitees is correct
    // validate that exchange was called the apppropriate number of times
    t.pass();
    t.end();
  };
  const {authToken} = t.context;
  const teamId = authToken.tms[0];
  const {resolve} = invitationMutation.inviteTeamMembers;
  const invitees = ORG1_TEAM_MEMBERS.map(member => {
    const {auth0UserInfo: {email, name: fullName}} = member;
    return { email, fullName, task: '' };
  });
  resolve({}, {invitees, teamId}, {authToken, unitTestCb})
  .catch((e) => {
    t.fail(`${e}`);
    t.end();
  });
});

// TODO:
//   * formulate invite token from database
//   * bypass the token validation to accept invitation

//   * call addTeam a bunch
//   * invite others to teams
//   * add current billing information
//   * advance time? generate invoice?
