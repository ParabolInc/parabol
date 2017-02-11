import legitify from '../../validation/legitify';
import {makeInviteeTemplate} from '../../validation/templates';
export default function makeInviteTeamMemberSchema({inviteEmails, orgApprovalEmails, teamMemberEmails}) {
  return legitify({
    inviteTeamMember: makeInviteeTemplate(inviteEmails, teamMemberEmails, orgApprovalEmails)
  });
}
