import legitify from 'universal/validation/legitify';
import {teamName} from 'universal/validation/templates';

export default function editTeamNameValidation() {
  return legitify({
    teamName
  });
}
