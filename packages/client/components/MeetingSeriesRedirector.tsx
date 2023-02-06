import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Redirect} from 'react-router'
import {MeetingSeriesRedirectorQuery} from '../__generated__/MeetingSeriesRedirectorQuery.graphql'
interface Props {
  meetingSeriesId: string
  queryRef: PreloadedQuery<MeetingSeriesRedirectorQuery>
}

const MeetingSeriesRedirector = (props: Props) => {
  const {queryRef, meetingSeriesId} = props

  const data = usePreloadedQuery<MeetingSeriesRedirectorQuery>(
    graphql`
      query MeetingSeriesRedirectorQuery($meetingSeriesId: ID!) {
        viewer {
          isConnected
          meetingSeries(meetingSeriesId: $meetingSeriesId) {
            mostRecentMeeting {
              id
            }
          }
        }
      }
    `,
    queryRef,
    {UNSTABLE_renderPolicy: 'full'}
  )

  const {viewer} = data
  const {meetingSeries} = viewer

  if (!meetingSeries) {
    return (
      <Redirect
        to={{
          pathname: `/invitation-required`,
          search: `?redirectTo=${encodeURIComponent(
            window.location.pathname
          )}&meetingSeriesId=${meetingSeriesId}`
        }}
      />
    )
  } else {
    const {mostRecentMeeting} = meetingSeries
    const {id: meetingId} = mostRecentMeeting

    return <Redirect to={`/meet/${meetingId}`} />
  }
}

export default MeetingSeriesRedirector
