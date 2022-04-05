import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import meetingSummaryEmailRootSsrQuery, {
  MeetingSummaryEmailRootSSRQuery
} from 'parabol-client/__generated__/MeetingSummaryEmailRootSSRQuery.graphql'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Environment} from 'relay-runtime'
import makeAppURL from '../../../utils/makeAppURL'
import MeetingSummaryEmail from './SummaryEmail/MeetingSummaryEmail/MeetingSummaryEmail'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'

const query = graphql`
  query MeetingSummaryEmailRootSSRQuery($meetingId: ID!) {
    viewer {
      newMeeting(meetingId: $meetingId) {
        meetingType
        team {
          id
        }
        ...MeetingSummaryEmail_meeting
      }
    }
  }
`

interface Props {
  appOrigin: string
  environment: Environment
  meetingId: string
}

export const meetingSummaryUrlParams = {
  utm_source: 'summary email',
  utm_medium: 'email',
  utm_campaign: 'after-meeting'
}

const MeetingSummaryEmailRootSSR = (props: Props) => {
  const {appOrigin, environment, meetingId} = props
  const queryRef = useQueryLoaderNow<MeetingSummaryEmailRootSSRQuery>(
    meetingSummaryEmailRootSsrQuery,
    {meetingId},
    undefined,
    false,
    environment
  )
  return (
    queryRef && (
      <MeetingSummaryEmailContainer
        queryRef={queryRef}
        meetingId={meetingId}
        appOrigin={appOrigin}
      />
    )
  )
}

interface MeetingSummaryEmailContainerProps {
  queryRef: PreloadedQuery<MeetingSummaryEmailRootSSRQuery>
  appOrigin: string
  meetingId: string
}

function MeetingSummaryEmailContainer(props: MeetingSummaryEmailContainerProps) {
  const {queryRef, meetingId, appOrigin} = props
  const data = usePreloadedQuery<MeetingSummaryEmailRootSSRQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
  const {viewer} = data
  if (!viewer) return null
  const {newMeeting} = viewer
  if (!newMeeting) return null
  const {team} = newMeeting
  const {id: teamId} = team
  const options = {searchParams: meetingSummaryUrlParams}
  const referrerUrl = makeAppURL(appOrigin, `new-summary/${meetingId}`, options)
  const meetingUrl = makeAppURL(appOrigin, `meet/${meetingId}`, options)
  const teamDashUrl = makeAppURL(appOrigin, `team/${teamId}`, options)
  const emailCSVUrl = makeAppURL(appOrigin, `new-summary/${meetingId}/csv`, options)
  return (
    <MeetingSummaryEmail
      meeting={newMeeting}
      referrer={'email'}
      teamDashUrl={teamDashUrl}
      meetingUrl={meetingUrl}
      referrerUrl={referrerUrl}
      emailCSVUrl={emailCSVUrl}
      appOrigin={appOrigin}
    />
  )
}

export default MeetingSummaryEmailRootSSR
