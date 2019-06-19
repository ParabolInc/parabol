import React from 'react'
import useMenu from 'universal/hooks/useMenu'
import {MenuPosition} from 'universal/hooks/useCoords'
import styled from 'react-emotion'
import DropdownMenuToggle from 'universal/components/DropdownMenuToggle'
import Icon from 'universal/components/Icon'
import 'universal/styles/daypicker.css'
import formatTime from 'universal/utils/formatTime'
import StageTimerHourPicker from 'universal/components/StageTimerHourPicker'

interface Props {
  endTime: Date
  setEndTime: (date: Date) => void
}

const Toggle = styled(DropdownMenuToggle)({
  fontSize: 14,
  padding: 8,
  minWidth: 160
})

const StageTimerModalEndTimeHour = (props: Props) => {
  const {endTime, setEndTime} = props
  const timeStr = formatTime(endTime)
  const {menuPortal, togglePortal, menuProps, originRef} = useMenu(MenuPosition.LOWER_LEFT, {
    id: 'StageTimerEndTimePicker',
    parentId: 'StageTimerModal',
    isDropdown: true
  })

  const handleHourPick = (time: number) => {
    const nextEndTime = new Date(endTime)
    const nextDate = new Date(time)
    nextEndTime.setHours(nextDate.getUTCHours())
    nextEndTime.setMinutes(nextDate.getUTCMinutes())
    setEndTime(nextEndTime)
    menuProps.closePortal()
  }

  return (
    <>
      <Icon>event</Icon>
      <Toggle defaultText={timeStr} onClick={togglePortal} innerRef={originRef} />
      {menuPortal(
        <StageTimerHourPicker endTime={endTime} menuProps={menuProps} onClick={handleHourPick} />
      )}
    </>
  )
}

export default StageTimerModalEndTimeHour
