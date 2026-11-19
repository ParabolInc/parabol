import {rootRouteId, useRouteContext} from '@tanstack/react-router'
import {useEffect} from 'react'

// Holds the meeting's join while its page shows it, so the viewer keeps getting its updates
const useJoinedMeetingLease = (meetingId: string) => {
  const {joinedMeetings} = useRouteContext({from: rootRouteId})
  useEffect(() => joinedMeetings.lease(meetingId), [joinedMeetings, meetingId])
}

export default useJoinedMeetingLease
