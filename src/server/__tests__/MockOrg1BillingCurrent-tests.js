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

auth0AuthenticationClient.tokens.getInfo = jest.fn((auth0Token) => {
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

auth0ManagementClient.users.updateAppMetadata = jest.fn(() => true);

stripe.customers.create = jest.fn((options) => {
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

stripe.subscriptions.create = jest.fn(() => {
  const stripeSubscriptionId = `sub_${shortid.generate()}`;
  const PERIOD_LENGTH = 2592000;
  const now = toEpochSeconds(new Date());
  return {
    stripeSubscriptionId,
    current_period_start: now,
    current_period_end: now + PERIOD_LENGTH
  };
});

stripe.subscriptions.update = jest.fn(() => true);

afterAll(async() => {
  const r = getRethink();
  await r.getPoolMaster().drain();
});

describe('team leader signup', () => {
  test('with mocked auth0 token', async() => {
    const auth0Token = mintTokenSigned(ORG1_BILLING_LEADER.id);
    const {resolve} = userMutation.updateUserWithAuthToken;
    const result = await resolve({}, {auth0Token, isUnitTest: true});
    expect(result.id).toBe(ORG1_BILLING_LEADER.id);
    expect(result.email).toBe(ORG1_BILLING_LEADER.auth0UserInfo.email);
  });
});

describe('team setup', () => {
  let authToken;

  beforeEach(async() => {
    const r = getRethink();
    const {id: userId} = ORG1_BILLING_LEADER;
    const user = await r.table('User').get(userId).default({tms: null});
    authToken = mintToken(userId, {tms: user.tms});
  });

  test('update user profile', async() => {
    const expectedName = 'Cpt. America';
    const {resolve} = userMutation.updateUserProfile;
    const updatedUser = {
      id: ORG1_BILLING_LEADER.id,
      preferredName: expectedName
    };
    const result = await resolve({}, {updatedUser}, {authToken});
    expect(result.id).toBe(ORG1_BILLING_LEADER.id);
    expect(result.preferredName).toBe(expectedName);
  });

  /*
   * We must wait for the work performed in setTimeout()
   * to complete, therefore this test must be a callback,
   * not a promise.
   */
  test('createFirstTeam', (done) => {
    const unitTestCb = () => {
      done();
    };
    const {resolve} = teamMutation.createFirstTeam;
    const newTeam = { ...ORG1_TEAM };
    resolve({}, {newTeam}, {authToken, unitTestCb})
    .then((result) => expect(typeof result).toBe('string'));
  });

  expect('createFirstTeam disallow second team', () => {
    const {resolve} = teamMutation.createFirstTeam;
    const newTeam = { ...ORG1_TEAM };
    expect(resolve({}, {newTeam}, {authToken})).toThrow();
  });

  test('invite team members and accept invitations', (done) => {
    // Done as one test, because we need inviteeTokens to test
    // the acceptInvitation endpoint
    const unitTestCb = async(inviteesWithTokens) => {
      const {resolve: acceptInvitation} = teamMemberMutation.acceptInvitation;
      const exchange = { publish: jest.fn() };

      const acceptPromises = inviteesWithTokens.map(async(inviteeWithToken) => {
        const {email, inviteToken} = inviteeWithToken;
        const {id: userId} = ORG1_TEAM_MEMBERS.find((member) =>
          member.auth0UserInfo.email === email);
        const auth0Token = mintTokenSigned(userId);
        const {resolve: updateUserWithAuthToken} = userMutation.updateUserWithAuthToken;
        await updateUserWithAuthToken({}, {auth0Token, isUnitTest: true});
        const userAuthToken = mintToken(userId);
        return acceptInvitation({}, {inviteToken}, {authToken: userAuthToken, exchange});
      });
      await Promise.all(acceptPromises);
      expect(exchange.publish.mock.calls.length).toBe(ORG1_TEAM_MEMBERS.length);
      done();
    };
    const teamId = authToken.tms[0];
    const {resolve} = invitationMutation.inviteTeamMembers;
    const invitees = ORG1_TEAM_MEMBERS.map(member => {
      const {auth0UserInfo: {email, name: fullName}} = member;
      return { email, fullName, task: '' };
    });
    resolve({}, {invitees, teamId}, {authToken, unitTestCb})
    .catch((e) => { throw new Error(`${e}`); });
  });

// TODO:
//   * promote Iron Man as billing leader
//   * call addTeam a bunch
//   * invite others to teams
//   * add current billing information
//   * advance time? generate invoice?

  if (process.env.NODE_ENV === 'testing') {
    test('count rows and delete org1 test data', async() => {
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
      return expect(preDeleteRowCount - postDeleteRowCount).toBe(EXPECTED_ROWS_CREATED);
    });
  }
}); // end team setup suite
