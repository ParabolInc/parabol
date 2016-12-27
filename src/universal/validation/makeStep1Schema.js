import {id, preferredName} from 'universal/validation/templates';
import legitify from './legitify';

export default function makeStep1Schema() {
  return legitify({
    id,
    preferredName
  });
}
