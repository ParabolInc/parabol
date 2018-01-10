import legitify from 'universal/validation/legitify';
import {teamName} from 'universal/validation/templates';

export default function createFirstTeamValidation() {
  return legitify({
    name: teamName
  });
}
