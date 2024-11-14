import {Suspense, useEffect} from 'react'
import meetingSelectorQuery, {
  MeetingSelectorQuery
} from '../__generated__/MeetingSelectorQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import useRouter from '../hooks/useRouter'
import MeetingSelector from './MeetingSelector'

const MeetingRoot = () => {
  const {history, match} = useRouter<{meetingId: string}>()
  const {params} = match
  const {meetingId} = params
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
