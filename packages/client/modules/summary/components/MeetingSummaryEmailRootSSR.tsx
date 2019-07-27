import React from 'react'
import {Environment} from 'relay-runtime'
import QueryRenderer from '../../../components/QueryRenderer/QueryRenderer'
import graphql from 'babel-plugin-relay/macro'
import MeetingSummaryEmail from '../../email/components/SummaryEmail/MeetingSummaryEmail/MeetingSummaryEmail'
import makeAppLink from '../../../../server/utils/makeAppLink'
import {meetingTypeToSlug} from '../../../utils/meetings/lookups'

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
  environment: Environment
  meetingId: string
}

const MeetingSummaryEmailRootSSR = (props: Props) => {
  const {environment, meetingId} = props
  return (
    <QueryRenderer
      environment={environment}
      query={query}
      variables={{meetingId}}
      cacheConfig={{ttl: 1000}}
      render={({props}) => {
        if (!props) return null
        const {viewer} = props
        const {newMeeting} = viewer
        const {meetingType, team} = newMeeting
        const {id: teamId} = team
        const meetingSlug = meetingTypeToSlug[meetingType]
        const referrerUrl = makeAppLink(`new-summary/${meetingId}`)
        const meetingUrl = makeAppLink(`${meetingSlug}/${teamId}`)
        const teamDashUrl = makeAppLink(`team/${teamId}`)
        const emailCSVUrl = makeAppLink(`new-summary/${meetingId}/csv`)
        return (
          <MeetingSummaryEmail
            meeting={newMeeting}
            referrer={'email'}
            teamDashUrl={teamDashUrl}
            meetingUrl={meetingUrl}
            referrerUrl={referrerUrl}
            emailCSVUrl={emailCSVUrl}
          />
        )
      }}
    />
  )
}

export default MeetingSummaryEmailRootSSR
