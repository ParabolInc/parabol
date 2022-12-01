import styled from '@emotion/styled'
import React from 'react'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import '../styles/daypicker.css'
import formatTime from '../utils/date/formatTime'
import DropdownMenuToggle from './DropdownMenuToggle'
import StageTimerHourPicker from './StageTimerHourPicker'

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
  const {menuPortal, togglePortal, menuProps, originRef} = useMenu<HTMLDivElement>(
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
      <Toggle defaultText={timeStr} onClick={togglePortal} ref={originRef} flat size='small' />
      {menuPortal(
        <StageTimerHourPicker endTime={endTime} menuProps={menuProps} onClick={handleHourPick} />
      )}
    </>
  )
}

export default StageTimerModalEndTimeHour
