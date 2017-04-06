import {inviteesRaw} from 'universal/validation/templates';
import legitify from './legitify';

export default function makeStep3RawSchema() {
  return legitify({
    inviteesRaw
  });
}
