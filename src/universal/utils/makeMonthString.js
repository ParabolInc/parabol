import {months} from 'universal/utils/makeDateString';
import ensureDate from 'universal/utils/ensureDate';

export default function makeMonthString(datetime) {
  const timestamp = ensureDate(datetime);
  const month = timestamp.getMonth();
  const year = timestamp.getFullYear();
  return `${months[month]} ${year}`;
}
