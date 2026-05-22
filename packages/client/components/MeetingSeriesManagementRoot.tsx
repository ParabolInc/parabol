import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {Suspense} from 'react'
import {Navigate, useParams} from 'react-router'
import meetingSeriesManagementPageQuery, {
  type MeetingSeriesManagementPageQuery
} from '../__generated__/MeetingSeriesManagementPageQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import MeetingSeriesManagementPage from './MeetingSeriesManagementPage'

const WithId = ({meetingSeriesId}: {meetingSeriesId: string}) => {
  const queryRef = useQueryLoaderNow<MeetingSeriesManagementPageQuery>(
    meetingSeriesManagementPageQuery,
    {meetingSeriesId}
  )
  return (
    <Suspense fallback={''}>
      {queryRef && <MeetingSeriesManagementPage queryRef={queryRef} />}
    </Suspense>
  )
}

const MeetingSeriesManagementRoot = () => {
  const {meetingSeriesId: routeParam} = useParams()
  if (!routeParam) return <Navigate to='/meetings' replace />
  // Accept either a numeric id (new ScheduledSeriesCard links) or a global id
  // (older links/bookmarks). Route the query through the global-id form.
  const meetingSeriesId = /^\d+$/.test(routeParam)
    ? MeetingSeriesId.join(Number(routeParam))
    : routeParam
  return <WithId meetingSeriesId={meetingSeriesId} />
}

export default MeetingSeriesManagementRoot
