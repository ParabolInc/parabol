import React from 'react'
import makeDateString from '../../../../utils/makeDateString'
import {MEETING_SUMMARY_LABEL} from '../../../../utils/constants'
import {meetingTypeToLabel} from '../../../../utils/meetings/lookups'
import {headCSS} from '../../../../styles/email'
import {GQLContext} from '../../../../../server/graphql/graphql'
import emailTemplate from './MeetingSummaryEmail/EmailTemplate'
import {PALETTE_BACKGROUND_MAIN} from './MeetingSummaryEmail/constants'
import MeetingSummaryEmailRootSSR from '../../../summary/components/MeetingSummaryEmailRootSSR'
import renderSSRElement from '../../../../../server/email/renderSSRElement'
import ServerEnvironment from '../../../../../server/email/ServerEnvironment'

interface Props {
  meetingId: string
  context: GQLContext
}

const newMeetingSummaryEmailCreator = async (props: Props) => {
  const {meetingId, context} = props
  const {dataLoader} = context
  const environment = new ServerEnvironment(context)
  const bodyContent = await renderSSRElement(
    <MeetingSummaryEmailRootSSR environment={environment} meetingId={meetingId} />,
    environment
  )
  const newMeeting = await dataLoader.get('newMeetings').load(meetingId)
  const team = await dataLoader.get('teams').load(newMeeting.teamId)
  const {meetingType, endedAt} = newMeeting
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
