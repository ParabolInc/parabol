import DynamicSerializer from 'dynamic-serializer';
import MockDate from 'mockdate';
import MockPubSub from 'server/__mocks__/MockPubSub';
import makeDataLoader from 'server/__tests__/setup/makeDataLoader';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import MockDB from 'server/__tests__/setup/MockDB';
import {__now} from 'server/__tests__/setup/mockTimes';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import newInvitee from 'server/__tests__/utils/newInvitee';
import * as adjustUserCount from 'server/billing/helpers/adjustUserCount';
import getRethink from 'server/database/rethinkDriver';
import hashInviteTokenKey from 'server/graphql/models/Invitation/inviteTeamMembers/hashInviteTokenKey';
import makeInviteToken from 'server/graphql/models/Invitation/inviteTeamMembers/makeInviteToken';
import parseInviteToken from 'server/graphql/models/Invitation/inviteTeamMembers/parseInviteToken';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import {ADD_USER} from 'server/utils/serverConstants';
import * as tmsSignToken from 'server/utils/tmsSignToken';
import {TEAM_INVITE} from 'universal/utils/constants';
import acceptTeamInviteEmail from 'server/graphql/mutations/acceptTeamInviteEmail';

MockDate.set(__now);
console.error = jest.fn();

describe('acceptTeamInviteEmail', () => {
  beforeEach(() => {
    auth0ManagementClient.users.updateAppMetadata.mockReset();
  });

  test.only('adds an invitee who was not previously in the org', async () => {
    // SETUP
    adjustUserCount.default = jest.fn();
    tmsSignToken.default = jest.fn(() => 'FAKEENCODEDJWT');
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const mockPubSub = new MockPubSub();
    const invitee = newInvitee('acceptTeamInviteEmail1');
    const inviteToken = makeInviteToken();
    const {id} = parseInviteToken(inviteToken);
    const hashedToken = await hashInviteTokenKey(inviteToken);
    await mockDB.init()
      .newUser({name: 'inviteeGuy', tms: [], userOrgs: [], email: invitee.email})
      .newNotification(undefined, {type: TEAM_INVITE, email: invitee.email})
      .newInvitation({id, hashedToken, email: invitee.email});
    const teamId = mockDB.context.team.id;
    const inviteeUser = mockDB.context.user;
    const authToken = mockAuthToken(inviteeUser);
    const dataLoader = makeDataLoader(authToken);
    const orgId = mockDB.context.organization.id;
    auth0ManagementClient.__initMock(mockDB.db);
    const tms = [teamId];
    // TEST
    await acceptTeamInviteEmail.resolve(undefined, {inviteToken}, {authToken, dataLoader});

    // VERIFY
    const db = await fetchAndSerialize({
      user: r.table('User').get(inviteeUser.id),
      teamMember: r.table('TeamMember').get(`${inviteeUser.id}::${teamId}`),
      notification: r.table('Notification').getAll(orgId, {index: 'orgId'}).orderBy('userIds').coerceTo('array'),
      invitation: r.table('Invitation')
        .getAll(inviteeUser.email, {index: 'email'})
        .filter({teamId})
        .orderBy('tokenExpiration')
        .coerceTo('array')
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
    expect(mockPubSub.__serialize(dynamicSerializer)).toMatchSnapshot();
    expect(adjustUserCount.default).toHaveBeenCalledWith(inviteeUser.id, orgId, ADD_USER);
    expect(auth0ManagementClient.users.updateAppMetadata).toHaveBeenCalledWith({id: inviteeUser.id}, {tms});
  });
  test('adds an invitee who was previously in the org', async () => {
    // SETUP
    adjustUserCount.default = jest.fn();
    tmsSignToken.default = jest.fn(() => 'FAKEENCODEDJWT');
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const mockPubSub = new MockPubSub();
    const inviteToken = makeInviteToken();
    const {id} = parseInviteToken(inviteToken);
    const hashedToken = await hashInviteTokenKey(inviteToken);
    await mockDB.init()
      .newTeam({orgId: mockDB.context.organization.id})
      .newNotification(undefined, {type: TEAM_INVITE, email: mockDB.db.user[1].email})
      .newInvitation({id, hashedToken, email: mockDB.db.user[1].email});
    const teamId = mockDB.context.team.id;
    const inviteeUser = mockDB.db.user[1];
    const authToken = mockAuthToken(inviteeUser);
    const dataLoader = makeDataLoader(authToken);
    const orgId = mockDB.context.organization.id;
    auth0ManagementClient.__initMock(mockDB.db);
    const tms = [mockDB.db.team[0].id, teamId];

    // TEST
    await acceptTeamInviteEmail.resolve(undefined, {inviteToken}, {authToken, dataLoader});

    // VERIFY
    const db = await fetchAndSerialize({
      user: r.table('User').get(inviteeUser.id),
      teamMember: r.table('TeamMember').get(`${inviteeUser.id}::${teamId}`),
      notification: r.table('Notification').getAll(orgId, {index: 'orgId'}).orderBy('userIds').coerceTo('array'),
      invitation: r.table('Invitation')
        .getAll(inviteeUser.email, {index: 'email'})
        .filter({teamId})
        .orderBy('tokenExpiration')
        .coerceTo('array')
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
    expect(mockPubSub.__serialize(dynamicSerializer)).toMatchSnapshot();
    expect(adjustUserCount.default).toHaveBeenCalledTimes(0);
    expect(auth0ManagementClient.users.updateAppMetadata).toHaveBeenCalledWith({id: inviteeUser.id}, {tms});
  });
});
