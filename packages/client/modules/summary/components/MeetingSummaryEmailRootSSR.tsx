import React from 'react'
import {Environment} from 'relay-runtime'
import {QueryRenderer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import MeetingSummaryEmail from '../../email/components/SummaryEmail/MeetingSummaryEmail/MeetingSummaryEmail'
import makeAppLink from '../../../../server/utils/makeAppLink'
import {meetingTypeToSlug} from '../../../utils/meetings/lookups'
import {MeetingSummaryEmailRootSSRQuery} from '__generated__/MeetingSummaryEmailRootSSRQuery.graphql'

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
    <QueryRenderer<MeetingSummaryEmailRootSSRQuery>
      environment={environment}
      query={query}
      variables={{meetingId}}
      render={({props}) => {
        if (!props) return null
        const {viewer} = props
        if (!viewer) return null
        const {newMeeting} = viewer
        if (!newMeeting) return null
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
