// import {emailRegex} from 'universal/validation/regex';
import legitify from './legitify';

export default function makeStep1Schema() {
  return legitify({
    preferredName: (value) => value
      .required('That\'s not much of a name, is it?')
      .min(2, 'Cmon, you call that a name?')
      .max(100, 'I want your name, not your life story')
  })
};
