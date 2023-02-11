import dayjs from 'dayjs'
import React from 'react'
import {MenuPosition} from '../../../hooks/useCoords'
import useRefreshInterval from '../../../hooks/useRefreshInterval'
import useTooltip from '../../../hooks/useTooltip'
import {humanReadableCountdown} from '../../../utils/date/relativeDate'
import {TeamPromptBadge} from '../TeamPromptBadge'

interface Props {
  meetingEndTime: string
}

export const TimeLeftBadge = (props: Props) => {
  const {meetingEndTime} = props

  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER
  )
  useRefreshInterval(1000)
  const meetingEndTimeDate = new Date(meetingEndTime)
  const fromNow = humanReadableCountdown(meetingEndTime)
  if (!fromNow) return null
  const endTime = dayjs(meetingEndTimeDate)

  return (
    <>
      <TeamPromptBadge onMouseEnter={openTooltip} onMouseLeave={closeTooltip} ref={originRef}>
        {fromNow} left
      </TeamPromptBadge>
      {tooltipPortal(`Restarts on ${endTime.format('MMM D, YYYY')} at ${endTime.format('h:mm A')}`)}
    </>
  )
}
