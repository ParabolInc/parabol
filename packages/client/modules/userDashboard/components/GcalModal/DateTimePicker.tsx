import React from 'react'
import dayjs, {Dayjs} from 'dayjs'
import {DemoContainer} from '@mui/x-date-pickers/internals/demo'
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
    }
  }

  const handleChangeEnd = (newValue: Dayjs | null) => {
    if (newValue) {
      setEnd(newValue)
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className='flex justify-between'>
        <DemoContainer components={['DateTimePicker', 'DateTimePicker']}>
          <MuiDateTimePicker
            label={`Meeting Start Time (${timeZoneShort})`}
            value={startValue}
            closeOnSelect={false}
            disablePast
            minDate={dayjs().add(1, 'hour')}
            onChange={handleChangeStart}
            format='LLL'
            slotProps={{
              inputAdornment: {
                style: {
                  display: 'none'
                }
              }
            }}
          />
        </DemoContainer>
        <DemoContainer components={['DateTimePicker', 'DateTimePicker']}>
          <MuiDateTimePicker
            label={`Meeting End Time (${timeZoneShort})`}
            value={endValue}
            disablePast
            minDate={dayjs().add(1, 'hour')}
            onChange={handleChangeEnd}
            format='LLL'
            slotProps={{
              inputAdornment: {
                style: {
                  display: 'none'
                }
              }
            }}
          />
        </DemoContainer>
      </div>
    </LocalizationProvider>
  )
}

export default DateTimePicker
