import React, {Suspense} from 'react'
import {Redirect} from 'react-router'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import useRouter from '../hooks/useRouter'
import meetingSeriesRedirectorQuery, {
  MeetingSeriesRedirectorQuery
} from '../__generated__/MeetingSeriesRedirectorQuery.graphql'
import MeetingSeriesRedirector from './MeetingSeriesRedirector'

const MeetingRoot = () => {
  const {match} = useRouter<{meetingSeriesId: string}>()
  const {params} = match
  const {meetingSeriesId: encodedMeetingSeriesId} = params
  const meetingSeriesId = decodeURIComponent(encodedMeetingSeriesId)
  const queryRef = useQueryLoaderNow<MeetingSeriesRedirectorQuery>(meetingSeriesRedirectorQuery, {
    meetingSeriesId
  })
  if (!meetingSeriesId) return <Redirect to='/meetings' />
  return (
    <Suspense fallback={''}>
      {queryRef && (
        <MeetingSeriesRedirector meetingSeriesId={meetingSeriesId} queryRef={queryRef} />
      )}
    </Suspense>
  )
}

export default MeetingRoot
