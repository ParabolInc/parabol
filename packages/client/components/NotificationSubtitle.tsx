import type {ReactNode} from 'react'
import relativeDate from '../utils/date/relativeDate'

interface Props {
  timestamp: string
  children?: ReactNode
}

const NotificationSubtitle = (props: Props) => {
  const {children, timestamp} = props
  const relativeTimestamp = relativeDate(timestamp)
  return (
    <div className='flex text-sm'>
      <div className='text-fg-secondary'>{relativeTimestamp}</div>
      {children}
    </div>
  )
}

export default NotificationSubtitle
