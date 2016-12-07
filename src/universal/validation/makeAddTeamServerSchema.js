// the server schema doesn't have raw invitees
import legitify from './legitify';
import {id, fullName, makeInviteeTemplate, teamName} from 'universal/validation/templates';
import {idRegex} from 'universal/validation/regex';

export default function makeAddTeamServerSchema({inviteEmails, teamMemberEmails}) {
  return legitify({
    invitees: [{
      email: makeInviteeTemplate(inviteEmails, teamMemberEmails),
      fullName
    }],
    newTeam: {
      id,
      name: teamName,
      orgId: (value) => value.required().matches(idRegex)
    }
  });
}
