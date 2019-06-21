import React from 'react'
import useMenu from 'universal/hooks/useMenu'
import {MenuPosition} from 'universal/hooks/useCoords'
import styled from 'react-emotion'
import DropdownMenuToggle from 'universal/components/DropdownMenuToggle'
import 'universal/styles/daypicker.css'
import formatTime from 'universal/utils/date/formatTime'
import StageTimerHourPicker from 'universal/components/StageTimerHourPicker'

interface Props {
  endTime: Date
  setEndTime: (date: Date) => void
}

const Toggle = styled(DropdownMenuToggle)({
  fontSize: 14,
  padding: '4px 0 4px 32px',
  minWidth: 160
})

const StageTimerModalEndTimeHour = (props: Props) => {
  const {endTime, setEndTime} = props
  const timeStr = formatTime(endTime)
  const {menuPortal, togglePortal, menuProps, originRef, portalStatus} = useMenu(
    MenuPosition.LOWER_LEFT,
    {
      id: 'StageTimerEndTimePicker',
      parentId: 'StageTimerModal',
      isDropdown: true
    }
  )

  const handleHourPick = (nextEndTime: Date) => {
    setEndTime(nextEndTime)
    menuProps.closePortal()
  }

  return (
    <>
      <Toggle defaultText={timeStr} onClick={togglePortal} innerRef={originRef} flat size='small' />
      {menuPortal(
        <StageTimerHourPicker endTime={endTime} menuProps={menuProps} onClick={handleHourPick} />
      )}
    </>
  )
}

export default StageTimerModalEndTimeHour
