import {Suspense} from 'react'
import {Navigate, useParams} from 'react-router'
import meetingSeriesRedirectorQuery, {
  type MeetingSeriesRedirectorQuery
} from '../__generated__/MeetingSeriesRedirectorQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import MeetingSeriesRedirector from './MeetingSeriesRedirector'

const MeetingRoot = () => {
  const {meetingId} = useParams()
  const queryRef = useQueryLoaderNow<MeetingSeriesRedirectorQuery>(meetingSeriesRedirectorQuery, {
    meetingId: meetingId!
  })
  if (!meetingId) return <Navigate to='/meetings' replace />
  return (
    <Suspense fallback={''}>
      {queryRef && <MeetingSeriesRedirector meetingId={meetingId} queryRef={queryRef} />}
    </Suspense>
  )
}

export default MeetingRoot
