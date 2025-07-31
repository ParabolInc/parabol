import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {RRule} from 'rrule'
import type {useMeetingSeriesDate_meeting$key} from '../__generated__/useMeetingSeriesDate_meeting.graphql'

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  weekday: 'long',
  timeZoneName: 'short'
})

export const useMeetingSeriesDate = (meetingRef: useMeetingSeriesDate_meeting$key) => {
  const meeting = useFragment(
    graphql`
      fragment useMeetingSeriesDate_meeting on NewMeeting {
        id
        createdAt
        endedAt
        scheduledEndTime
        meetingSeries {
          id
          cancelledAt
          recurrenceRule
        }
      }
    `,
    meetingRef
  )

  const {createdAt, endedAt, scheduledEndTime, meetingSeries} = meeting

  const rrule = meetingSeries && RRule.fromString(meetingSeries.recurrenceRule)
  const now = new Date()
  const nextMeetingDate = rrule?.after(now)
  if (!nextMeetingDate) {
    return {label: null, tooltip: null}
  }

  const shortEndDate =
    scheduledEndTime &&
    new Date(scheduledEndTime).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  const shortStartDate =
    createdAt &&
    new Date(createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })

  const label = endedAt ? `Restarts ${shortEndDate}` : `${shortStartDate} - ${shortEndDate}`
  const tooltip = `${endedAt ? 'Restarts' : 'Ends'} ${timeFormatter.format(nextMeetingDate)}`

  return {label, tooltip}
}
