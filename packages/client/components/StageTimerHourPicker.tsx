import ms from 'ms'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {MenuProps} from '../hooks/useMenu'
import formatTime from '../utils/date/formatTime'
import Menu from './Menu'
import MenuItem from './MenuItem'

interface Props {
  endTime: Date
  menuProps: MenuProps
  onClick: (n: Date) => void
}

const options = [...Array(48).keys()].map((n) => n * ms('30m'))

const StageTimerHourPicker = (props: Props) => {
  const {menuProps, endTime, onClick} = props

  const {t} = useTranslation()

  const currentValue = endTime.getHours() * ms('1h') + endTime.getMinutes() * ms('1m')
  const startOfToday = new Date(endTime).setHours(0, 0, 0, 0)
  return (
    <Menu
      {...menuProps}
      ariaLabel={t('StageTimerHourPicker.SelectATimeLimit')}
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
