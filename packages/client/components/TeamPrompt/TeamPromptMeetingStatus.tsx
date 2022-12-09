import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {TeamPromptMeetingStatus_meeting$key} from '~/__generated__/TeamPromptMeetingStatus_meeting.graphql'
import {TimeLeftBadge} from './Recurrence/TimeLeftBadge'
import {TeamPromptEndedBadge} from './TeamPromptEndedBadge'

interface Props {
  meetingRef: TeamPromptMeetingStatus_meeting$key
}

export const TeamPromptMeetingStatus = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment TeamPromptMeetingStatus_meeting on TeamPromptMeeting {
        id
        scheduledEndTime
        endedAt
      }
    `,
    meetingRef
  )
  const {endedAt, scheduledEndTime} = meeting
  const isMeetingEnded = !!endedAt

  if (isMeetingEnded) {
    return <TeamPromptEndedBadge />
  }

  if (scheduledEndTime) {
    return <TimeLeftBadge meetingEndTime={scheduledEndTime} />
  }

  return null
}
