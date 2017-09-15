import MockDate from 'mockdate';
import socket from 'server/__mocks__/socket';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import MockDB from 'server/__tests__/setup/MockDB';
import {__now} from 'server/__tests__/setup/mockTimes';
import expectAsyncToThrow from 'server/__tests__/utils/expectAsyncToThrow';
import approveToOrg from 'server/graphql/mutations/approveToOrg';
import * as sendTeamInvitations from 'server/safeMutations/sendTeamInvitations';
import * as getPubSub from 'server/utils/getPubSub';
import {REQUEST_NEW_USER} from 'universal/utils/constants';
import makeMockPubSub from 'server/__mocks__/makeMockPubSub';
import * as publishNotifications from 'server/utils/publishNotifications';
import * as addInviteeApproved from 'server/safeMutations/helpers/addInviteeApproved';

MockDate.set(__now);
console.error = jest.fn();

describe('approveToOrg', () => {
  test('sends an invitation, clears billing leader notifications, notifies invitee and inviter of invitation', async () => {
    // SETUP
    sendTeamInvitations.default = jest.fn();
    publishNotifications.default = jest.fn();
    addInviteeApproved.default = jest.fn();

    const mockPubSub = makeMockPubSub();
    getPubSub.default = () => mockPubSub;

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
    expect(sendTeamInvitations.default).toHaveBeenCalledWith(invitees, inviter);
    expect(publishNotifications.default).toHaveBeenCalledTimes(1);
    expect(mockPubSub.publish).toHaveBeenCalledTimes(1);
    expect(addInviteeApproved.default).toHaveBeenCalledTimes(1);
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
