import React from 'react'
import useMenu from '../hooks/useMenu'
import {MenuPosition} from '../hooks/useCoords'
import styled from '@emotion/styled'
import DropdownMenuToggle from './DropdownMenuToggle'
import ms from 'ms'
import Icon from './Icon'
import {shortDays, shortMonths} from '../utils/makeDateString'
import DayPicker, {DayModifiers} from 'react-day-picker'
import '../styles/daypicker.css'
import {PALETTE} from '../styles/paletteV3'
import roundDateToNearestHalfHour from '../utils/roundDateToNearestHalfHour'

interface Props {
  endTime: Date
  setEndTime: (date: Date) => void
}

const Toggle = styled(DropdownMenuToggle)({
  fontSize: 14,
  padding: '4px 0 4px 8px',
  minWidth: 160
})

const StyledIcon = styled(Icon)({
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
  const {menuPortal, togglePortal, menuProps: endTimeMenuProps, originRef} = useMenu<
    HTMLDivElement
  >(MenuPosition.LOWER_LEFT, {
    id: 'StageTimerEndTimePicker',
    parentId: 'StageTimerModal',
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
      <StyledIcon>event</StyledIcon>
      <Toggle defaultText={dayStr} onClick={togglePortal} ref={originRef} flat size='small' />
      {menuPortal(
        <DayPicker
          disabledDays={{before: now}}
          fromMonth={endTime}
          initialMonth={endTime}
          onDayClick={handleDayClick}
          selectedDays={endTime}
          toMonth={NEXT_YEAR}
        />
      )}
    </>
  )
}

export default StageTimerModalEndTimeDate
