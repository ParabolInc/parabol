import legitify from 'universal/validation/legitify';
import {requiredId, fullName, requiredEmail, teamName, orgName} from 'universal/validation/templates';

export default function addOrgValidation() {
  return legitify({
    invitees: [{
      email: requiredEmail,
      fullName
    }],
    newTeam: {
      id: requiredId,
      name: teamName,
      orgId: requiredId
    },
    orgName
  });
}
