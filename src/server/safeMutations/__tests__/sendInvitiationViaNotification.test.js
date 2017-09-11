import DynamicSerializer from 'dynamic-serializer';
import MockDate from 'mockdate';
import MockDB from 'server/__tests__/setup/MockDB';
import {__now} from 'server/__tests__/setup/mockTimes';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import getRethink from 'server/database/rethinkDriver';
import sendInvitationViaNotification from 'server/safeMutations/sendInvitationViaNotification';
import * as shortid from 'shortid';

MockDate.set(__now);
console.error = jest.fn();

describe('sendInvitationViaNotification', () => {
  test('inserts invitation notifications, returns an object full of the notifications removed', async () => {
    // SETUP
    const r = getRethink();
    const mockDB = new MockDB();
    const dynamicSerializer = new DynamicSerializer();
    const invitee = {userId: `invitee|${shortid.generate()}`};
    await mockDB.init();
    const firstUser = mockDB.db.user[0];
    const inviter = {
      inviterName: firstUser.preferredName,
      teamName: mockDB.context.team.name,
      teamId: mockDB.context.team.id,
      orgId: mockDB.context.organization.id
    };

    // TEST
    const res = await sendInvitationViaNotification([invitee], inviter);

    // VERIFY
    expect(res[invitee.userId].length).toEqual(1);
    const db = await fetchAndSerialize({
      notification: r.table('Notification').getAll(inviter.orgId, {index: 'orgId'}).orderBy('userIds')
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();


  });
});
