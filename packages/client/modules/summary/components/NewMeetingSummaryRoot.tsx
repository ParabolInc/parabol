import {useParams} from '@tanstack/react-router'
import {Suspense} from 'react'
import newMeetingSummaryQuery, {
  type NewMeetingSummaryQuery
} from '../../../__generated__/NewMeetingSummaryQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import NewMeetingSummary from './NewMeetingSummary'

const NewMeetingSummaryRoot = () => {
  const {urlAction, meetingId = 'demoMeeting'} = useParams({strict: false})
  const queryRef = useQueryLoaderNow<NewMeetingSummaryQuery>(newMeetingSummaryQuery, {
    meetingId,
    first: 5,
    nullId: null
  })
  return (
    <Suspense fallback={null}>
      {queryRef && (
        <NewMeetingSummary queryRef={queryRef} urlAction={urlAction as 'csv' | undefined} />
      )}
    </Suspense>
  )
}

export default NewMeetingSummaryRoot
