import styled from '@emotion/styled'
import type {ReactNode} from 'react'
import relativeDate from '../utils/date/relativeDate'

const Row = styled('div')({
  display: 'flex',
  fontSize: 14,
  lineHeight: '20px'
})

const Timestamp = styled('div')({
  color: 'var(--color-fg-secondary)'
})

interface Props {
  timestamp: string
  children?: ReactNode
}

const NotificationSubtitle = (props: Props) => {
  const {children, timestamp} = props
  const relativeTimestamp = relativeDate(timestamp)
  return (
    <Row>
      <Timestamp>{relativeTimestamp}</Timestamp>
      {children}
    </Row>
  )
}

export default NotificationSubtitle
