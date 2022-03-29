import React, {Suspense} from 'react'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import NewMeetingSummary from './NewMeetingSummary'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import newMeetingSummaryQuery, {
  NewMeetingSummaryQuery
} from '../../../__generated__/NewMeetingSummaryQuery.graphql'

interface Props extends RouteComponentProps<{urlAction?: 'csv'; meetingId: string}> {}

const NewMeetingSummaryRoot = ({match}: Props) => {
  const {
    params: {urlAction, meetingId = 'demoMeeting'}
  } = match
  const queryRef = useQueryLoaderNow<NewMeetingSummaryQuery>(newMeetingSummaryQuery, {meetingId})
  return (
    <Suspense fallback={''}>
      {queryRef && <NewMeetingSummary queryRef={queryRef} urlAction={urlAction} />}
    </Suspense>
  )
}

export default withRouter(NewMeetingSummaryRoot)
