import {NewMeetingSummary_viewer} from '__generated__/NewMeetingSummary_viewer.graphql'
import React from 'react'
import Helmet from 'react-helmet'
import {createFragmentContainer, graphql} from 'react-relay'
import ui from 'universal/styles/ui'
import {MEETING_SUMMARY_LABEL} from 'universal/utils/constants'
import makeHref from 'universal/utils/makeHref'
import {meetingTypeToLabel} from 'universal/utils/meetings/lookups'
import {demoTeamId} from 'universal/modules/demo/initDB'
import NewMeetingSummaryEmail from 'universal/modules/email/components/SummaryEmail/NewMeetingSummaryEmail'

interface Props {
  viewer: NewMeetingSummary_viewer
  urlAction?: 'csv' | undefined
}

const NewMeetingSummary = (props: Props) => {
  const {
    urlAction,
    viewer: {newMeeting}
  } = props
  const {
    meetingNumber,
    meetingType,
    team: {id: teamId, name: teamName}
  } = newMeeting
  const meetingLabel = meetingTypeToLabel[meetingType]
  const title = `${meetingLabel} Meeting ${MEETING_SUMMARY_LABEL} | ${teamName} ${meetingNumber}`
  const meetingUrl = makeHref(`/meeting/${teamId}`)
  const teamDashUrl = `/team/${teamId}`
  return (
    <div style={{backgroundColor: ui.emailBackgroundColor, minHeight: '100vh'}}>
      <Helmet title={title} />
      <NewMeetingSummaryEmail
        urlAction={urlAction}
        isDemo={teamId === demoTeamId}
        meeting={newMeeting}
        referrer='meeting'
        meetingUrl={meetingUrl}
        teamDashUrl={teamDashUrl}
      />
    </div>
  )
}

// Grab everything we need here since SummaryEmail is shared by the server
export default createFragmentContainer(
  NewMeetingSummary,
  graphql`
    fragment NewMeetingSummary_viewer on User {
      newMeeting(meetingId: $meetingId) {
        id
        createdAt
        meetingMembers {
          id
          isCheckedIn
          user {
            rasterPicture
            preferredName
          }
          ... on RetrospectiveMeetingMember {
            tasks {
              id
              content
              status
              tags
            }
          }
        }
        meetingNumber
        meetingType
        team {
          id
          name
        }
        ... on RetrospectiveMeeting {
          reflectionGroups(sortBy: voteCount) {
            id
            title
            voteCount
            reflections {
              id
              content
              sortOrder
              phaseItem {
                question
              }
            }
          }
        }
      }
    }
  `
)
