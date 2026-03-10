import {matchPath} from 'react-router-dom'

const onMeetingRoute = (pathname: string, meetingIds: readonly string[]) => {
  for (let i = 0; i < meetingIds.length; i++) {
    const meetingId = meetingIds[i]
    const res = matchPath({path: '/meet/:meetingId', end: false}, pathname)
    if (res && res.params.meetingId === meetingId) return true
  }
  return false
}

export default onMeetingRoute
