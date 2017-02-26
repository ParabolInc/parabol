import {requiredId, teamName} from 'universal/validation/templates';
import legitify from 'universal/validation/legitify';

export default function createFirstTeamValidation() {
  return legitify({
    id: requiredId,
    name: teamName
  });
}
