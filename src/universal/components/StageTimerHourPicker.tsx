import React from 'react'
import Menu from 'universal/components/Menu'
import {MenuProps} from 'universal/hooks/useMenu'
import MenuItem from 'universal/components/MenuItem'
import ms from 'ms'
import formatTime from 'universal/utils/date/formatTime'

interface Props {
  endTime: Date
  menuProps: MenuProps
  onClick: (n: Date) => void
}

const options = [...Array(48).keys()].map((n) => n * ms('30m'))

const StageTimerHourPicker = (props: Props) => {
  const {menuProps, endTime, onClick} = props
  const currentValue = endTime.getHours() * ms('1h') + endTime.getMinutes() * ms('1m')
  const startOfToday = new Date(endTime).setHours(0, 0, 0, 0)
  return (
    <Menu
      {...menuProps}
      ariaLabel={'Select a time limit'}
      defaultActiveIdx={options.findIndex((n) => n === currentValue)}
    >
      {options.map((n) => {
        const proposedTime = new Date(startOfToday + n)
        const isDisabled = proposedTime.getTime() < Date.now()
        return (
          <MenuItem
            key={n}
            label={formatTime(proposedTime)}
            isDisabled={isDisabled}
            onClick={() => onClick(proposedTime)}
          />
        )
      })}
    </Menu>
  )
}

export default StageTimerHourPicker
