import React, {Suspense} from 'react'
import {Redirect} from 'react-router'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import useRouter from '../hooks/useRouter'
import meetingSeriesRedirectorQuery, {
  MeetingSeriesRedirectorQuery
} from '../__generated__/MeetingSeriesRedirectorQuery.graphql'
import MeetingSeriesRedirector from './MeetingSeriesRedirector'

const MeetingRoot = () => {
  const {match} = useRouter<{meetingId: string}>()
  const {params} = match
  const {meetingId} = params
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
