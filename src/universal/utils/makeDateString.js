const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

const months = [
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

export default function makeDateString(timestamp = new Date()) {
  const day = timestamp.getDay();
  const month = timestamp.getMonth();
  const date = timestamp.getDate();
  const year = timestamp.getFullYear();
  return `${days[day]}, ${months[month]} ${date}, ${year}`;
}
