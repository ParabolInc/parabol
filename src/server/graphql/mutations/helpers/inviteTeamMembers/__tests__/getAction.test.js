import getAction from 'server/graphql/mutations/helpers/inviteTeamMembers/getAction';
import {ALREADY_ON_TEAM, PENDING_APPROVAL, REACTIVATED, SUCCESS} from 'universal/utils/constants';
import {ASK_APPROVAL, SEND_EMAIL, SEND_NOTIFICATION} from 'server/utils/serverConstants';

describe('getAction', () => {
  test('returns ALREADY_ON_TEAM if on team', () => {
    // SETUP
    const invitee = {
      isActiveTeamMember: true
    };

    // TEST
    const result = getAction(invitee);

    // VERIFY
    expect(result).toEqual(ALREADY_ON_TEAM);
  });
  test('returns PENDING_APPROVAL if already pending', () => {
    // SETUP
    const invitee = {
      isPendingApproval: true
    };

    // TEST
    const result = getAction(invitee);

    // VERIFY
    expect(result).toEqual(PENDING_APPROVAL);
  });
  test('returns SUCCESS if an invitation (email or notification) was already sent', () => {
    // SETUP
    const invitee = {
      isPendingInvitation: true
    };

    // TEST
    const result = getAction(invitee);

    // VERIFY
    expect(result).toEqual(SUCCESS);
  });
  test('returns SEND_EMAIL if the user is not active but in the org', () => {
    // SETUP
    const invitee = {
      isActiveUser: false,
      isOrgMember: true,
      isNewTeamMember: true
    };

    // TEST
    const result = getAction(invitee);

    // VERIFY
    expect(result).toEqual(SEND_EMAIL);
  });
  test('returns SEND_EMAIL if the user is not active & not in the org, but the inviter is the billing leader', () => {
    // SETUP
    const invitee = {
      isActiveUser: false,
      isOrgMember: false,
      isNewTeamMember: true
    };
    const isBillingleader = true;
    // TEST
    const result = getAction(invitee, isBillingleader);

    // VERIFY
    expect(result).toEqual(SEND_EMAIL);
  });
  test('returns SEND_NOTIFICATION if the user is active in another org & the inviter is the billing leader', () => {
    // SETUP
    const invitee = {
      isActiveUser: true,
      isOrgMember: false,
      isNewTeamMember: true
    };
    const isBillingleader = true;

    // TEST
    const result = getAction(invitee, isBillingleader);

    // VERIFY
    expect(result).toEqual(SEND_NOTIFICATION);
  });
  test('returns SEND_NOTIFICATION if the user is active in the org but has never been on this team', () => {
    // SETUP
    const invitee = {
      isActiveUser: true,
      isOrgMember: true,
      isNewTeamMember: true
    };

    // TEST
    const result = getAction(invitee);

    // VERIFY
    expect(result).toEqual(SEND_NOTIFICATION);
  });
  test('Asks a billing leader for approval if not in the org', () => {
    // SETUP
    const invitee = {
      isActiveUser: true,
      isOrgMember: false,
      isNewTeamMember: true
    };

    // TEST
    const result = getAction(invitee);

    // VERIFY
    expect(result).toEqual(ASK_APPROVAL);
  });
  test('Reactivates the team member if they were previously on the team and are still in the org', () => {
    // SETUP
    const invitee = {
      isActiveUser: true,
      isOrgMember: true,
      isNewTeamMember: false
    };

    // TEST
    const result = getAction(invitee);

    // VERIFY
    expect(result).toEqual(REACTIVATED);
  });
  test('Does not reactivate if they are no longer in the org', () => {
    // SETUP
    const invitee = {
      isActiveUser: true,
      isOrgMember: false,
      isNewTeamMember: false
    };

    // TEST
    const result = getAction(invitee);

    // VERIFY
    expect(result).toEqual(ASK_APPROVAL);
  });
});

