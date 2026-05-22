import graphql from 'babel-plugin-relay/macro'
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
      query MeetingSeriesAttendRedirectQuery($slug: String!) {
        viewer {
          meetingSeriesBySlug(slug: $slug) {
            activeMeetings {
              id
            }
          }
        }
      }
    `,
    queryRef
  )
  const series = data.viewer.meetingSeriesBySlug
  const activeMeeting = series?.activeMeetings[0]
  if (activeMeeting) {
    return <Navigate replace to={`/meet/${activeMeeting.id}`} />
  }
  return <Navigate replace to='/meetings' />
}

const WithSlug = ({slug}: {slug: string}) => {
  const queryRef = useQueryLoaderNow<MeetingSeriesAttendRedirectQuery>(
    meetingSeriesAttendRedirectQuery,
    {slug}
  )
  return <Suspense fallback={''}>{queryRef && <Inner queryRef={queryRef} />}</Suspense>
}

const MeetingSeriesAttendRedirect = () => {
  const {slug} = useParams()
  if (!slug) return <Navigate replace to='/meetings' />
  return <WithSlug slug={slug} />
}

export default MeetingSeriesAttendRedirect
