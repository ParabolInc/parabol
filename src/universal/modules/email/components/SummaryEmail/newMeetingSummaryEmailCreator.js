import React from 'react'
import Oy from 'oy-vey'
import makeDateString from 'universal/utils/makeDateString'
import {MEETING_SUMMARY_LABEL} from 'universal/utils/constants'
import NewMeetingSummaryEmail from 'universal/modules/email/components/SummaryEmail/NewMeetingSummaryEmail'
import makeAppLink from 'server/utils/makeAppLink'
import {meetingTypeToLabel, meetingTypeToSlug} from 'universal/utils/meetings/lookups'

const newMeetingSummaryEmailCreator = (props) => {
  const {meeting} = props
  const {
    id: meetingId,
    meetingType,
    team: {id: teamId, name: teamName},
    endedAt
  } = meeting
  const dateStr = makeDateString(endedAt)
  const meetingLabel = meetingTypeToLabel[meetingType]
  const meetingSlug = meetingTypeToSlug[meetingType]
  const subject = `${teamName} ${dateStr} ${meetingLabel} Meeting ${MEETING_SUMMARY_LABEL}`
  const referrerUrl = makeAppLink(`new-summary/${meetingId}`)
  const meetingUrl = makeAppLink(`${meetingSlug}/${teamId}`)
  const teamDashUrl = makeAppLink(`team/${teamId}`)
  const emailCSVLUrl = makeAppLink(`new-summary/${meetingId}/csv`)
  return {
    subject,
    body: `Hello, ${teamName}. Here is your ${meetingLabel} meeting summary`,
    html: Oy.renderTemplate(
      <NewMeetingSummaryEmail
        emailCSVLUrl={emailCSVLUrl}
        meeting={meeting}
        meetingUrl={meetingUrl}
        referrer='email'
        referrerUrl={referrerUrl}
        teamDashUrl={teamDashUrl}
      />,
      {
        title: subject,
        previewText: subject
      }
    )
  }
}

export default newMeetingSummaryEmailCreator
