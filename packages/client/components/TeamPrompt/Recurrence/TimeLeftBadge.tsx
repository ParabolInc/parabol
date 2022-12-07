import React from 'react'
import useRefreshInterval from '../../../hooks/useRefreshInterval'
import {humanReadableCountdown} from '../../../utils/date/relativeDate'
import {TeamPromptBadge} from '../TeamPromptBadge'

interface Props {
  meetingEndTime: string
}

export const TimeLeftBadge = (props: Props) => {
  const {meetingEndTime} = props

  useRefreshInterval(1000)
  const fromNow = humanReadableCountdown(meetingEndTime)
  if (!fromNow) return null

  return <TeamPromptBadge>{fromNow}</TeamPromptBadge>
}
