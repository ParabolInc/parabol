import {createICS} from 'parabol-client/utils/makeCalendarInvites'
import qs from 'querystring'
import {HttpRequest, HttpResponse} from 'uWebSockets.js'

const ICSHandler = (res: HttpResponse, req: HttpRequest) => {
  const query = req.getQuery()
  const {teamName, createdAt, meetingUrl} = qs.parse(query)
  const startDate = new Date(Number(createdAt))
  if (typeof meetingUrl !== 'string' || typeof teamName !== 'string') return
  const icsText = createICS(startDate, meetingUrl, teamName)
  res
    .writeHeader('content-type', 'text/calendar')
    .writeHeader('content-disposition', 'attachment; filename=Parabol Check-in Meeting.ics')
    .end(icsText)
}

export default ICSHandler
