import graphql from 'babel-plugin-relay/macro'
import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {parseMeetingSeriesIdFromSlug} from 'parabol-client/shared/meetingSeriesSlug'
import {Suspense} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Navigate, useParams} from 'react-router'
import type {MeetingSeriesAttendRedirectQuery} from '../__generated__/MeetingSeriesAttendRedirectQuery.graphql'
import meetingSeriesAttendRedirectQuery from '../__generated__/MeetingSeriesAttendRedirectQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'

const Inner = (props: {queryRef: PreloadedQuery<MeetingSeriesAttendRedirectQuery>}) => {
  const {queryRef} = props
  const data = usePreloadedQuery<MeetingSeriesAttendRedirectQuery>(
    graphql`
      query MeetingSeriesAttendRedirectQuery($meetingSeriesId: ID!) {
        viewer {
          meetingSeries(meetingSeriesId: $meetingSeriesId) {
            activeMeetings {
              id
            }
          }
        }
      }
    `,
    queryRef
  )
  const series = data.viewer.meetingSeries
  const activeMeeting = series?.activeMeetings[0]
  if (activeMeeting) {
    return <Navigate replace to={`/meet/${activeMeeting.id}`} />
  }
  return <Navigate replace to='/meetings' />
}

const MeetingSeriesAttendRedirect = () => {
  const {slug} = useParams()
  const rawId = slug ? parseMeetingSeriesIdFromSlug(slug) : null
  const meetingSeriesId = rawId != null ? MeetingSeriesId.join(rawId) : null
  const queryRef = useQueryLoaderNow<MeetingSeriesAttendRedirectQuery>(
    meetingSeriesAttendRedirectQuery,
    {meetingSeriesId: meetingSeriesId ?? ''}
  )
  if (!meetingSeriesId) return <Navigate replace to='/meetings' />
  return <Suspense fallback={''}>{queryRef && <Inner queryRef={queryRef} />}</Suspense>
}

export default MeetingSeriesAttendRedirect
