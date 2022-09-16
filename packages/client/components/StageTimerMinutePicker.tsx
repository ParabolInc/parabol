import React from 'react'
import {MenuProps} from '../hooks/useMenu'
import plural from '../utils/plural'
import Menu from './Menu'
import MenuItem from './MenuItem'

interface Props {
  minuteTimeLimit: number
  menuProps: MenuProps
  setMinuteTimeLimit: (n: number) => void
}

const options = [...Array(9).keys()].map((n) => n + 1)

const StageTimerMinutePicker = (props: Props) => {
  const {menuProps, minuteTimeLimit, setMinuteTimeLimit} = props
  return (
    <Menu
      {...menuProps}
      ariaLabel={'Select a time limit'}
      defaultActiveIdx={options.findIndex((n) => n === minuteTimeLimit)}
    >
      {options.map((n) => {
        const onClick = () => {
          setMinuteTimeLimit(n)
        }
        return <MenuItem key={n} label={`${n} ${plural(n, 'minute')}`} onClick={onClick} />
      })}
    </Menu>
  )
}

export default StageTimerMinutePicker
