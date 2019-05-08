import React from 'react'
import Oy from 'oy-vey'
import makeDateString from 'universal/utils/makeDateString'
import {MEETING_SUMMARY_LABEL} from 'universal/utils/constants'
import NewMeetingSummaryEmail from 'universal/modules/email/components/SummaryEmail/NewMeetingSummaryEmail'
import makeAppLink from 'server/utils/makeAppLink'
import {meetingTypeToLabel, meetingTypeToSlug} from 'universal/utils/meetings/lookups'
import {headCSS} from 'universal/styles/email'
import ssrGraphQL from 'server/graphql/ssrGraphQL'
import {GQLContext} from 'server/graphql/graphql'

interface Props {
  meetingId: string
  context: GQLContext
}

const newMeetingSummaryEmailCreator = async (props: Props) => {
  const {meetingId, context} = props
  const query = require('__generated__/NewMeetingSummaryRootQuery.graphql')
  const {
    params: {id: documentId}
  } = query.default
  const res = await ssrGraphQL(documentId, {meetingId}, context)
  const {viewer} = res
  const {newMeeting} = viewer
  const {meetingType, team, endedAt} = newMeeting
  const {id: teamId, name: teamName} = team
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
        meeting={newMeeting}
        meetingUrl={meetingUrl}
        referrer='email'
        referrerUrl={referrerUrl}
        teamDashUrl={teamDashUrl}
      />,
      {
        headCSS,
        title: subject,
        previewText: subject
      }
    )
  }
}

export default newMeetingSummaryEmailCreator
