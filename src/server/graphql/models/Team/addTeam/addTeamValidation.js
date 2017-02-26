import legitify from 'universal/validation/legitify';
import {requiredId, fullName, requiredEmail, teamName} from 'universal/validation/templates';

export default function addTeamValidation() {
  return legitify({
    invitees: [{
      email: requiredEmail,
      fullName
    }],
    newTeam: {
      id: requiredId,
      name: teamName,
      orgId: requiredId
    }
  });
}
