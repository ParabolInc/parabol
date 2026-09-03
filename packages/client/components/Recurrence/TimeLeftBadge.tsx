import dayjs from 'dayjs'
import useRefreshInterval from '../../hooks/useRefreshInterval'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'
import {humanReadableCountdown} from '../../utils/date/relativeDate'
import {TeamPromptBadge} from '../TeamPrompt/TeamPromptBadge'

interface Props {
  meetingEndTime: string
}

export const TimeLeftBadge = (props: Props) => {
  const {meetingEndTime} = props

  useRefreshInterval(1000)
  const meetingEndTimeDate = new Date(meetingEndTime)
  const fromNow = humanReadableCountdown(meetingEndTime)
  if (!fromNow) return null
  const endTime = dayjs(meetingEndTimeDate)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <TeamPromptBadge>{fromNow} left</TeamPromptBadge>
      </TooltipTrigger>
      <TooltipContent side='bottom'>{`Restarts on ${endTime.format('MMM D, YYYY')} at ${endTime.format('h:mm A')}`}</TooltipContent>
    </Tooltip>
  )
}
