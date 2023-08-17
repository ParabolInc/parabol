import React from 'react'
import dayjs, {Dayjs} from 'dayjs'
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider'
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs'
import {DateTimePicker as MuiDateTimePicker} from '@mui/x-date-pickers/DateTimePicker'

type Props = {
  startValue: Dayjs
  setStart: (newValue: Dayjs) => void
  endValue: Dayjs
  setEnd: (newValue: Dayjs) => void
}

const DateTimePicker = (props: Props) => {
  const {startValue, setStart, endValue, setEnd} = props
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const date = new Date()
  const dateTimeString = date.toLocaleString('en-US', {timeZone: timeZone, timeZoneName: 'short'})
  const timeZoneShort = dateTimeString.split(' ').pop()

  const handleChangeStart = (newValue: Dayjs | null) => {
    if (newValue) {
      setStart(newValue)
      if (endValue.isBefore(newValue)) {
        setEnd(newValue.add(1, 'hour'))
      }
    }
  }

  const handleChangeEnd = (newValue: Dayjs | null) => {
    if (newValue) {
      setEnd(newValue)
    }
  }

  const handleMouseDown = (e) => {
    e.stopPropagation()
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className='z-50 flex justify-between space-x-4 pt-3'>
        <div className={'w-1/2'} onMouseDown={handleMouseDown}>
          <MuiDateTimePicker
            label={`Meeting Start Time (${timeZoneShort})`}
            value={startValue}
            closeOnSelect={false}
            disablePast
            ampm={false}
            minDate={dayjs().add(1, 'hour')}
            onChange={handleChangeStart}
            format='LLL'
          />
        </div>
        <div className={'w-1/2'} onMouseDown={handleMouseDown}>
          <MuiDateTimePicker
            label={`Meeting End Time (${timeZoneShort})`}
            value={endValue}
            disablePast
            ampm={false}
            minDate={startValue.add(1, 'hour')}
            onChange={handleChangeEnd}
            format='LLL'
          />
        </div>
      </div>
    </LocalizationProvider>
  )
}

export default DateTimePicker
