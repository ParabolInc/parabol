import ms from 'ms'
import {useEffect, useState} from 'react'
import {Tooltip} from '../ui/Tooltip/Tooltip'
import {TooltipContent} from '../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../ui/Tooltip/TooltipTrigger'
import absoluteDate from '../utils/date/absoluteDate'
import relativeDate from '../utils/date/relativeDate'

interface Props {
  createdAt: string | Date
}

const TimelineEventDate = (props: Props) => {
  const {createdAt} = props
  const [fromNow, setFromNow] = useState(() => relativeDate(createdAt))

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const next = relativeDate(createdAt)
      setFromNow((prev) => (prev === next ? prev : next))
    }, ms('1m'))
    return () => {
      clearInterval(intervalId)
    }
  }, [createdAt])

  return (
    <span className='text-[11px] text-fg-secondary leading-4'>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className='cursor-pointer'>{fromNow}</span>
        </TooltipTrigger>
        <TooltipContent side='bottom'>{absoluteDate(createdAt)}</TooltipContent>
      </Tooltip>
    </span>
  )
}

export default TimelineEventDate
