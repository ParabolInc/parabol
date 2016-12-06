import legitify from './legitify';
import {inviteesRaw} from 'universal/validation/templates';

export default function makeStep3RawSchema() {
  return legitify({
    inviteesRaw
  });
}
