import React from 'react'
import {Environment} from 'relay-runtime'
import {QueryRenderer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import MeetingSummaryEmail from '../../email/components/SummaryEmail/MeetingSummaryEmail/MeetingSummaryEmail'
import makeAppLink from '../../../../server/utils/makeAppLink'
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
        const {team} = newMeeting
        const {id: teamId} = team
        const params = {
          utm_source: 'summary_email',
          utm_medium: 'email',
          utm_campaign: 'after_meeting'
        }
        const options = {params}
        const referrerUrl = makeAppLink(`new-summary/${meetingId}`, options)
        const meetingUrl = makeAppLink(`meet/${meetingId}`, options)
        const teamDashUrl = makeAppLink(`team/${teamId}`, options)
        const emailCSVUrl = makeAppLink(`new-summary/${meetingId}/csv`, options)
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
