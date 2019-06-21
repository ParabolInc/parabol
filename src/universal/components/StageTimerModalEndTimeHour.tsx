import React from 'react'
import useMenu from 'universal/hooks/useMenu'
import {MenuPosition} from 'universal/hooks/useCoords'
import styled from 'react-emotion'
import DropdownMenuToggle from 'universal/components/DropdownMenuToggle'
import Icon from 'universal/components/Icon'
import 'universal/styles/daypicker.css'
import formatTime from 'universal/utils/formatTime'
import StageTimerHourPicker from 'universal/components/StageTimerHourPicker'
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
      <StyledIcon>event</StyledIcon>
      <Toggle defaultText={timeStr} onClick={togglePortal} innerRef={originRef} flat size='small' />
      {menuPortal(
        <StageTimerHourPicker endTime={endTime} menuProps={menuProps} onClick={handleHourPick} />
      )}
    </>
  )
}

export default StageTimerModalEndTimeHour
