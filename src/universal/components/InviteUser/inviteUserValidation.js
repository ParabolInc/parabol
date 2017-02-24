import legitify from 'universal/validation/legitify';
import {makeInviteeTemplate} from 'universal/validation/templates';
export default function makeInviteTeamMemberSchema({inviteEmails, orgApprovalEmails, teamMemberEmails}) {
  return legitify({
    inviteTeamMember: makeInviteeTemplate(inviteEmails, teamMemberEmails, orgApprovalEmails)
  });
}
