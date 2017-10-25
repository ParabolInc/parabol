import DynamicSerializer from 'dynamic-serializer';
import MockDate from 'mockdate';
import MockDB from 'server/__tests__/setup/MockDB';
import {__now} from 'server/__tests__/setup/mockTimes';
import newInvitee from 'server/__tests__/utils/newInvitee';
import * as publishNotifications from 'server/utils/publishNotifications';
import * as createPendingApprovals from 'server/safeMutations/createPendingApprovals';
import inviteTeamMembers from 'server/safeMutations/inviteTeamMembers';
import * as reactivateTeamMembersAndMakeNotifications from 'server/safeMutations/reactivateTeamMembersAndMakeNotifications';
import * as removeOrgApprovalAndNotification from 'server/safeMutations/removeOrgApprovalAndNotification';
import * as sendTeamInvitations from 'server/safeMutations/sendTeamInvitations';
import {REACTIVATED} from 'universal/utils/constants';

MockDate.set(__now);
console.error = jest.fn();

describe('inviteTeamMembers', () => {
  test('reactivates a team member that has been invited back to the team', async () => {
    // SETUP
    sendTeamInvitations.default = jest.fn(() => []);
    reactivateTeamMembersAndMakeNotifications.default = jest.fn(() => []);
    removeOrgApprovalAndNotification.default = jest.fn(() => []);
    createPendingApprovals.default = jest.fn(() => []);
    publishNotifications.default = jest.fn(() => []);

    const mockDB = new MockDB();
    const invitee = newInvitee();
    await mockDB.init()
      .newUser({name: 'Leader of One', email: invitee.email})
      .newTeamMember()
      .teamMember(8, {isNotRemoved: false});
    const firstUser = mockDB.db.user[0];
    const invitees = [{email: invitee.email}];
    const teamId = mockDB.context.team.id;
    // TEST
    const {results} = await inviteTeamMembers(invitees, teamId, firstUser.id);

    // VERIFY
    const res = results[0];
    expect(reactivateTeamMembersAndMakeNotifications.default).toHaveBeenCalledTimes(1);
    expect(res.preferredName).toEqual('Leader of One');
    expect(res.email).toEqual(invitee.email);
    expect(res.result).toEqual(REACTIVATED);
  });

  test('invites a new person via notification and email', async () => {
    // SETUP
    sendTeamInvitations.default = jest.fn(() => []);
    reactivateTeamMembersAndMakeNotifications.default = jest.fn(() => []);
    removeOrgApprovalAndNotification.default = jest.fn(() => []);
    createPendingApprovals.default = jest.fn(() => []);
    publishNotifications.default = jest.fn(() => []);
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const invitee = newInvitee();
    await mockDB.init()
      .newOrg({name: 'Sad Sacks, Inc.'})
      .newTeam({name: 'The Lonely Ones'})
      .newUser({name: 'Leader of One', email: invitee.email})
      .newTeamMember({isLead: true});
    const firstUser = mockDB.db.user[0];
    const invitees = [{email: mockDB.context.user.email}];
    const teamId = mockDB.context.team.id;
    // TEST
    const res = await inviteTeamMembers(invitees, teamId, firstUser.id);

    // VERIFY
    expect(sendTeamInvitations.default).toHaveBeenCalledTimes(1);
    expect(removeOrgApprovalAndNotification.default).toHaveBeenCalledTimes(1);
    const staticRes = dynamicSerializer.toStatic(res, ['results.email']);
    expect(staticRes).toMatchSnapshot();
  });

  test('asks the billing leader for approval', async () => {
    // SETUP
    sendTeamInvitations.default = jest.fn(() => []);
    reactivateTeamMembersAndMakeNotifications.default = jest.fn(() => []);
    removeOrgApprovalAndNotification.default = jest.fn(() => []);
    createPendingApprovals.default = jest.fn(() => []);
    publishNotifications.default = jest.fn(() => []);
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const invitee = newInvitee();
    await mockDB.init();
    const secondUser = mockDB.db.user[1];
    const invitees = [{email: invitee.email}];
    const teamId = mockDB.context.team.id;

    // TEST
    const res = await inviteTeamMembers(invitees, teamId, secondUser.id);

    // VERIFY
    expect(createPendingApprovals.default).toHaveBeenCalledTimes(1);
    const staticRes = dynamicSerializer.toStatic(res, ['results.email']);
    expect(staticRes).toMatchSnapshot();
  });
});
