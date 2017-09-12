import DynamicSerializer from 'dynamic-serializer';
import MockDate from 'mockdate';
import MockDB from 'server/__tests__/setup/MockDB';
import {__now} from 'server/__tests__/setup/mockTimes';
import newInvitee from 'server/__tests__/utils/newInvitee';
import * as publishNotifications from 'server/graphql/mutations/helpers/inviteTeamMembers/publishNotifications';
import * as asyncInviteTeam from 'server/safeMutations/asyncInviteTeam';
import * as createPendingApprovals from 'server/safeMutations/createPendingApprovals';
import inviteTeamMembers from 'server/safeMutations/inviteTeamMembers';
import * as reactivateTeamMembersAndMakeNotifications from 'server/safeMutations/reactivateTeamMembersAndMakeNotifications';
import * as removeOrgApprovalAndNotification from 'server/safeMutations/removeOrgApprovalAndNotification';
import * as sendInvitationViaNotification from 'server/safeMutations/sendInvitationViaNotification';

MockDate.set(__now);
console.error = jest.fn();

describe('inviteTeamMembers', () => {
  test('reactivates a team member that has been invited back to the team', async () => {
    // SETUP
    asyncInviteTeam.default = jest.fn(() => []);
    sendInvitationViaNotification.default = jest.fn(() => []);
    reactivateTeamMembersAndMakeNotifications.default = jest.fn(() => []);
    removeOrgApprovalAndNotification.default = jest.fn(() => []);
    createPendingApprovals.default = jest.fn(() => []);
    publishNotifications.default = jest.fn(() => []);

    const mockDB = new MockDB();
    await mockDB.init()
      .teamMember(4, {isNotRemoved: false});
    const firstUser = mockDB.db.user[0];
    const invitees = [{email: mockDB.db.user[4].email}];
    const teamId = mockDB.context.team.id;
    // TEST
    const res = await inviteTeamMembers(invitees, teamId, firstUser.id);

    // VERIFY
    expect(reactivateTeamMembersAndMakeNotifications.default).toHaveBeenCalledTimes(1);
    expect(res).toMatchSnapshot();
  });

  test('invites a new person via email', async () => {

    // SETUP
    asyncInviteTeam.default = jest.fn(() => []);
    sendInvitationViaNotification.default = jest.fn(() => []);
    reactivateTeamMembersAndMakeNotifications.default = jest.fn(() => []);
    removeOrgApprovalAndNotification.default = jest.fn(() => []);
    createPendingApprovals.default = jest.fn(() => []);
    publishNotifications.default = jest.fn(() => []);
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    await mockDB.init()
    const firstUser = mockDB.db.user[0];
    const invitee = newInvitee();
    const invitees = [{email: invitee.email}];
    const teamId = mockDB.context.team.id;
    // TEST
    const res = await inviteTeamMembers(invitees, teamId, firstUser.id);

    // VERIFY
    expect(asyncInviteTeam.default).toHaveBeenCalledTimes(1);
    const staticRes = dynamicSerializer.toStatic(res, ['results.email']);
    expect(staticRes).toMatchSnapshot();
  });

  test('invites a new person via notification', async () => {
    // SETUP
    asyncInviteTeam.default = jest.fn(() => []);
    sendInvitationViaNotification.default = jest.fn(() => []);
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
    expect(sendInvitationViaNotification.default).toHaveBeenCalledTimes(1);
    expect(removeOrgApprovalAndNotification.default).toHaveBeenCalledTimes(1);
    const staticRes = dynamicSerializer.toStatic(res, ['results.email']);
    expect(staticRes).toMatchSnapshot();
  });

  test('asks the billing leader for approval', async () => {
    // SETUP
    asyncInviteTeam.default = jest.fn(() => []);
    sendInvitationViaNotification.default = jest.fn(() => []);
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
