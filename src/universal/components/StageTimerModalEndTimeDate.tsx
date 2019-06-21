import React from 'react'
import useMenu from 'universal/hooks/useMenu'
import {MenuPosition} from 'universal/hooks/useCoords'
import styled from 'react-emotion'
import DropdownMenuToggle from 'universal/components/DropdownMenuToggle'
import ms from 'ms'
import Icon from 'universal/components/Icon'
import {shortDays, shortMonths} from 'universal/utils/makeDateString'
import DayPicker, {DayModifiers} from 'react-day-picker'
import 'universal/styles/daypicker.css'
import {PALETTE} from 'universal/styles/paletteV2'

interface Props {
  endTime: Date
  setEndTime: (date: Date) => void
}

const Toggle = styled(DropdownMenuToggle)({
  fontSize: 14,
  padding: '8px 0 8px 8px',
  minWidth: 160
})

const StyledIcon = styled(Icon)({
  color: PALETTE.TEXT.LIGHT
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
  const {menuPortal, togglePortal, menuProps: endTimeMenuProps, originRef} = useMenu(
    MenuPosition.LOWER_LEFT,
    {
      id: 'StageTimerEndTimePicker',
      parentId: 'StageTimerModal',
      isDropdown: true
    }
  )
  const handleDayClick = (day: Date, {disabled, selected}: DayModifiers) => {
    if (disabled || selected) return
    const nextDate = new Date(endTime)
    nextDate.setFullYear(day.getFullYear(), day.getMonth(), day.getDate())
    setEndTime(nextDate)
    endTimeMenuProps.closePortal()
  }

  return (
    <>
      <StyledIcon>event</StyledIcon>
      <Toggle defaultText={dayStr} onClick={togglePortal} innerRef={originRef} flat size='small' />
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
