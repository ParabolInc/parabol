export const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

export default function makeDateString(timestamp = new Date(), showDay = true) {
  const day = timestamp.getDay();
  const month = timestamp.getMonth();
  const date = timestamp.getDate();
  const year = timestamp.getFullYear();
  const dayPart = showDay ? `${days[day]}, ` : '';
  return `${dayPart}${months[month]} ${date}, ${year}`;
}
