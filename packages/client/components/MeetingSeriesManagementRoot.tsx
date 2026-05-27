import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {Suspense} from 'react'
import {Navigate, useParams} from 'react-router'
import meetingSeriesManagementPageQuery, {
  type MeetingSeriesManagementPageQuery
} from '../__generated__/MeetingSeriesManagementPageQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import MeetingSeriesManagementPage from './MeetingSeriesManagementPage'

const MeetingSeriesManagementRoot = () => {
  const {meetingSeriesId: routeParam} = useParams()
  const meetingSeriesId = routeParam
    ? /^\d+$/.test(routeParam)
      ? MeetingSeriesId.join(Number(routeParam))
      : routeParam
    : ''
  const queryRef = useQueryLoaderNow<MeetingSeriesManagementPageQuery>(
    meetingSeriesManagementPageQuery,
    {meetingSeriesId}
  )
  if (!routeParam) return <Navigate to='/meetings' replace />
  return (
    <Suspense fallback={''}>
      {queryRef && <MeetingSeriesManagementPage queryRef={queryRef} />}
    </Suspense>
  )
}

export default MeetingSeriesManagementRoot
