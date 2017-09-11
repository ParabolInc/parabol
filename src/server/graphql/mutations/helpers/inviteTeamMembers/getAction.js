import {ASK_APPROVAL, SEND_EMAIL, SEND_NOTIFICATION} from 'server/utils/serverConstants';
import {ALREADY_ON_TEAM, PENDING_APPROVAL, REACTIVATED, SUCCESS} from 'universal/utils/constants';

const getAction = (invitee, inviterIsBillingLeader) => {
  const {
    isActiveTeamMember,
    isPendingApproval,
    isPendingInvitation,
    isActiveUser,
    isNewTeamMember,
    isOrgMember
  } = invitee;
  if (isActiveTeamMember) return ALREADY_ON_TEAM;
  if (isPendingApproval && !inviterIsBillingLeader) return PENDING_APPROVAL;
  if (isPendingInvitation) return SUCCESS;
  if (isOrgMember) {
    if (isNewTeamMember) {
      return isActiveUser ? SEND_NOTIFICATION : SEND_EMAIL;
    }
    return REACTIVATED;
  }
  if (inviterIsBillingLeader) {
    return isActiveUser ? SEND_NOTIFICATION : SEND_EMAIL;
  }
  return ASK_APPROVAL;
};

export default getAction;
