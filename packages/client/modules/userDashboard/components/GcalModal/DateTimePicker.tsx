import React from 'react'
import {Dayjs} from 'dayjs'
import {DemoContainer} from '@mui/x-date-pickers/internals/demo'
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider'
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs'
import {DateTimePicker as MuiDateTimePicker} from '@mui/x-date-pickers/DateTimePicker'

type Props = {
  startValue: Dayjs | null
  setStartValue: (newValue: Dayjs | null) => void
  endValue: Dayjs | null
  setEndValue: (newValue: Dayjs | null) => void
}

const DateTimePicker = (props: Props) => {
  const {startValue, setStartValue, endValue, setEndValue} = props
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
