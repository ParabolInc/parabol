import {Suspense, useEffect} from 'react'
import {useNavigate, useParams} from 'react-router'
import meetingSelectorQuery, {
  type MeetingSelectorQuery
} from '../__generated__/MeetingSelectorQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import MeetingSelector from './MeetingSelector'

const MeetingRoot = () => {
  const navigate = useNavigate()
  const {meetingId} = useParams()
  useEffect(() => {
    if (!meetingId) {
      navigate('/meetings', {replace: true})
    }
  }, [])
  const queryRef = useQueryLoaderNow<MeetingSelectorQuery>(meetingSelectorQuery, {
    meetingId: meetingId!
  })
  if (!meetingId) return null
  return (
    <Suspense fallback={''}>
      {queryRef && <MeetingSelector meetingId={meetingId} queryRef={queryRef} />}
    </Suspense>
  )
}

export default MeetingRoot
