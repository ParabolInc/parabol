import {createICS} from 'universal/utils/makeCalendarInvites';

export default async function sendICS(req, res) {
  const {teamName, createdAt, meetingUrl} = req.query;
  const startDate = new Date(Number(createdAt));
  const icsText = createICS(startDate, meetingUrl, teamName);
  res.set('Content-Type', 'text/calendar').set('Content-disposition', 'attachment; filename=Parabol Action Meeting.ics');
  res.send(icsText);
}
