import styled from '@emotion/styled'
import {Event} from '@mui/icons-material'
import ms from 'ms'
import React from 'react'
import {DayModifiers, DayPicker} from 'react-day-picker'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {PALETTE} from '../styles/paletteV3'
import {shortDays, shortMonths} from '../utils/makeDateString'
import roundDateToNearestHalfHour from '../utils/roundDateToNearestHalfHour'
import DropdownMenuToggle from './DropdownMenuToggle'

interface Props {
  endTime: Date
  setEndTime: (date: Date) => void
}

const Toggle = styled(DropdownMenuToggle)({
  fontSize: 14,
  padding: '4px 0 4px 8px',
  minWidth: 160
})

const StyledIcon = styled(Event)({
  color: PALETTE.SLATE_600
})

const NEXT_YEAR = new Date(Date.now() + ms('1y'))

const formatDay = (date: Date) => {
  const month = date.getMonth()
  const day = date.getDate()
  const monthStr = shortMonths[month]
  const name = shortDays[date.getDay()]
  return `${name}, ${monthStr} ${day}`
}

const StageTimerModalEndTimeDate = (props: Props) => {
  const {endTime, setEndTime} = props
  const dayStr = formatDay(endTime)

  const now = new Date()
  const {
    menuPortal,
    togglePortal,
    menuProps: endTimeMenuProps,
    originRef
  } = useMenu<HTMLDivElement>(MenuPosition.LOWER_LEFT, {
    id: 'StageTimerEndTimePicker',
    isDropdown: true
  })
  const handleDayClick = (day: Date, {disabled, selected}: DayModifiers) => {
    if (disabled || selected) return
    const nextDate = new Date(endTime)
    nextDate.setFullYear(day.getFullYear(), day.getMonth(), day.getDate())
    const now = new Date()
    if (nextDate < now) {
      const roundedDate = roundDateToNearestHalfHour(now)
      nextDate.setHours(roundedDate.getHours() + 1, roundedDate.getMinutes())
    }
    setEndTime(nextDate)
    endTimeMenuProps.closePortal()
  }

  return (
    <>
      <StyledIcon />
      <Toggle defaultText={dayStr} onClick={togglePortal} ref={originRef} flat size='small' />
      {menuPortal(
        <DayPicker
          disabled={{before: now}}
          fromMonth={now}
          defaultMonth={endTime}
          onDayClick={handleDayClick}
          selected={endTime}
          toMonth={NEXT_YEAR}
        />
      )}
    </>
  )
}

export default StageTimerModalEndTimeDate
