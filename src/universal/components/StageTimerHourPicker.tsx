import React from 'react'
import Menu from 'universal/components/Menu'
import {MenuProps} from 'universal/hooks/useMenu'
import MenuItem from 'universal/components/MenuItem'
import ms from 'ms'
import formatTime from 'universal/utils/formatTime'

interface Props {
  endTime: Date
  menuProps: MenuProps
  onClick: (n: number) => void
}

const options = [...Array(48).keys()].map((n) => n * ms('30m'))

const StageTimerHourPicker = (props: Props) => {
  const {menuProps, endTime, onClick} = props
  const currentValue = endTime.getHours() * ms('1h') + endTime.getMinutes() * ms('1m')
  console.log('curVal', currentValue)
  return (
    <Menu
      {...menuProps}
      ariaLabel={'Select a time limit'}
      defaultActiveIdx={options.findIndex((n) => n === currentValue)}
    >
      {options.map((n) => {
        const label = formatTime(new Date(n), true)
        return <MenuItem key={n} label={label} onClick={() => onClick(n)} />
      })}
    </Menu>
  )
}

export default StageTimerHourPicker
