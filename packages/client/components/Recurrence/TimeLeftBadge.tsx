import dayjs from 'dayjs'
import useTimeLeftLabel from '../../hooks/useTimeLeftLabel'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'
import {TeamPromptBadge} from '../TeamPrompt/TeamPromptBadge'

interface Props {
  meetingEndTime: string
}

export const TimeLeftBadge = (props: Props) => {
  const {meetingEndTime} = props

  const timeLeft = useTimeLeftLabel(meetingEndTime)
  if (!timeLeft) return null
  const endTime = dayjs(new Date(meetingEndTime))

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <TeamPromptBadge>{timeLeft}</TeamPromptBadge>
      </TooltipTrigger>
      <TooltipContent side='bottom'>{`Restarts on ${endTime.format('MMM D, YYYY')} at ${endTime.format('h:mm A')}`}</TooltipContent>
    </Tooltip>
  )
}
