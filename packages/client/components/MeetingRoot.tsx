import {Suspense, useEffect} from 'react'
import {useHistory, useParams} from 'react-router'
import meetingSelectorQuery, {
  type MeetingSelectorQuery
} from '../__generated__/MeetingSelectorQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import MeetingSelector from './MeetingSelector'

const MeetingRoot = () => {
  const history = useHistory()
  const {meetingId} = useParams<{meetingId: string}>()
  useEffect(() => {
    if (!meetingId) {
      history.replace('/meetings')
    }
  }, [])
  const queryRef = useQueryLoaderNow<MeetingSelectorQuery>(meetingSelectorQuery, {meetingId})
  if (!meetingId) return null
  return (
    <Suspense fallback={''}>
      {queryRef && <MeetingSelector meetingId={meetingId} queryRef={queryRef} />}
    </Suspense>
  )
}

export default MeetingRoot
