import ms from 'ms';

const padLeftZero = (number) => {
  return String(number).padStart(2, 0);
};

const getStartTime = (createdAt) => {
  const newTime = new Date(createdAt.getTime() + ms('7d'));
  const oldMins = newTime.getMinutes();
  if (oldMins >= 45) {
    // round up
    newTime.setHours(newTime.getHours() + 1);
    newTime.setMinutes(0);
  } else if (oldMins > 20) {
    // round to nearest :30 minutes
    newTime.setMinutes(30);
  } else {
    // round down
    newTime.setMinutes(0);
  }
  newTime.setSeconds(0);

  //start
  const YYYY = newTime.getFullYear();
  const MM = padLeftZero(newTime.getMonth() + 1);
  const DD = padLeftZero(newTime.getDate());
  const HH = padLeftZero(newTime.getHours());
  const mm = padLeftZero(newTime.getMinutes());

  //end
  const DURATION = ms('30m');
  const endTime = new Date(newTime + DURATION);
  const YYY2 = endTime.getFullYear();
  const M2 = padLeftZero(endTime.getMonth() + 1);
  const D2 = padLeftZero(endTime.getDate());
  const H2 = padLeftZero(endTime.getHours());
  const m2 = padLeftZero(endTime.getMinutes());

  return `${YYYY}${MM}${DD}T${HH}${mm}00Z/${YYY2}${M2}${D2}T${H2}${m2}00Z`;
};

export const createGoogleCalendarInviteURL = (createdAt, meetingUrl, teamName) => {
  return encodeURI(`http://www.google.com/calendar/render?action=TEMPLATE&text=Action Meeting for ${teamName}&dates=${getStartTime(createdAt)}&trp=true&location=${meetingUrl}&sprop=${meetingUrl}&sprop=name:${teamName} Action Meeting`);
};

export const createICS = (createdAt, meetingUrl, teamName) => {
  const [startTime, endTime] = getStartTime(createdAt).split('/');
  // it's ugly, but if you mess with the indention here, you eff up the world
  return `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:parabol.co
X-PUBLISHED-TTL:P1W
BEGIN:VEVENT
UID:${startTime}
DTSTART:${startTime}
SEQUENCE:0
TRANSP:OPAQUE
DTEND:${endTime}
LOCATION:${meetingUrl}
SUMMARY:Star Wars Day Party
CLASS:PUBLIC
SUMMARY:Action Meeting for ${teamName}
CLASS:PUBLIC
DTSTAMP:${startTime}
RRULE:FREQ=WEEKLY;COUNT=8
END:VEVENT
END:VCALENDAR`;
};

export const makeIcsUrl = (createdAt, meetingUrl, teamName) => {
  const baseUrl = meetingUrl.substr(0, meetingUrl.indexOf('/meeting'));
  return `${baseUrl}/email/createics?teamName=${teamName}&createdAt=${createdAt.getTime()}&meetingUrl=${meetingUrl}`;
}
