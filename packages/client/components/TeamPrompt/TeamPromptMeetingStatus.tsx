import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {useFragment} from 'react-relay'
import {RRule} from 'rrule'
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
          recurrenceRule
          cancelledAt
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
  const isRecurring = !!meetingSeries && !meetingSeries.cancelledAt
  const hasActiveMeetings = isRecurring && meetingSeries.activeMeetings?.length > 0
  const closestActiveMeetingId = hasActiveMeetings ? meetingSeries.activeMeetings[0]!.id : null
  const nextMeetingDate = useMemo(() => {
    if (!isRecurring) return null
    const recurrenceRule = meetingSeries.recurrenceRule!
    const now = new Date()
    return RRule.fromString(recurrenceRule).after(now)
  }, [meetingSeries])

  if (!isMeetingEnded) {
    if (scheduledEndTime) {
      return <TimeLeftBadge meetingEndTime={scheduledEndTime} />
    }

    return null
  }

  if (closestActiveMeetingId) {
    // if there's an active meeting, show the link to it
    return <TeamPromptEndedBadge closestActiveMeetingId={closestActiveMeetingId} />
  }

  if (nextMeetingDate) {
    // if there's no active meeting, show when the next one starts
    return <TeamPromptEndedBadge nextMeetingDate={nextMeetingDate} />
  }

  return <TeamPromptEndedBadge />
}
