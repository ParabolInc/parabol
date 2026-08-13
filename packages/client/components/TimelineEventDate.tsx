import ms from 'ms'
import {useEffect, useState} from 'react'
import absoluteDate from '../utils/date/absoluteDate'
import relativeDate from '../utils/date/relativeDate'
import SimpleTooltip from './SimpleTooltip'

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
      <SimpleTooltip text={absoluteDate(createdAt)}>{fromNow}</SimpleTooltip>
    </span>
  )
}

export default TimelineEventDate
