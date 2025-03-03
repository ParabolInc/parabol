import {matchPath} from 'react-router-dom'

const onMeetingRoute = (pathname: string, meetingIds: readonly string[]) => {
  for (let i = 0; i < meetingIds.length; i++) {
    const meetingId = meetingIds[i]
    const res = matchPath<{meetingId: string}>(pathname, {
      path: '/meet/:meetingId'
    })
    if (res && res.params.meetingId === meetingId) return true
  }
  return false
}

export default onMeetingRoute
