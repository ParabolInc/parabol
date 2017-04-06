import {months} from 'universal/utils/makeDateString';

export default function makeMonthString(timestamp = new Date()) {
  const month = timestamp.getMonth();
  const year = timestamp.getFullYear();
  return `${months[month]} ${year}`;
}
