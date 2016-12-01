import {id} from 'universal/validation/templates';
import legitify from './legitify';

export default function makeStep1Schema() {
  return legitify({
    id,
    preferredName: (value) => value
      .trim()
      .required('That\'s not much of a name, is it?')
      .min(2, 'Cmon, you call that a name?')
      .max(100, 'I want your name, not your life story')
  })
};
