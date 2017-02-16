import test from 'ava';
import sinon from 'sinon';
import shortid from 'shortid';
import {verify} from 'jsonwebtoken';

import {
  auth0AuthenticationClient,
  auth0ManagementClient,
  clientSecret as auth0ClientSecret
} from '../utils/auth0Helpers';
import {toEpochSeconds} from '../utils/epochTime';
import mintToken, {mintTokenSigned} from './utils/mintToken';
import getRethink from '../database/rethinkDriver';
import stripe from '../billing/stripe';

import invitationMutation from '../graphql/models/Invitation/invitationMutation';
import teamMutation from '../graphql/models/Team/teamMutation';
import teamMemberMutation from '../graphql/models/TeamMember/teamMemberMutation';
import userMutation from '../graphql/models/User/userMutation';

/*
 * How many rows in the database should this unit test create?
 *
 * This is a sanity check, to make sure tests are updated when the
 * schema changes. If the row count changes, consider adding tests.
 */
const EXPECTED_ROWS_CREATED = 37;

const ORG1_BILLING_LEADER = {
  id: 'avajs|steveRogers',
  auth0UserInfo: {
    email: 'steve.rogers@avengers.org',
    email_verified: false,
    name: 'Steve Rogers',
    nickname: 'Captain America',
    picture: null,
    user_id: 'avajs|steveRogers',
    created_at: '2017-02-14T00:00:00Z',
    updated_at: '2017-02-14T00:00:00Z',
  }
};

const ORG1_TEAM_MEMBERS = [
  {
    id: 'avajs|jonas',
    auth0UserInfo: {
      email: 'vision@avengers.org',
      email_verified: false,
      name: 'Jonas',
      nickname: 'Vision',
      picture: null,
      user_id: 'avajs|jonas',
      created_at: '2017-02-14T00:00:00Z',
      updated_at: '2017-02-14T00:00:00Z',
    }
  },
  {
    id: 'avajs|jamesRhodes',
    auth0UserInfo: {
      email: 'james.rhodes@avengers.org',
      email_verified: false,
      name: 'James Rhodes',
      nickname: 'War Machine',
      picture: null,
      user_id: 'avajs|jamesRhodes',
      created_at: '2017-02-14T00:00:00Z',
      updated_at: '2017-02-14T00:00:00Z',
    }
  },
  {
    id: 'avajs|tonyStark',
    auth0UserInfo: {
      email: 'tony.stark@avengers.org',
      email_verified: false,
      name: 'Tony Stark',
      nickname: 'War Machine',
      picture: null,
      user_id: 'avajs|tonyStark',
      created_at: '2017-02-14T00:00:00Z',
      updated_at: '2017-02-14T00:00:00Z',
    }
  },
  {
    id: 'avajs|bruceBanner',
    auth0UserInfo: {
      email: 'bruce.banner@avengers.org',
      email_verified: false,
      name: 'Bruce Banner',
      nickname: 'Hulk',
      picture: null,
      user_id: 'avajs|bruceBanner',
      created_at: '2017-02-14T00:00:00Z',
      updated_at: '2017-02-14T00:00:00Z',
    }
  },
  {
    id: 'avajs|natashaRomanova',
    auth0UserInfo: {
      email: 'natasha.romanova@avengers.org',
      email_verified: false,
      name: 'Natasha Romanova',
      nickname: 'Black Widow',
      picture: null,
      user_id: 'avajs|natashaRomanova',
      created_at: '2017-02-14T00:00:00Z',
      updated_at: '2017-02-14T00:00:00Z',
    }
  },
  {
    id: 'avajs|kyleRichmond',
    auth0UserInfo: {
      email: 'kyle.richmond@avengers.org',
      email_verified: false,
      name: 'Kyle Richmond',
      nickname: 'Nighthawk',
      picture: null,
      user_id: 'avajs|kyleRichmond',
      created_at: '2017-02-14T00:00:00Z',
      updated_at: '2017-02-14T00:00:00Z',
    }
  },
  {
    id: 'avajs|thorOdinson',
    auth0UserInfo: {
      email: 'thor@avengers.org',
      email_verified: false,
      name: 'Thor Odinson',
      nickname: 'Thor',
      picture: null,
      user_id: 'avajs|thorOdinson',
      created_at: '2017-02-14T00:00:00Z',
      updated_at: '2017-02-14T00:00:00Z',
    }
  }
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

  sinon
    .stub(stripe.customers, 'create')
    .callsFake((options) => {
      const id = `cust_${shortid.generate()}`;
      const {metadata} = options;
      return {
        id,
        object: 'customer',
        created: toEpochSeconds(new Date()),
        currency: null,
        default_source: null,
        delinquent: false,
        description: null,
        discount: null,
        email: null,
        livemode: false,
        metadata,
        shipping: null,
        sources: {
          object: 'list',
          data: [],
          has_more: false,
          total_count: 0,
          url: `/v1/customers/${id}/sources`
        },
        subscriptions: {
          object: 'list',
          data: [],
          has_more: false,
          total_count: 0,
          url: `/v1/customers/${id}/subscriptions`
        }
      };
    });

  sinon
    .stub(stripe.subscriptions, 'create')
    .callsFake(() => {
      const stripeSubscriptionId = `sub_${shortid.generate()}`;
      const PERIOD_LENGTH = 2592000;
      const now = toEpochSeconds(new Date());
      return {
        stripeSubscriptionId,
        current_period_start: now,
        current_period_end: now + PERIOD_LENGTH
      };
    });

  sinon
    .stub(stripe.subscriptions, 'update')
    .callsFake(() => true);
});

