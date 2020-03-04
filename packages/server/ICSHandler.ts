import {createICS} from 'parabol-client/utils/makeCalendarInvites'
import {HttpResponse, HttpRequest} from 'uWebSockets.js'
import qs from 'querystring'

const ICSHandler = (res: HttpResponse, req: HttpRequest) => {
  const query = req.getQuery()
  const {teamName, createdAt, meetingUrl} = qs.parse(query)
  const startDate = new Date(Number(createdAt))
  const icsText = createICS(startDate, meetingUrl, teamName)
  res
    .writeHeader('content-type', 'text/calendar')
    .writeHeader('content-disposition', 'attachment; filename=Parabol Check-in Meeting.ics')
    .end(icsText)
}

export default ICSHandler
