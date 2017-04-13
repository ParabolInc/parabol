import {createICS} from 'universal/utils/makeCalendarInvites';

export default async function sendICS(req, res) {
  const {teamName, createdAt, meetingUrl} = req.query;
  const icsText = createICS(new Date(createdAt), meetingUrl, teamName);
  res.set('Content-Type', 'text/calendar').set('Content-disposition', 'attachment; filename=Parabol Action Meeting.ics');
  res.send(icsText);
}
