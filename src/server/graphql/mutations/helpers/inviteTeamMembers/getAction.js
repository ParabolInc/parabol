import {ASK_APPROVAL, REACTIVATE, SEND_INVITATION} from 'server/utils/serverConstants';
import {ALREADY_ON_TEAM, PENDING_APPROVAL, SUCCESS} from 'universal/utils/constants';

const getAction = (invitee, inviterIsBillingLeader) => {
  const {
    isActiveTeamMember,
    isPendingApproval,
    isPendingInvitation,
    isNewTeamMember,
    isOrgMember
  } = invitee;
  if (isActiveTeamMember) return ALREADY_ON_TEAM;
  if (isPendingApproval && !inviterIsBillingLeader) return PENDING_APPROVAL;
  if (isPendingInvitation) return SUCCESS;
  if (isOrgMember) {
    return isNewTeamMember ? SEND_INVITATION : REACTIVATE;
  }
  return inviterIsBillingLeader ? SEND_INVITATION : ASK_APPROVAL;
};

export default getAction;
