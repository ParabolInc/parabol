import legitify from 'universal/validation/legitify';
import {requiredId, teamName} from 'universal/validation/templates';

export default function updateTeamNameValidation() {
  return legitify({
    id: requiredId,
    name: teamName,
  });
}
