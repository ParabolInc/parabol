import {Suspense} from 'react'
import {Navigate, useParams} from 'react-router'
import meetingSeriesManagementPageQuery, {
  type MeetingSeriesManagementPageQuery
} from '../__generated__/MeetingSeriesManagementPageQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import MeetingSeriesManagementPage from './MeetingSeriesManagementPage'

const MeetingSeriesManagementRoot = () => {
  const {meetingSeriesId} = useParams()
  const queryRef = useQueryLoaderNow<MeetingSeriesManagementPageQuery>(
    meetingSeriesManagementPageQuery,
    {meetingSeriesId: meetingSeriesId!}
  )
  if (!meetingSeriesId) return <Navigate to='/meetings' replace />
  return (
    <Suspense fallback={''}>
      {queryRef && <MeetingSeriesManagementPage queryRef={queryRef} />}
    </Suspense>
  )
}

export default MeetingSeriesManagementRoot
