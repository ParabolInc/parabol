import {preferredName} from 'universal/validation/templates';
import legitify from 'universal/validation/legitify';

export default function step1Validation() {
  return legitify({
    preferredName
  });
}
