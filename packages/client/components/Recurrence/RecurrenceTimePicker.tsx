import dayjs, {Dayjs} from 'dayjs'
import ms from 'ms'
import {MenuProps} from '../../hooks/useMenu'
import Menu from '../Menu'
import MenuItem from '../MenuItem'

interface Props {
  menuProps: MenuProps
  onClick: (n: Dayjs) => void
}

const OPTIONS = [...Array(96).keys()].map((n) => n * ms('15m'))
// by default, we'll suggest 6:00 AM
const DEFAULT_MEETING_START_TIME_IDX = OPTIONS.findIndex((n) => n === ms('6h'))

export const RecurrenceTimePicker = (props: Props) => {
  const {menuProps, onClick} = props
  const {timeZone} = Intl.DateTimeFormat().resolvedOptions()

  return (
    <Menu
      {...menuProps}
      ariaLabel={'Select the time when a recurring meeting will be created'}
      defaultActiveIdx={DEFAULT_MEETING_START_TIME_IDX}
    >
      {OPTIONS.map((n, idx) => {
        const proposedTime = dayjs.tz(dayjs().add(1, 'day').startOf('day').add(n, 'ms'), timeZone)

        return (
          <MenuItem
            key={idx}
            label={proposedTime.format('h:mm A')}
            onClick={() => onClick(proposedTime)}
          />
        )
      })}
    </Menu>
  )
}