if (process.env.NODE_ENV === 'testing') {
  test.after.always('delete org1 test data', async(t) => {
    const r = getRethink();
    // how many rows in the database?
    const preDeleteRowCount = await r.db('actionTesting').tableList()
      .map((tableName) =>
        r.db('actionTesting').table(tableName).count()
      )
      .sum();
    const dbWork = [
      r.expr(ORG1_TEAM_MEMBERS.map((tm) => tm.auth0UserInfo.email))
        .forEach((email) => r.table('Invitation').filter({email}).delete()),
      r.expr(ORG1_TEAM_MEMBERS.map((tm) => tm.id))
        .forEach((userId) => r.table('InvoiceItemHook').filter({userId}).delete()),
      r.table('Notification')
        .getAll(ORG1_BILLING_LEADER.id, {index: 'userIds'}).delete(),
      r.table('Organization')
        .getAll(ORG1_BILLING_LEADER.id, {index: 'orgUsers'})
        .nth(0)
        .do((org) =>
          r.db('actionTesting').table('Team')
            .getAll(org('id'), {index: 'orgId'})
            .delete()
        ),
      r.table('Organization')
        .getAll(ORG1_BILLING_LEADER.id, {index: 'orgUsers'}).delete(),
      r.table('TeamMember')
        .getAll(ORG1_BILLING_LEADER.id, {index: 'userId'})
        .pluck('teamId', 'userId')
        .nth(0)
        .do((tm) =>
          r.db('actionTesting').table('Project')
            .getAll(r.add(tm('userId'), '::', tm('teamId')), {index: 'teamMemberId'})
            .delete()
        ),
      r.table('TeamMember')
        .getAll(ORG1_BILLING_LEADER.id, {index: 'userId'})
        .pluck('teamId', 'userId')
        .nth(0)
        .do((tm) =>
          r.db('actionTesting').table('ProjectHistory')
            .filter({teamMemberId: r.add(tm('userId'), '::', tm('teamId'))})
            .delete()
        ),
      r.table('TeamMember')
        .getAll(...[ORG1_BILLING_LEADER, ...ORG1_TEAM_MEMBERS].map((tm) => tm.id),
          {index: 'userId'})
        .delete(),
      r.table('User')
        .getAll(...[ORG1_BILLING_LEADER, ...ORG1_TEAM_MEMBERS].map((tm) => tm.id),
          {index: 'id'})
        .delete()
    ];
    await Promise.all(dbWork);
    const postDeleteRowCount = await r.db('actionTesting').tableList()
      .map((tableName) =>
        r.db('actionTesting').table(tableName).count()
      )
      .sum();
    t.is(preDeleteRowCount - postDeleteRowCount, EXPECTED_ROWS_CREATED);
  });
}

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
    const exchange = { publish: () => true };
    const exchangeMock = sinon.mock(exchange);
    exchangeMock.expects('publish').exactly(ORG1_TEAM_MEMBERS.length);

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
    exchangeMock.verify();
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
//   * promote Iron Man as billing leader
//   * call addTeam a bunch
//   * invite others to teams
//   * add current billing information
//   * advance time? generate invoice?
