import {fullName, task} from 'universal/validation/templates';
import legitify from './legitify';


export default function makeStep3RawSchema() {
  return legitify({
    invitees: [{
      email: (value) => value
        .required('How did you forget the email?')
        .min(),
      fullName,
      task
    }]
  });
}
