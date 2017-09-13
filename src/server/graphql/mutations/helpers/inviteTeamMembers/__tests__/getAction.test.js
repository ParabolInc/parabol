import getAction from 'server/graphql/mutations/helpers/inviteTeamMembers/getAction';
import {ASK_APPROVAL, REACTIVATE, SEND_INVITATION} from 'server/utils/serverConstants';
import {ALREADY_ON_TEAM, PENDING_APPROVAL, SUCCESS} from 'universal/utils/constants';

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
  test('returns SEND_INVITATION if the user can be safely added to the team/org', () => {
    // SETUP
    const invitee = {
      isOrgMember: true,
      isNewTeamMember: true
    };

    // TEST
    const result = getAction(invitee);

    // VERIFY
    expect(result).toEqual(SEND_INVITATION);
  });
  test('Asks a billing leader for approval if not in the org', () => {
    // SETUP
    const invitee = {
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
      isOrgMember: true,
      isNewTeamMember: false
    };

    // TEST
    const result = getAction(invitee);

    // VERIFY
    expect(result).toEqual(REACTIVATE);
  });
  test('Does not reactivate if they are no longer in the org', () => {
    // SETUP
    const invitee = {
      isOrgMember: false,
      isNewTeamMember: false
    };

    // TEST
    const result = getAction(invitee);

    // VERIFY
    expect(result).toEqual(ASK_APPROVAL);
  });
});

