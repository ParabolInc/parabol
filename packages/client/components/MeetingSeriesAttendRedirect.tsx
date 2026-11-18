import {getRouteApi} from '@tanstack/react-router'
import graphql from 'babel-plugin-relay/macro'
import {usePreloadedQuery} from 'react-relay'
import Redirect from '~/routing/Redirect'
import type {MeetingSeriesAttendRedirectQuery} from '../__generated__/MeetingSeriesAttendRedirectQuery.graphql'
import useQueryRefLease from '../routing/useQueryRefLease'

const routeApi = getRouteApi('/tipTapLayout/privateLayout/meeting-series/$slug')

const MeetingSeriesAttendRedirect = () => {
  const {queryRef} = routeApi.useLoaderData()
  useQueryRefLease(queryRef)
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
  const activeMeeting = data.viewer.meetingSeries?.activeMeetings[0]
  if (activeMeeting) {
    return <Redirect replace to='/meet/$meetingId' params={{meetingId: activeMeeting.id}} />
  }
  return <Redirect replace to='/meetings' />
}

export default MeetingSeriesAttendRedirect
