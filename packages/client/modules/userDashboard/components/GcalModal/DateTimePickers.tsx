import dayjs, {type Dayjs} from 'dayjs'
import type * as React from 'react'
import GcalDateTimeRow from './GcalDateTimeRow'

type Props = {
  startValue: Dayjs
  endValue: Dayjs
  handleChangeStart: (date: Dayjs | null, time: Dayjs | null) => void
  handleChangeEnd: (date: Dayjs | null, time: Dayjs | null) => void
}

const DateTimePickers = (props: Props) => {
  const {startValue, endValue, handleChangeStart, handleChangeEnd} = props
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const dateTimeString = new Date().toLocaleString('en-US', {
    timeZone,
    timeZoneName: 'short'
  })
  const timeZoneShort = dateTimeString.split(' ').pop()

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // prevent gcal modal from closing when clicking datetime pickers
    e.stopPropagation()
  }

  return (
    <div className='flex flex-col justify-between space-y-4 pt-3' onMouseDown={handleMouseDown}>
      <GcalDateTimeRow
        label={`Meeting starts (${timeZoneShort})`}
        value={startValue}
        onChange={(next) => {
          const nextValue = dayjs(next)
          handleChangeStart(nextValue, nextValue)
        }}
      />
      <GcalDateTimeRow
        label={`Meeting ends (${timeZoneShort})`}
        value={endValue}
        onChange={(next) => {
          const nextValue = dayjs(next)
          handleChangeEnd(nextValue, nextValue)
        }}
      />
    </div>
  )
}

export default DateTimePickers
