import legitify from 'universal/validation/legitify';
import {requiredId, teamName} from 'universal/validation/templates';

export default function addTeamValidation() {
  return legitify({
    id: requiredId,
    name: teamName,
    isArchived: (value) => value
  });
}
