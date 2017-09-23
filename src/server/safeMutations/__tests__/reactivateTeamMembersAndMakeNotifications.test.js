import DynamicSerializer from 'dynamic-serializer';
import MockDate from 'mockdate';
import MockDB from 'server/__tests__/setup/MockDB';
import {__now} from 'server/__tests__/setup/mockTimes';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import getRethink from 'server/database/rethinkDriver';
import * as makeReactivationNotifications from 'server/safeMutations/helpers/makeReactivationNotifications';
import reactivateTeamMembersAndMakeNotifications from 'server/safeMutations/reactivateTeamMembersAndMakeNotifications';

MockDate.set(__now);
console.error = jest.fn();

describe('reactivateTeamMembersAndMakeNotifications', () => {
  test('returns an empty array if there are no people to reactivate', async () => {
    // SETUP
    makeReactivationNotifications.default = jest.fn();
    const mockDB = new MockDB();
    await mockDB.init()
      .user(2, {tms: []})
      .teamMember(2, {isNotRemoved: false});

    const firstUser = mockDB.db.user[0];
    const inviter = {
      inviterName: firstUser.preferredName,
      teamName: mockDB.context.team.name,
      teamId: mockDB.context.team.id,
      orgId: mockDB.context.organization.id
    };

    // TEST
    const res = await reactivateTeamMembersAndMakeNotifications([], inviter);

    // VERIFY
    expect(res).toEqual([]);
  });

  test('reactivates the team member and notifies them that they are back on the team', async () => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    makeReactivationNotifications.default = jest.fn();
    const mockDB = new MockDB();
    await mockDB.init()
      .user(2, {tms: []})
      .teamMember(2, {isNotRemoved: false});

    const exTeamMember = mockDB.context.teamMember;
    const {teamMember, user} = mockDB.context;
    const invitees = [exTeamMember];
    const firstUser = mockDB.db.user[0];
    const inviter = {
      inviterName: firstUser.preferredName,
      teamName: mockDB.context.team.name,
      teamId: mockDB.context.team.id,
      orgId: mockDB.context.organization.id
    };

    // TEST
    await reactivateTeamMembersAndMakeNotifications(invitees, inviter);

    // VERIFY
    const db = await fetchAndSerialize({
      teamMember: r.table('TeamMember').get(teamMember.id),
      user: r.table('User').get(user.id),
      notification: r.table('Notification').getAll(inviter.orgId, {index: 'orgId'}).orderBy('userIds')
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
  });
});
