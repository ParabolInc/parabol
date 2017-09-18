import DynamicSerializer from 'dynamic-serializer';
import MockDate from 'mockdate';
import MockDB from 'server/__tests__/setup/MockDB';
import {__now} from 'server/__tests__/setup/mockTimes';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import newInvitee from 'server/__tests__/utils/newInvitee';
import getRethink from 'server/database/rethinkDriver';
import removeOrgApprovalAndNotification from 'server/safeMutations/removeOrgApprovalAndNotification';
import {BILLING_LEADER, REQUEST_NEW_USER} from 'universal/utils/constants';

MockDate.set(__now);
console.error = jest.fn();

describe('removeOrgApprovalAndNotification', () => {
  test('rejects approvals and approval notifications, returns an object full of the notifications removed', async () => {
    // SETUP
    const r = getRethink();
    const mockDB = new MockDB();
    const dynamicSerializer = new DynamicSerializer();
    const invitee = newInvitee();
    await mockDB.init()
      .user(1, {userOrgs: [{role: BILLING_LEADER, id: mockDB.context.organization.id}]})
      .newOrgApproval({email: invitee.email})
      .newNotification(undefined, {type: REQUEST_NEW_USER, email: invitee.email});

    const orgId = mockDB.context.organization.id;
    const userId = mockDB.db.user[0].id;

    // TEST
    const res = await removeOrgApprovalAndNotification(orgId, [invitee.email], {deniedBy: userId});

    // VERIFY
    const db = await fetchAndSerialize({
      orgApproval: r.table('OrgApproval').getAll(invitee.email, {index: 'email'}).orderBy('email'),
      notification: r.table('Notification').getAll(orgId, {index: 'orgId'}).orderBy('userIds')
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();

    const [firstUser, secondUser] = mockDB.db.user;
    const notificationsToClear = [mockDB.context.notification.id];
    expect(res[firstUser.id]).toEqual((notificationsToClear));
    expect(res[secondUser.id]).toEqual((notificationsToClear));
  });
  test('approves orgApproval, returns an object full of the notifications removed', async () => {
    // SETUP
    const r = getRethink();
    const mockDB = new MockDB();
    const dynamicSerializer = new DynamicSerializer();
    const invitee = newInvitee();
    await mockDB.init()
      .user(1, {userOrgs: [{role: BILLING_LEADER, id: mockDB.context.organization.id}]})
      .newOrgApproval({email: invitee.email})
      .newNotification(undefined, {type: REQUEST_NEW_USER, email: invitee.email});

    const orgId = mockDB.context.organization.id;
    const userId = mockDB.db.user[0].id;

    // TEST
    const res = await removeOrgApprovalAndNotification(orgId, [invitee.email], {approvedBy: userId});

    // VERIFY
    const db = await fetchAndSerialize({
      orgApproval: r.table('OrgApproval').getAll(invitee.email, {index: 'email'}).orderBy('email'),
      notification: r.table('Notification').getAll(orgId, {index: 'orgId'}).orderBy('userIds')
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();

    const [firstUser, secondUser] = mockDB.db.user;
    const notificationsToClear = [mockDB.context.notification.id];
    expect(res[firstUser.id]).toEqual((notificationsToClear));
    expect(res[secondUser.id]).toEqual((notificationsToClear));
  });
});
