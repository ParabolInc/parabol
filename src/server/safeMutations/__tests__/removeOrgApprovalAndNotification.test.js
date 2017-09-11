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
  test('removes approvals and approval notifications, returns an object full of the notifications removed', async () => {
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
    // TEST
    const res = await removeOrgApprovalAndNotification(orgId, [invitee.email]);

    // VERIFY
    const db = await fetchAndSerialize({
      orgApproval: r.table('OrgApproval').getAll(invitee.email, {index: 'email'}).orderBy('email'),
      notification: r.table('Notification').getAll(orgId, {index: 'orgId'}).orderBy('userIds')
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();

    const [firstUser, secondUser] = mockDB.db.user;
    const notificationsToClear = [{deletedId: mockDB.context.notification.id}];
    expect(res[firstUser.id]).toEqual((notificationsToClear));
    expect(res[secondUser.id]).toEqual((notificationsToClear));
  });
});
