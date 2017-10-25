import DynamicSerializer from 'dynamic-serializer';
import MockDate from 'mockdate';
import MockDB from 'server/__tests__/setup/MockDB';
import {__now} from 'server/__tests__/setup/mockTimes';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import newInvitee from 'server/__tests__/utils/newInvitee';
import acceptTeamInvite from 'server/safeMutations/acceptTeamInvite';
import * as adjustUserCount from 'server/billing/helpers/adjustUserCount';
import {ADD_USER} from 'server/utils/serverConstants';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import {NEW_AUTH_TOKEN, NOTIFICATIONS_ADDED, NOTIFICATIONS_CLEARED, TEAM_INVITE} from 'universal/utils/constants';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import makeMockPubSub from 'server/__mocks__/makeMockPubSub';
import * as getPubSub from 'server/utils/getPubSub';
import getRethink from 'server/database/rethinkDriver';

MockDate.set(__now);
console.error = jest.fn();

describe('acceptTeamInvite', () => {
  beforeEach(() => {
    auth0ManagementClient.users.updateAppMetadata.mockReset();
  });

  test('adds an invitee who was not previously in the org', async () => {
    // SETUP
    adjustUserCount.default = jest.fn();
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const invitee = newInvitee('acceptTeamInvite1');
    await mockDB.init()
      .newUser({name: 'inviteeGuy', tms: [], userOrgs: [], email: invitee.email})
      .newNotification(undefined, {type: TEAM_INVITE, email: invitee.email});
    const teamId = mockDB.context.team.id;
    const inviteeUser = mockDB.context.user;
    const authToken = mockAuthToken(inviteeUser);
    const orgId = mockDB.context.organization.id;
    auth0ManagementClient.__initMock(mockDB.db);
    const mockPubSub = makeMockPubSub();
    getPubSub.default = () => mockPubSub;
    const tms = [teamId];
    // TEST
    const res = await acceptTeamInvite(teamId, authToken, inviteeUser.email);

    // VERIFY
    const db = await fetchAndSerialize({
      user: r.table('User').get(inviteeUser.id),
      teamMember: r.table('TeamMember').get(`${inviteeUser.id}::${teamId}`),
      notification: r.table('Notification').getAll(orgId, {index: 'orgId'}).orderBy('userIds').coerceTo('array'),
      invitation: r.table('Invitation').getAll(inviteeUser.email, {index: 'email'}).orderBy('tokenExpiration').coerceTo('array')
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();

    expect(mockPubSub.publish.mock.calls[0][0]).toEqual(`${NOTIFICATIONS_CLEARED}.${inviteeUser.id}`);
    expect(mockPubSub.publish.mock.calls[1][0]).toEqual(`${NOTIFICATIONS_ADDED}.${teamId}`);
    expect(mockPubSub.publish.mock.calls[2][0]).toEqual(`${NEW_AUTH_TOKEN}.${inviteeUser.id}`);
    expect(mockPubSub.publish.mock.calls[3][0]).toEqual(`${NOTIFICATIONS_ADDED}.${inviteeUser.id}`);
    expect(mockPubSub.publish.mock.calls[3][1].notificationsAdded.notifications[0]).toEqual(res);
    expect(adjustUserCount.default).toHaveBeenCalledWith(inviteeUser.id, orgId, ADD_USER);
    expect(auth0ManagementClient.users.updateAppMetadata).toHaveBeenCalledWith({id: inviteeUser.id}, {tms});
  });
  test('adds an invitee who was previously in the org', async () => {
    // SETUP
    adjustUserCount.default = jest.fn();
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    await mockDB.init()
      .newTeam({orgId: mockDB.context.organization.id})
      .newNotification(undefined, {type: TEAM_INVITE, email: mockDB.db.user[1].email});
    const teamId = mockDB.context.team.id;
    const inviteeUser = mockDB.db.user[1];
    const authToken = mockAuthToken(inviteeUser);
    const orgId = mockDB.context.organization.id;
    auth0ManagementClient.__initMock(mockDB.db);
    const mockPubSub = makeMockPubSub();
    getPubSub.default = () => mockPubSub;
    const tms = [mockDB.db.team[0].id, teamId];

    // TEST
    const res = await acceptTeamInvite(teamId, authToken, inviteeUser.email);

    // VERIFY
    const db = await fetchAndSerialize({
      user: r.table('User').get(inviteeUser.id),
      teamMember: r.table('TeamMember').get(`${inviteeUser.id}::${teamId}`),
      notification: r.table('Notification').getAll(orgId, {index: 'orgId'}).orderBy('userIds').coerceTo('array'),
      invitation: r.table('Invitation').getAll(inviteeUser.email, {index: 'email'}).orderBy('tokenExpiration').coerceTo('array')
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();

    expect(mockPubSub.publish.mock.calls[0][0]).toEqual(`${NOTIFICATIONS_CLEARED}.${inviteeUser.id}`);
    expect(mockPubSub.publish.mock.calls[1][0]).toEqual(`${NOTIFICATIONS_ADDED}.${teamId}`);
    expect(mockPubSub.publish.mock.calls[2][0]).toEqual(`${NEW_AUTH_TOKEN}.${inviteeUser.id}`);
    expect(mockPubSub.publish.mock.calls[3][0]).toEqual(`${NOTIFICATIONS_ADDED}.${inviteeUser.id}`);
    expect(mockPubSub.publish.mock.calls[3][1].notificationsAdded.notifications[0]).toEqual(res);
    expect(adjustUserCount.default).toHaveBeenCalledTimes(0);
    expect(auth0ManagementClient.users.updateAppMetadata).toHaveBeenCalledWith({id: inviteeUser.id}, {tms});
  });
});
