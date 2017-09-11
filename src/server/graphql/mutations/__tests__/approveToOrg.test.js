import MockDate from 'mockdate';
import socket from 'server/__mocks__/socket';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import MockDB from 'server/__tests__/setup/MockDB';
import {__now} from 'server/__tests__/setup/mockTimes';
import expectAsyncToThrow from 'server/__tests__/utils/expectAsyncToThrow';
import * as asyncInviteTeam from 'server/graphql/models/Invitation/inviteTeamMembers/asyncInviteTeam';
import approveToOrg from 'server/graphql/mutations/approveToOrg';
import * as sendInvitationViaNotification from 'server/safeMutations/sendInvitationViaNotification';
import * as getPubSub from 'server/utils/getPubSub';
import {BILLING_LEADER, REQUEST_NEW_USER} from 'universal/utils/constants';
import makeMockPubSub from 'server/__mocks__/makeMockPubSub';

MockDate.set(__now);
console.error = jest.fn();

describe('approveToOrg', () => {
  test('sends an invitation via parabol if the user is active', async () => {
    // SETUP
    asyncInviteTeam.default = jest.fn();
    sendInvitationViaNotification.default = jest.fn();
    const mockDB = new MockDB();
    await mockDB.init()
      .newNotification(undefined, {type: REQUEST_NEW_USER})
      .newUser({name: 'invitee', email: mockDB.context.notification.inviteeEmail});
    const {notification} = mockDB.context;
    const firstUser = mockDB.db.user[0];
    const authToken = mockAuthToken(firstUser);
    const inviter = {
      inviterName: firstUser.preferredName,
      teamName: mockDB.context.team.name,
      teamId: mockDB.context.team.id,
      orgId: mockDB.context.organization.id
    };
    const invitees = [{email: notification.inviteeEmail}];

    // TEST
    const {id: dbNotificationId} = notification;
    await approveToOrg.resolve(undefined, {dbNotificationId}, {authToken, socket});

    // VERIFY
    expect(sendInvitationViaNotification.default).toHaveBeenCalledWith(invitees, inviter);
    expect(asyncInviteTeam.default).toHaveBeenCalledTimes(0);
  });

  test('sends an invitation via email if the user is new/inactive', async () => {
    // SETUP
    asyncInviteTeam.default = jest.fn();
    sendInvitationViaNotification.default = jest.fn();
    const mockDB = new MockDB();
    await mockDB.init()
      .newNotification(undefined, {type: REQUEST_NEW_USER});
    const {notification} = mockDB.context;
    const firstUser = mockDB.db.user[0];
    const authToken = mockAuthToken(firstUser);
    const invitees = [{email: notification.inviteeEmail}];

    // TEST
    const {id: dbNotificationId} = notification;
    sendInvitationViaNotification.default = jest.fn();
    await approveToOrg.resolve(undefined, {dbNotificationId}, {authToken, socket});

    // VERIFY
    expect(sendInvitationViaNotification.default).toHaveBeenCalledTimes(0);
    expect(asyncInviteTeam.default).toHaveBeenCalledWith(firstUser.id, mockDB.context.team.id, invitees);
  });

  test('clears the request for all notification owners', async () => {
    // SETUP
    const mockDB = new MockDB();
    await mockDB.init()
      .user(1, {userOrgs: [{role: BILLING_LEADER, id: mockDB.context.organization.id}]})
      .newNotification(undefined, {type: REQUEST_NEW_USER});
    const {notification} = mockDB.context;
    const firstUser = mockDB.db.user[0];
    const authToken = mockAuthToken(firstUser);
    const mockPubSub = makeMockPubSub();
    getPubSub.default = () => mockPubSub;

    // TEST
    const {id: dbNotificationId} = notification;
    await approveToOrg.resolve(undefined, {dbNotificationId}, {authToken, socket});

    // VERIFY
    expect(mockPubSub.publish).toHaveBeenCalledTimes(2);
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
