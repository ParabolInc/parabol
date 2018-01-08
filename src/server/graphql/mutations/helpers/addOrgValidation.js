import legitify from 'universal/validation/legitify';
import {fullName, orgName, requiredEmail, teamName} from 'universal/validation/templates';

export default function addOrgValidation() {
  return legitify({
    invitees: [{
      email: requiredEmail,
      fullName
    }],
    newTeam: {
      name: teamName
    },
    orgName
  });
}
