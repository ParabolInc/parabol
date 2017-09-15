import DynamicSerializer from 'dynamic-serializer';
import MockDate from 'mockdate';
import MockDB from 'server/__tests__/setup/MockDB';
import {__now} from 'server/__tests__/setup/mockTimes';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import newInvitee from 'server/__tests__/utils/newInvitee';
import getRethink from 'server/database/rethinkDriver';
import addInviteeApproved from 'server/safeMutations/helpers/addInviteeApproved';

MockDate.set(__now);
console.error = jest.fn();

describe('approveToOrg', () => {
  test('inserts INVITEE_APPROVED notification', async () => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    await mockDB.init();
    const firstUser = mockDB.db.user[0];
    const inviter = {
      inviterName: firstUser.preferredName,
      teamName: mockDB.context.team.name,
      teamId: mockDB.context.team.id,
      orgId: mockDB.context.organization.id,
      userId: firstUser.id
    };
    const invitee = newInvitee();

    // TEST
    await addInviteeApproved(invitee.email, inviter);

    // VERIFY
    const db = await fetchAndSerialize({
      notification: r.table('Notification').getAll(inviter.orgId, {index: 'orgId'}).orderBy('userIds').coerceTo('array')
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
  });
});
