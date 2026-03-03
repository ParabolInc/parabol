import styled from '@emotion/styled'
import ms from 'ms'
import {useEffect, useState} from 'react'
import {PALETTE} from '../styles/paletteV3'
import absoluteDate from '../utils/date/absoluteDate'
import relativeDate from '../utils/date/relativeDate'
import SimpleTooltip from './SimpleTooltip'

const StyledSpan = styled('span')({
  color: PALETTE.SLATE_600,
  fontSize: 11,
  lineHeight: '16px'
})

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
    <StyledSpan>
      <SimpleTooltip text={absoluteDate(createdAt)}>{fromNow}</SimpleTooltip>
    </StyledSpan>
  )
}

export default TimelineEventDate
