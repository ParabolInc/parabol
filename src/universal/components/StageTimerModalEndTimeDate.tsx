import React from 'react'
import useMenu from 'universal/hooks/useMenu'
import {MenuPosition} from 'universal/hooks/useCoords'
import styled from 'react-emotion'
import DropdownMenuToggle from 'universal/components/DropdownMenuToggle'
import ms from 'ms'
import Icon from 'universal/components/Icon'
import {days, shortDays, shortMonths} from 'universal/utils/makeDateString'
import DayPicker, {DayModifiers} from 'react-day-picker'
import 'universal/styles/daypicker.css'

interface Props {
  endTime: Date
  setEndTime: (date: Date) => void
}

const Toggle = styled(DropdownMenuToggle)({
  fontSize: 14,
  padding: 8,
  minWidth: 160
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
      <Icon>event</Icon>
      <Toggle defaultText={dayStr} onClick={togglePortal} innerRef={originRef} />
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
