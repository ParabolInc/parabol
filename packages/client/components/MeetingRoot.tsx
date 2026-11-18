import {useNavigate, useParams} from '@tanstack/react-router'
import {Suspense, useEffect} from 'react'
import useJoinedMeetingQuery from '../hooks/useJoinedMeetingQuery'
import MeetingSelector from './MeetingSelector'

const MeetingRoot = () => {
  const navigate = useNavigate()
  const {meetingId} = useParams({strict: false})
  useEffect(() => {
    if (!meetingId) {
      navigate({to: '/meetings', replace: true})
    }
  }, [])
  const queryRef = useJoinedMeetingQuery(meetingId)
  if (!meetingId) return null
  return (
    <Suspense fallback={''}>
      {queryRef?.variables.meetingId === meetingId && (
        <MeetingSelector meetingId={meetingId} queryRef={queryRef} />
      )}
    </Suspense>
  )
}

export default MeetingRoot
