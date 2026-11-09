import {Suspense, useEffect} from 'react'
import {useNavigate, useParams} from 'react-router'
import useJoinedMeetingQuery from '../hooks/useJoinedMeetingQuery'
import MeetingSelector from './MeetingSelector'

const MeetingRoot = () => {
  const navigate = useNavigate()
  const {meetingId} = useParams()
  useEffect(() => {
    if (!meetingId) {
      navigate('/meetings', {replace: true})
    }
  }, [])
  const queryRef = useJoinedMeetingQuery(meetingId)
  if (!meetingId) return null
  return (
    <Suspense fallback={''}>
      {queryRef && <MeetingSelector meetingId={meetingId} queryRef={queryRef} />}
    </Suspense>
  )
}

export default MeetingRoot
