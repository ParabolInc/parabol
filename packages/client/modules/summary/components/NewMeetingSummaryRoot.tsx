import React, {Suspense} from 'react'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import useRouter from '../../../hooks/useRouter'
import {LoaderSize} from '../../../types/constEnums'
import {renderLoader} from '../../../utils/relay/renderLoader'
import newMeetingSummaryQuery, {
  NewMeetingSummaryQuery
} from '../../../__generated__/NewMeetingSummaryQuery.graphql'
import NewMeetingSummary from './NewMeetingSummary'

const NewMeetingSummaryRoot = () => {
  const {match} = useRouter<{urlAction?: 'csv'; meetingId: string}>()
  const {
    params: {urlAction, meetingId = 'demoMeeting'}
  } = match
  const queryRef = useQueryLoaderNow<NewMeetingSummaryQuery>(newMeetingSummaryQuery, {meetingId})
  return (
    <Suspense fallback={renderLoader({size: LoaderSize.WHOLE_PAGE})}>
      {queryRef && <NewMeetingSummary queryRef={queryRef} urlAction={urlAction} />}
    </Suspense>
  )
}

export default NewMeetingSummaryRoot
