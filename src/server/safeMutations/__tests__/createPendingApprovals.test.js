import DynamicSerializer from 'dynamic-serializer';
import MockDate from 'mockdate';
import MockDB from 'server/__tests__/setup/MockDB';
import {__now} from 'server/__tests__/setup/mockTimes';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import newInvitee from 'server/__tests__/utils/newInvitee';
import getRethink from 'server/database/rethinkDriver';
import createPendingApprovals from 'server/safeMutations/createPendingApprovals';

MockDate.set(__now);
console.error = jest.fn();

describe('createPendingApprovals', () => {
  test('returns an empty array if there are no people to approve', async () => {
    // TEST
    const res = await createPendingApprovals([]);

    // VERIFY
    expect(res).toEqual([]);
  });
  test('creates approvals with org leader notifications, returns an object full of the notifications', async () => {
    // SETUP
    const r = getRethink();
    const mockDB = new MockDB();
    const dynamicSerializer = new DynamicSerializer();
    const invitee = newInvitee();
    await mockDB.init();
    const firstUser = mockDB.db.user[0];
    const inviter = {
      userId: firstUser.id,
      teamName: mockDB.context.team.name,
      teamId: mockDB.context.team.id,
      orgId: mockDB.context.organization.id
    };

    // TEST
    const res = await createPendingApprovals([invitee], inviter);

    // VERIFY
    const db = await fetchAndSerialize({
      orgApproval: r.table('OrgApproval').getAll(invitee.email, {index: 'email'}).orderBy('email'),
      notification: r.table('Notification').getAll(inviter.orgId, {index: 'orgId'}).orderBy('userIds')
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
    expect(res[inviter.userId].length).toEqual(1);
  });
});
