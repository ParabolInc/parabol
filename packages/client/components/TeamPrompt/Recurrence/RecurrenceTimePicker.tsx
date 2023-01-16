import dayjs from 'dayjs'
import ms from 'ms'
import React from 'react'
import {MenuProps} from '../../../hooks/useMenu'
import Menu from '../../Menu'
import MenuItem from '../../MenuItem'

interface Props {
  menuProps: MenuProps
  onClick: (n: Date) => void
}
const options = [...Array(96).keys()].map((n) => n * ms('15m'))
export const RecurrenceTimePicker = (props: Props) => {
  const {menuProps, onClick} = props
  const startOfToday = new Date().setHours(0, 0, 0, 0)
  return (
    <Menu {...menuProps} ariaLabel={'6:00 AM'}>
      {options.map((n) => {
        const proposedTime = dayjs(startOfToday + n).add(1, 'day')
        return (
          <MenuItem
            key={n}
            label={proposedTime.format('h:mm A')}
            onClick={() => onClick(proposedTime.toDate())}
          />
        )
      })}
    </Menu>
  )
}
