import DynamicSerializer from 'dynamic-serializer';
import MockDate from 'mockdate';
import makeMockPubSub from 'server/__mocks__/makeMockPubSub';
import socket from 'server/__mocks__/socket';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import MockDB from 'server/__tests__/setup/MockDB';
import {__now} from 'server/__tests__/setup/mockTimes';
import expectAsyncToThrow from 'server/__tests__/utils/expectAsyncToThrow';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import getRethink from 'server/database/rethinkDriver';
import approveToOrg from 'server/graphql/mutations/approveToOrg';
import * as sendTeamInvitations from 'server/safeMutations/sendTeamInvitations';
import * as getPubSub from 'server/utils/getPubSub';
import * as publishNotifications from 'server/utils/publishNotifications';
import {REQUEST_NEW_USER} from 'universal/utils/constants';

MockDate.set(__now);
console.error = jest.fn();

describe('approveToOrg', () => {
  test('for a 1-team approval, sends teamInvite, clears requestNewUser, sends inviteeApproved', async () => {
    // SETUP
    sendTeamInvitations.default = jest.fn(() => ({}));
    publishNotifications.default = jest.fn();
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockPubSub = makeMockPubSub();
    getPubSub.default = () => mockPubSub;

    const mockDB = new MockDB();
    await mockDB.init()
      .user(1)
      .newNotification(undefined, {type: REQUEST_NEW_USER})
      .newUser({name: 'invitee', email: mockDB.context.notification.inviteeEmail})
      .newOrgApproval({email: mockDB.context.notification.inviteeEmail});
    const {notification} = mockDB.context;
    const approver = mockDB.db.user[0];
    const mockInviter = mockDB.db.user[1];
    const authToken = mockAuthToken(approver);
    const orgId = mockDB.context.organization.id;
    const email = notification.inviteeEmail;
    const inviter = {
      inviterAvatar: mockInviter.picture,
      inviterEmail: mockInviter.email,
      inviterName: mockInviter.preferredName,
      teamName: mockDB.context.team.name,
      teamId: mockDB.context.team.id,
      orgId,
      userId: mockInviter.id
    };
    const invitees = [{email}];

    // TEST
    const res = await approveToOrg.resolve(undefined, {email, orgId}, {authToken, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      notification: r.table('Notification').getAll(orgId, {index: 'orgId'}).orderBy('startAt'),
      orgApproval: r.table('OrgApproval').getAll(email, {index: 'email'}).orderBy('updatedAt')
    }, dynamicSerializer);

    expect(db).toMatchSnapshot();
    expect(sendTeamInvitations.default).toHaveBeenCalledWith(invitees, inviter);
    expect(publishNotifications.default).toHaveBeenCalledTimes(1);
    expect(mockPubSub.publish).toHaveBeenCalledTimes(1);
    expect(res.deletedIds.length).toEqual(1);
  });

  test('for a 2-team approval with the same inviter, sends teamInvite, clears requestNewUser, sends inviteeApproved', async () => {
    // SETUP
    sendTeamInvitations.default = jest.fn(() => ({}));
    publishNotifications.default = jest.fn();
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockPubSub = makeMockPubSub();
    getPubSub.default = () => mockPubSub;

    const mockDB = new MockDB();
    await mockDB.init()
      .user(1)
      .newNotification(undefined, {type: REQUEST_NEW_USER})
      .newUser({name: 'invitee', email: mockDB.context.notification.inviteeEmail})
      .newOrgApproval({email: mockDB.context.notification.inviteeEmail})
      .newTeam({name: 'team 2', orgId: mockDB.context.organization.id})
      .user(1)
      .newNotification(undefined, {type: REQUEST_NEW_USER, email: mockDB.context.notification.inviteeEmail})
      .newOrgApproval({email: mockDB.context.notification.inviteeEmail});

    const {notification} = mockDB.context;
    const approver = mockDB.db.user[0];
    const mockInviter = mockDB.db.user[1];
    const authToken = mockAuthToken(approver);
    const orgId = mockDB.context.organization.id;
    const email = notification.inviteeEmail;
    const inviter = {
      inviterAvatar: mockInviter.picture,
      inviterEmail: mockInviter.email,
      inviterName: mockInviter.preferredName,
      teamName: mockDB.db.team[0].name,
      teamId: mockDB.db.team[0].id,
      orgId,
      userId: mockInviter.id
    };
    const inviter2 = {
      inviterAvatar: mockInviter.picture,
      inviterEmail: mockInviter.email,
      inviterName: mockInviter.preferredName,
      teamName: mockDB.db.team[1].name,
      teamId: mockDB.db.team[1].id,
      orgId,
      userId: mockInviter.id
    };

    const invitees = [{email}];

    // TEST
    await approveToOrg.resolve(undefined, {email, orgId}, {authToken, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      notification: r.table('Notification').getAll(orgId, {index: 'orgId'}).orderBy('teamName'),
      orgApproval: r.table('OrgApproval').getAll(email, {index: 'email'}).orderBy('createdAt')
    }, dynamicSerializer);

    expect(db).toMatchSnapshot();
    const mockCalls = sendTeamInvitations.default.mock.calls.sort((a, b) => a[1].teamName > b[1].teamName ? 1 : -1);
    expect(mockCalls).toEqual([[invitees, inviter], [invitees, inviter2]]);
    expect(publishNotifications.default).toHaveBeenCalledTimes(1);
    expect(mockPubSub.publish).toHaveBeenCalledTimes(1);
  });

  test('for a 2-team approval with different inviters, sends teamInvite, clears requestNewUser, sends inviteeApproved', async () => {
    // SETUP
    sendTeamInvitations.default = jest.fn(() => ({}));
    publishNotifications.default = jest.fn();
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockPubSub = makeMockPubSub();
    getPubSub.default = () => mockPubSub;

    const mockDB = new MockDB();
    await mockDB.init()
      .user(1)
      .newNotification(undefined, {type: REQUEST_NEW_USER})
      .newUser({name: 'invitee', email: mockDB.context.notification.inviteeEmail})
      .newOrgApproval({email: mockDB.context.notification.inviteeEmail})
      .newTeam({name: 'team 2', orgId: mockDB.context.organization.id})
      .user(2)
      .newNotification(undefined, {type: REQUEST_NEW_USER, email: mockDB.context.notification.inviteeEmail})
      .newOrgApproval({email: mockDB.context.notification.inviteeEmail});

    const {notification} = mockDB.context;
    const approver = mockDB.db.user[0];
    const mockInviter = mockDB.db.user[1];
    const mockInviter2 = mockDB.db.user[2];
    const authToken = mockAuthToken(approver);
    const orgId = mockDB.context.organization.id;
    const email = notification.inviteeEmail;
    const inviter = {
      inviterAvatar: mockInviter.picture,
      inviterEmail: mockInviter.email,
      inviterName: mockInviter.preferredName,
      teamName: mockDB.db.team[0].name,
      teamId: mockDB.db.team[0].id,
      orgId,
      userId: mockInviter.id
    };
    const inviter2 = {
      inviterAvatar: mockInviter2.picture,
      inviterEmail: mockInviter2.email,
      inviterName: mockInviter2.preferredName,
      teamName: mockDB.db.team[1].name,
      teamId: mockDB.db.team[1].id,
      orgId,
      userId: mockInviter2.id
    };

    const invitees = [{email}];

    // TEST
    await approveToOrg.resolve(undefined, {email, orgId}, {authToken, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      notification: r.table('Notification').getAll(orgId, {index: 'orgId'}).orderBy('teamName'),
      orgApproval: r.table('OrgApproval').getAll(email, {index: 'email'}).orderBy('createdAt')
    }, dynamicSerializer);

    expect(db).toMatchSnapshot();
    const mockCalls = sendTeamInvitations.default.mock.calls.sort((a, b) => a[1].teamName > b[1].teamName ? 1 : -1);
    expect(mockCalls).toEqual([[invitees, inviter], [invitees, inviter2]]);
    expect(publishNotifications.default).toHaveBeenCalledTimes(1);
    expect(mockPubSub.publish).toHaveBeenCalledTimes(1);
  });

  test('throws if the caller does not own the notification', async () => {
    // SETUP
    const mockDB = new MockDB();
    await mockDB.init()
      .newNotification(undefined, {type: REQUEST_NEW_USER});
    const {notification} = mockDB.context;
    const wrongUser = mockDB.db.user[1];
    const authToken = mockAuthToken(wrongUser);

    // TEST
    const {id: dbNotificationId} = notification;
    await expectAsyncToThrow(
      approveToOrg.resolve(undefined, {dbNotificationId}, {authToken, socket}),
      [dbNotificationId, wrongUser.id]
    );
  });
});
