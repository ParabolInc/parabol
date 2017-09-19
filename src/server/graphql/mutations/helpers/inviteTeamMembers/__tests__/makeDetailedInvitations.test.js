import makeDetailedInvitations from 'server/graphql/mutations/helpers/inviteTeamMembers/makeDetailedInvitations';
import {APPROVED, PENDING} from 'server/utils/serverConstants';

describe('makeDetailedInvitations', () => {
  test('detects active team members', () => {
    // SETUP
    const emailArr = ['1@foo.co', '2@foo.co'];
    const teamMembers = [
      {id: 1, isNotRemoved: true, email: '1@foo.co'},
      {id: 2, isNotRemoved: false, email: '2@foo.co'}
    ];

    // TEST
    const result = makeDetailedInvitations(teamMembers, emailArr);

    // VERIFY
    expect(result[0].isActiveTeamMember).toEqual(true);
    expect(result[1].isActiveTeamMember).toEqual(false);
  });
  test('detects pending approvals', () => {
    // SETUP
    const emailArr = ['1@foo.co', '2@foo.co'];
    const orgApprovals = [{email: '1@foo.co', teamId: 123, status: PENDING}];
    const inviter = {orgId: 1, teamId: 123};
    // TEST
    const result = makeDetailedInvitations([], emailArr, [], orgApprovals, [], inviter);

    // VERIFY
    expect(result[0].isPendingApproval).toEqual(true);
    expect(result[1].isPendingApproval).toEqual(false);
  });
  test('detects pending invitiations', () => {
    // SETUP
    const emailArr = ['1@foo.co', '2@foo.co'];
    const pendingInvitations = ['1@foo.co'];

    // TEST
    const result = makeDetailedInvitations([], emailArr, [], [], pendingInvitations);

    // VERIFY
    expect(result[0].isPendingInvitation).toEqual(true);
    expect(result[1].isPendingInvitation).toEqual(false);
  });
  test('detects if in same org as the inviting team', () => {
    // SETUP
    const emailArr = ['1@foo.co', '2@foo.co'];
    const users = [
      {id: 1, inactive: false, email: '1@foo.co', userOrgs: [{id: 1}]},
      {id: 2, inactive: true, email: '2@foo.co', userOrgs: [{id: 2}]}
    ];
    const inviter = {orgId: 1};
    // TEST
    const result = makeDetailedInvitations([], emailArr, users, [], [], inviter);

    // VERIFY
    expect(result[0].isOrgMember).toEqual(true);
    expect(result[1].isOrgMember).toEqual(false);
  });
  test('detects if the invitee used to be on the inviting team', () => {
    // SETUP
    const emailArr = ['1@foo.co', '2@foo.co', '3@foo.co'];
    const teamMembers = [
      {id: 1, isNotRemoved: true, email: '1@foo.co'},
      {id: 2, isNotRemoved: false, email: '2@foo.co'}
    ];
    // TEST
    const result = makeDetailedInvitations(teamMembers, emailArr);

    // VERIFY
    expect(result[0].isNewTeamMember).toEqual(false);
    expect(result[1].isNewTeamMember).toEqual(false);
    expect(result[2].isNewTeamMember).toEqual(true);
  });
  test.only('detects approved emails from the OrgApproval table', () => {
    // SETUP
    const emailArr = ['1@foo.co', '2@foo.co'];
    const orgApprovals = [{email: '1@foo.co', teamId: 123, status: APPROVED}];
    const inviter = {orgId: 1, teamId: 123};
    // TEST
    const result = makeDetailedInvitations([], emailArr, [], orgApprovals, [], inviter);
    // VERIFY
    expect(result[0].isApproved).toEqual(true);
    expect(result[1].isApproved).toEqual(false);
  });
});

