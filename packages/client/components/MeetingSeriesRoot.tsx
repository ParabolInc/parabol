import {Suspense} from 'react'
import {Redirect, useParams} from 'react-router'
import meetingSeriesRedirectorQuery, {
  type MeetingSeriesRedirectorQuery
} from '../__generated__/MeetingSeriesRedirectorQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import MeetingSeriesRedirector from './MeetingSeriesRedirector'

const MeetingRoot = () => {
  const {meetingId} = useParams<{meetingId: string}>()
  const queryRef = useQueryLoaderNow<MeetingSeriesRedirectorQuery>(meetingSeriesRedirectorQuery, {
    meetingId
  })
  if (!meetingId) return <Redirect to='/meetings' />
  return (
    <Suspense fallback={''}>
      {queryRef && <MeetingSeriesRedirector meetingId={meetingId} queryRef={queryRef} />}
    </Suspense>
  )
}

export default MeetingRoot
