import DynamicSerializer from 'dynamic-serializer';
import MockDate from 'mockdate';
import MockPubSub from 'server/__mocks__/MockPubSub';
import socket from 'server/__mocks__/socket';
import makeDataLoader from 'server/__tests__/setup/makeDataLoader';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import MockDB from 'server/__tests__/setup/MockDB';
import {__now} from 'server/__tests__/setup/mockTimes';
import expectAsyncToThrow from 'server/__tests__/utils/expectAsyncToThrow';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import serializeGraphQLType from 'server/__tests__/utils/serializeGraphQLType';
import getRethink from 'server/database/rethinkDriver';
import * as hashInviteTokenKey from 'server/graphql/models/Invitation/inviteTeamMembers/hashInviteTokenKey';
import approveToOrg from 'server/graphql/mutations/approveToOrg';
import {REQUEST_NEW_USER} from 'universal/utils/constants';
import * as sendEmailPromise from 'server/email/sendEmail';

MockDate.set(__now);
console.error = jest.fn();

describe('approveToOrg', () => {
  test('for a 1-team approval, sends teamInvite, clears requestNewUser, sends inviteeApproved', async () => {
    // SETUP
    hashInviteTokenKey.default = jest.fn(() => Promise.resolve('HA$H'));
    sendEmailPromise.default = jest.fn(() => true);
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockPubSub = new MockPubSub();
    const mockDB = new MockDB();
    await mockDB.init()
      .user(1)
      .newNotification(undefined, {type: REQUEST_NEW_USER})
      .newUser({name: 'invitee', email: mockDB.context.notification.inviteeEmail})
      .newOrgApproval({email: mockDB.context.notification.inviteeEmail});
    const {notification} = mockDB.context;
    const approver = mockDB.db.user[0];
    const authToken = mockAuthToken(approver);
    const dataLoader = makeDataLoader(authToken);
    const orgId = mockDB.context.organization.id;
    const email = notification.inviteeEmail;

    // TEST
    const res = await approveToOrg.resolve(undefined, {email, orgId}, {authToken, dataLoader, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      notification: r.table('Notification').getAll(orgId, {index: 'orgId'}).orderBy('teamName', 'type'),
      orgApproval: r.table('OrgApproval').getAll(email, {index: 'email'}).orderBy('createdAt'),
      invitation: r.table('Invitation').getAll(email, {index: 'email'}).orderBy('teamId')
    }, dynamicSerializer);

    expect(db).toMatchSnapshot();
    expect(serializeGraphQLType(res, 'NotificationsClearedPayload', dynamicSerializer)).toMatchSnapshot();
    expect(mockPubSub.__serialize(dynamicSerializer)).toMatchSnapshot();
  });

  test('for a 2-team approval with the same inviter, sends teamInvite, clears requestNewUser, sends inviteeApproved', async () => {
    // SETUP
    hashInviteTokenKey.default = jest.fn(() => Promise.resolve('HA$H'));
    sendEmailPromise.default = jest.fn(() => true);
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockPubSub = new MockPubSub();
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
    const authToken = mockAuthToken(approver);
    const dataLoader = makeDataLoader(authToken);
    const orgId = mockDB.context.organization.id;
    const email = notification.inviteeEmail;

    // TEST
    const res = await approveToOrg.resolve(undefined, {email, orgId}, {authToken, dataLoader, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      notification: r.table('Notification').getAll(orgId, {index: 'orgId'}).orderBy('teamName', 'type'),
      orgApproval: r.table('OrgApproval').getAll(email, {index: 'email'}).orderBy('createdAt'),
      invitation: r.table('Invitation').getAll(email, {index: 'email'}).orderBy('teamId')
    }, dynamicSerializer);

    expect(db).toMatchSnapshot();
    expect(serializeGraphQLType(res, 'NotificationsClearedPayload', dynamicSerializer)).toMatchSnapshot();
    expect(mockPubSub.__serialize(dynamicSerializer)).toMatchSnapshot();
  });

  test('for a 2-team approval with different inviters, sends teamInvite, clears requestNewUser, sends inviteeApproved', async () => {
    // SETUP
    hashInviteTokenKey.default = jest.fn(() => Promise.resolve('HA$H'));
    sendEmailPromise.default = jest.fn(() => true);
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockPubSub = new MockPubSub();
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
    const authToken = mockAuthToken(approver);
    const dataLoader = makeDataLoader(authToken);
    const orgId = mockDB.context.organization.id;
    const email = notification.inviteeEmail;

    // TEST
    const res = await approveToOrg.resolve(undefined, {email, orgId}, {authToken, dataLoader, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      notification: r.table('Notification').getAll(orgId, {index: 'orgId'}).orderBy('teamName', 'type'),
      orgApproval: r.table('OrgApproval').getAll(email, {index: 'email'}).orderBy('createdAt'),
      invitation: r.table('Invitation').getAll(email, {index: 'email'}).orderBy('teamId')
    }, dynamicSerializer);

    expect(db).toMatchSnapshot();
    expect(mockPubSub.__serialize(dynamicSerializer)).toMatchSnapshot();
    expect(serializeGraphQLType(res, 'NotificationsClearedPayload', dynamicSerializer)).toMatchSnapshot();
  });

  test('throws if the caller does not own the notification', async () => {
    // SETUP
    const mockDB = new MockDB();
    await mockDB.init()
      .newNotification(undefined, {type: REQUEST_NEW_USER});
    const {notification} = mockDB.context;
    const wrongUser = mockDB.db.user[1];
    const authToken = mockAuthToken(wrongUser);
    const dataLoader = makeDataLoader(authToken);

    // TEST
    const {id: dbNotificationId} = notification;
    await expectAsyncToThrow(
      approveToOrg.resolve(undefined, {dbNotificationId}, {authToken, dataLoader, socket}),
      [dbNotificationId, wrongUser.id]
    );
  });
});
