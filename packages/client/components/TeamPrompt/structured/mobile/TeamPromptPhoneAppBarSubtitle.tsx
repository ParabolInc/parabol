import {Fragment} from 'react'
import useMeetingStatusText from './useMeetingStatusText'

interface Props {
  dateLabel: string | null
  endedAt: string | null | undefined
  scheduledEndTime: string | null | undefined
}

const TeamPromptPhoneAppBarSubtitle = (props: Props) => {
  const {dateLabel, endedAt, scheduledEndTime} = props
  const statusText = useMeetingStatusText(endedAt, scheduledEndTime)
  const parts = [dateLabel, statusText].filter((part): part is string => !!part)
  if (parts.length === 0) return null
  return (
    <div className='truncate text-fg-secondary text-xs'>
      {parts.map((part, idx) => (
        <Fragment key={part}>
          {idx > 0 && <span aria-hidden>{' · '}</span>}
          {part}
        </Fragment>
      ))}
    </div>
  )
}

export default TeamPromptPhoneAppBarSubtitle
