import {Suspense} from 'react'
import newMeetingSummaryQuery, {
  NewMeetingSummaryQuery
} from '../../../__generated__/NewMeetingSummaryQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import useRouter from '../../../hooks/useRouter'
import {LoaderSize} from '../../../types/constEnums'
import {Loader} from '../../../utils/relay/renderLoader'
import NewMeetingSummary from './NewMeetingSummary'

const NewMeetingSummaryRoot = () => {
  const {match} = useRouter<{urlAction?: 'csv'; meetingId: string}>()
  const {
    params: {urlAction, meetingId = 'demoMeeting'}
  } = match
  const queryRef = useQueryLoaderNow<NewMeetingSummaryQuery>(newMeetingSummaryQuery, {
    meetingId,
    first: 5
  })
  return (
    <Suspense fallback={<Loader size={LoaderSize.WHOLE_PAGE} />}>
      {queryRef && <NewMeetingSummary queryRef={queryRef} urlAction={urlAction} />}
    </Suspense>
  )
}

export default NewMeetingSummaryRoot
