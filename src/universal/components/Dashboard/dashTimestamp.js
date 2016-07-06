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

const now = new Date();
const day = now.getDay();
const month = now.getMonth();
const date = now.getDate();
const year = now.getFullYear();
const dashTimestamp = `${days[day]}, ${months[month]} ${date}, ${year}`;

export default dashTimestamp;
