import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Redirect} from 'react-router'
import {MeetingSeriesRedirectorQuery} from '../__generated__/MeetingSeriesRedirectorQuery.graphql'
interface Props {
  meetingId: string
  queryRef: PreloadedQuery<MeetingSeriesRedirectorQuery>
}

const MeetingSeriesRedirector = (props: Props) => {
  const {queryRef, meetingId} = props

  const data = usePreloadedQuery<MeetingSeriesRedirectorQuery>(
    graphql`
      query MeetingSeriesRedirectorQuery($meetingId: ID!) {
        viewer {
          isConnected
          meeting(meetingId: $meetingId) {
            ... on TeamPromptMeeting {
              meetingSeries {
                mostRecentMeeting {
                  id
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  )

  const {viewer} = data
  const {meeting} = viewer

  if (!meeting) {
    return (
      <Redirect
        to={{
          pathname: `/invitation-required`,
          search: `?redirectTo=${encodeURIComponent(
            window.location.pathname
          )}&meetingId=${meetingId}`
        }}
      />
    )
  } else {
    const {meetingSeries} = meeting
    if (!meetingSeries) {
      return <Redirect to={`/meet/${meetingId}`} />
    }
    const {mostRecentMeeting} = meetingSeries
    const {id: activeMeetingId} = mostRecentMeeting

    return <Redirect to={`/meet/${activeMeetingId}`} />
  }
}

export default MeetingSeriesRedirector
