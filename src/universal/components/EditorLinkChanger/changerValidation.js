import legitify from 'universal/validation/legitify';
import {linkText, linkifiedUrl} from 'universal/validation/templates';

export default function changerValidation() {
  return legitify({
    text: linkText,
    link: linkifiedUrl
  });
}
