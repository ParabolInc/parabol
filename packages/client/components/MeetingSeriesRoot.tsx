import React, {Suspense, useEffect} from 'react'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import useRouter from '../hooks/useRouter'
import meetingSeriesRedirectorQuery, {
  MeetingSeriesRedirectorQuery
} from '../__generated__/MeetingSeriesRedirectorQuery.graphql'
import MeetingSeriesRedirector from './MeetingSeriesRedirector'

const MeetingRoot = () => {
  const {history, match} = useRouter<{meetingSeriesId: string}>()
  const {params} = match
  const {meetingSeriesId: encodedMeetingSeriesId} = params
  const meetingSeriesId = decodeURIComponent(encodedMeetingSeriesId)
  useEffect(() => {
    if (!meetingSeriesId) {
      history.replace('/meetings')
    }
  }, [])
  const queryRef = useQueryLoaderNow<MeetingSeriesRedirectorQuery>(meetingSeriesRedirectorQuery, {
    meetingSeriesId
  })
  if (!meetingSeriesId) return null
  return (
    <Suspense fallback={''}>
      {queryRef && (
        <MeetingSeriesRedirector meetingSeriesId={meetingSeriesId} queryRef={queryRef} />
      )}
    </Suspense>
  )
}

export default MeetingRoot
