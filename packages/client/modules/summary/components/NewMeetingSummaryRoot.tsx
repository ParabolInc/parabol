import {Suspense} from 'react'
import {useParams} from 'react-router-dom'
import newMeetingSummaryQuery, {
  type NewMeetingSummaryQuery
} from '../../../__generated__/NewMeetingSummaryQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import {LoaderSize} from '../../../types/constEnums'
import {Loader} from '../../../utils/relay/renderLoader'
import NewMeetingSummary from './NewMeetingSummary'

const NewMeetingSummaryRoot = () => {
  const {urlAction, meetingId = 'demoMeeting'} = useParams()
  const queryRef = useQueryLoaderNow<NewMeetingSummaryQuery>(newMeetingSummaryQuery, {
    meetingId,
    first: 5,
    nullId: null
  })
  return (
    <Suspense fallback={<Loader size={LoaderSize.WHOLE_PAGE} />}>
      {queryRef && (
        <NewMeetingSummary queryRef={queryRef} urlAction={urlAction as 'csv' | undefined} />
      )}
    </Suspense>
  )
}

export default NewMeetingSummaryRoot
