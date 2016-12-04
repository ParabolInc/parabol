// the server schema doesn't have raw invitees
import legitify from './legitify';
import {id, fullName, makeInviteeTemplate, teamName} from 'universal/validation/templates';

export default function makeAddTeamSchema({inviteEmails, teamMemberEmails}) {
  return legitify({
    invitees: [{
      email: makeInviteeTemplate(inviteEmails, teamMemberEmails),
      fullName
    }],
    newTeam: {
      id,
      name: teamName
    }
  });
}
