import {teamName} from 'universal/validation/templates';
import legitify from 'universal/validation/legitify';

export default function step2Validation() {
  return legitify({
    teamName
  });
}
