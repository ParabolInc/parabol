import legitify from 'universal/validation/legitify';
import {linkText, url} from 'universal/validation/templates';

export default function changerValidation() {
  return legitify({
    text: linkText,
    link: url
  });
}
