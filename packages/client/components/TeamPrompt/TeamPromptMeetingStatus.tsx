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
        meetingSeries {
          id
          activeMeetings {
            id
            createdAt
            scheduledEndTime
          }
        }
      }
    `,
    meetingRef
  )
  const {endedAt, scheduledEndTime, meetingSeries} = meeting
  const isMeetingEnded = !!endedAt
  const isRecurring = !!meetingSeries
  const hasActiveMeetings = isRecurring && meetingSeries.activeMeetings?.length > 0
  const closestActiveMeeting = hasActiveMeetings ? meetingSeries.activeMeetings[0] : null

  if (isMeetingEnded) {
    return <TeamPromptEndedBadge closestActiveMeetingId={closestActiveMeeting?.id} />
  }

  if (scheduledEndTime) {
    return <TimeLeftBadge meetingEndTime={scheduledEndTime} />
  }

  return null
}
