import React, {useState} from 'react'
import dayjs, {Dayjs} from 'dayjs'
import {DemoContainer} from '@mui/x-date-pickers/internals/demo'
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider'
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs'
import {DateTimePicker as MuiDateTimePicker} from '@mui/x-date-pickers/DateTimePicker'

const DateTimePicker = () => {
  const startOfNextHour = dayjs().add(1, 'hour').startOf('hour')
  const endOfNextHour = dayjs().add(2, 'hour').startOf('hour')

  const [startValue, setStartValue] = useState<Dayjs | null>(startOfNextHour)
  const [endValue, setEndValue] = useState<Dayjs | null>(endOfNextHour)

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className='flex justify-between'>
        <DemoContainer components={['DateTimePicker', 'DateTimePicker']}>
          <MuiDateTimePicker
            label='Meeting Start Time'
            value={startValue}
            onChange={(newValue) => setStartValue(newValue)}
          />
        </DemoContainer>
        <DemoContainer components={['DateTimePicker', 'DateTimePicker']}>
          <MuiDateTimePicker
            label='Meeting End Time'
            value={endValue}
            onChange={(newValue) => setEndValue(newValue)}
          />
        </DemoContainer>
      </div>
    </LocalizationProvider>
  )
}

export default DateTimePicker
