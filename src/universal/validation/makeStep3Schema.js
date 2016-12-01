import legitify from './legitify';
import {fullName, task} from 'universal/validation/templates';


export default function makeStep3RawSchema() {
  return legitify({
    invitees: [{
      email: (value) => value
        .required('Impossible!'),
      fullName,
      task
    }]
  })
};
