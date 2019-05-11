import React from 'react'
import makeDateString from 'universal/utils/makeDateString'
import {MEETING_SUMMARY_LABEL} from 'universal/utils/constants'
import {meetingTypeToLabel} from 'universal/utils/meetings/lookups'
import {headCSS} from 'universal/styles/email'
import {GQLContext} from 'server/graphql/graphql'
import emailTemplate from 'universal/modules/email/components/SummaryEmail/MeetingSummaryEmail/EmailTemplate'
import {PALETTE_BACKGROUND_MAIN} from 'universal/modules/email/components/SummaryEmail/MeetingSummaryEmail/constants'
import MeetingSummaryEmailRootSSR from 'universal/modules/summary/components/MeetingSummaryEmailRootSSR'
import getSSREnvironment from 'server/email/getSSREnvironment'
import renderSSRElement from 'server/email/renderSSRElement'

interface Props {
  meetingId: string
  context: GQLContext
}

const newMeetingSummaryEmailCreator = async (props: Props) => {
  const {meetingId, context} = props
  const {environment, getData} = getSSREnvironment(context)
  const {res, bodyContent} = await renderSSRElement(
    <MeetingSummaryEmailRootSSR environment={environment} meetingId={meetingId} />,
    getData
  )
  const {data} = res
  const {viewer} = data
  const {newMeeting} = viewer
  const {meetingType, team, endedAt} = newMeeting
  const {name: teamName} = team
  const dateStr = makeDateString(endedAt)
  const meetingLabel = meetingTypeToLabel[meetingType]
  const subject = `${teamName} ${dateStr} ${meetingLabel} Meeting ${MEETING_SUMMARY_LABEL}`
  const html = emailTemplate({
    bodyContent,
    headCSS,
    title: subject,
    previewText: subject,
    bgColor: PALETTE_BACKGROUND_MAIN
  })

  return {
    subject,
    body: `Hello, ${teamName}. Here is your ${meetingLabel} meeting summary`,
    html
  }
}

export default newMeetingSummaryEmailCreator
