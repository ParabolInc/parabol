import {DatePicker, TimePicker} from '@mui/x-date-pickers'
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs'
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider'
import {Dayjs} from 'dayjs'
import * as React from 'react'
import {PALETTE} from '../../../../styles/paletteV3'

const customStyles = {
  width: '100%',
  '& .MuiOutlinedInput-root': {
    '&:hover .MuiOutlinedInput-notchedOutline, &.Mui-focused .MuiOutlinedInput-notchedOutline, &.focus-within .MuiOutlinedInput-notchedOutline':
      {
        borderColor: PALETTE.SLATE_400,
        borderWidth: '1px'
      },
    '&.Mui-focused': {
      outline: 'none'
    }
  },
  '& label': {
    color: PALETTE.SLATE_600,
    '&.Mui-focused': {
      color: PALETTE.SLATE_600
    }
  },
  '& .MuiPickersDay-dayWithMargin': {
    '&:hover, &:focus': {
      borderColor: PALETTE.SLATE_400,
      outline: 'none'
    }
  },
  '& .MuiPickersCalendarHeader-switchHeader button:focus': {
    outline: 'none',
    color: PALETTE.SLATE_600
  }
}

const timePickerStyles = {
  ...customStyles,
  width: '50%'
}

type Props = {
  startValue: Dayjs
  endValue: Dayjs
  handleChangeStart: (date: Dayjs | null, time: Dayjs | null) => void
  handleChangeEnd: (date: Dayjs | null, time: Dayjs | null) => void
}

const DateTimePickers = (props: Props) => {
  const {startValue, endValue, handleChangeStart, handleChangeEnd} = props
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const date = new Date()
  const dateTimeString = date.toLocaleString('en-US', {timeZone: timeZone, timeZoneName: 'short'})
  const timeZoneShort = dateTimeString.split(' ').pop()

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // prevent gcal modal from closing when clicking datetime pickers
    e.stopPropagation()
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className='w flex flex-col justify-between space-y-6 pt-3'>
        <div className='flex space-x-2' onMouseDown={handleMouseDown}>
          <DatePicker
            label={`Meeting Start Date`}
            value={startValue}
            onChange={(date) => handleChangeStart(date, startValue)}
            format='MMMM D, YYYY'
            sx={customStyles}
          />
          <TimePicker
            label={`Start Time (${timeZoneShort})`}
            value={startValue}
            onChange={(time) => handleChangeStart(startValue, time)}
            sx={timePickerStyles}
          />
        </div>
        <div className='flex space-x-2' onMouseDown={handleMouseDown}>
          <DatePicker
            label={`Meeting End Date`}
            value={endValue}
            onChange={(date) => handleChangeEnd(date, endValue)}
            format='MMMM D, YYYY'
            sx={customStyles}
          />
          <TimePicker
            label={`End Time (${timeZoneShort})`}
            value={endValue}
            onChange={(time) => handleChangeEnd(endValue, time)}
            sx={timePickerStyles}
          />
        </div>
      </div>
    </LocalizationProvider>
  )
}

export default DateTimePickers
