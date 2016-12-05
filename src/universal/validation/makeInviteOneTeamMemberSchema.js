import legitify from './legitify';
import {makeInviteeTemplate} from 'universal/validation/templates';
export default function makeInviteTeamMemberSchema({inviteEmails, teamMemberEmails}) {
  return legitify({
    inviteTeamMember: makeInviteeTemplate(inviteEmails, teamMemberEmails)
  });
}
