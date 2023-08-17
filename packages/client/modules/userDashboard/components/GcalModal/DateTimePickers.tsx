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

const DateTimePickers = (props: Props) => {
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

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation()
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className='w flex justify-between space-x-4 pt-3'>
        <div className={'w-1/2'} onMouseDown={handleMouseDown}>
          <MuiDateTimePicker
            label={`Meeting Start Time (${timeZoneShort})`}
            value={startValue}
            closeOnSelect={false}
            disablePast
            ampm={false}
            sx={{width: '100%'}}
            minDate={dayjs().add(1, 'hour')}
            onChange={handleChangeStart}
            format='MMMM D, YYYY, HH:mm'
          />
        </div>
        <div className={'w-[300px]'} onMouseDown={handleMouseDown}>
          <MuiDateTimePicker
            sx={{width: '100%'}}
            label={`Meeting End Time (${timeZoneShort})`}
            value={endValue}
            disablePast
            ampm={false}
            minDate={startValue.add(1, 'hour')}
            onChange={handleChangeEnd}
            format='MMMM D, YYYY, HH:mm'
          />
        </div>
      </div>
    </LocalizationProvider>
  )
}

export default DateTimePickers
