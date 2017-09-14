import DynamicSerializer from 'dynamic-serializer';
import MockDate from 'mockdate';
import MockDB from 'server/__tests__/setup/MockDB';
import {__now} from 'server/__tests__/setup/mockTimes';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import getRethink from 'server/database/rethinkDriver';
import sendTeamInvitations from 'server/safeMutations/sendTeamInvitations';
import shortid from 'shortid';
import * as emailTeamInvitations from 'server/safeMutations/emailTeamInvitations';
import {TEAM_INVITE} from 'universal/utils/constants';

MockDate.set(__now);
console.error = jest.fn();

describe('sendTeamInvitations', () => {
  test('returns an empty array if there are no people to invite', async () => {
    // TEST
    const res = await sendTeamInvitations([], {});

    // VERIFY
    expect(res).toEqual([]);
  });
  test('inserts invitation notifications, returns an object full of the notifications removed', async () => {
    // SETUP
    emailTeamInvitations.default = jest.fn();
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
    const res = await sendTeamInvitations([invitee], inviter);

    // VERIFY
    expect(emailTeamInvitations.default).toHaveBeenCalledTimes(1);
    expect(res[invitee.userId].length).toEqual(1);
    const db = await fetchAndSerialize({
      notification: r.table('Notification').getAll(inviter.orgId, {index: 'orgId'}).orderBy('userIds')
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
  });
  test('does not add a duplicate notification', async () => {
    // SETUP
    emailTeamInvitations.default = jest.fn();
    const r = getRethink();
    const mockDB = new MockDB();
    const dynamicSerializer = new DynamicSerializer();
    const invitee = {userId: `invitee|${shortid.generate()}`};
    await mockDB.init()
      .newNotification({userIds: [invitee.userId]}, {type: TEAM_INVITE});
    const firstUser = mockDB.db.user[0];
    const inviter = {
      inviterName: firstUser.preferredName,
      teamName: mockDB.context.team.name,
      teamId: mockDB.context.team.id,
      orgId: mockDB.context.organization.id
    };

    // TEST
    const res = await sendTeamInvitations([invitee], inviter);

    // VERIFY
    expect(emailTeamInvitations.default).toHaveBeenCalledTimes(1);
    expect(res[invitee.userId].length).toEqual(1);
    const db = await fetchAndSerialize({
      notification: r.table('Notification').getAll(inviter.orgId, {index: 'orgId'}).orderBy('userIds')
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
  });
});
