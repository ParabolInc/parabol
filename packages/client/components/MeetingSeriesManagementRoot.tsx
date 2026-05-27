import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {parseMeetingSeriesIdFromSlug} from 'parabol-client/shared/meetingSeriesSlug'
import {Suspense} from 'react'
import {Navigate, useParams} from 'react-router'
import meetingSeriesManagementPageQuery, {
  type MeetingSeriesManagementPageQuery
} from '../__generated__/MeetingSeriesManagementPageQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import MeetingSeriesManagementPage from './MeetingSeriesManagementPage'

const MeetingSeriesManagementRoot = () => {
  const {meetingSeriesId: routeParam} = useParams()
  const rawId = routeParam ? parseMeetingSeriesIdFromSlug(routeParam) : null
  const meetingSeriesId = rawId != null ? MeetingSeriesId.join(rawId) : ''
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
