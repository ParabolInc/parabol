import ms from 'ms'
import {useState} from 'react'
import {type DayModifiers, DayPicker} from 'react-day-picker'
import {Event} from '~/ui/icons'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import {shortDays, shortMonths} from '../utils/makeDateString'
import roundDateToNearestHalfHour from '../utils/roundDateToNearestHalfHour'
import DropdownMenuToggle from './DropdownMenuToggle'

interface Props {
  endTime: Date
  setEndTime: (date: Date) => void
}

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
  const [isOpen, setIsOpen] = useState(false)
  const handleDayClick = (day: Date, {disabled, selected}: DayModifiers) => {
    if (disabled || selected) return
    const nextDate = new Date(endTime)
    nextDate.setFullYear(day.getFullYear(), day.getMonth(), day.getDate())
    const now = new Date()
    if (nextDate < now) {
      const roundedDate = roundDateToNearestHalfHour(now)
      nextDate.setHours(roundedDate.getHours() + 1, roundedDate.getMinutes())
    }
    setEndTime(nextDate)
    setIsOpen(false)
  }

  return (
    <>
      <Event className='text-fg-secondary' />
      <Menu
        open={isOpen}
        onOpenChange={setIsOpen}
        trigger={
          <DropdownMenuToggle
            className='min-w-[160px] py-1 pr-0 pl-2 text-[14px]'
            defaultText={dayStr}
            flat
            size='small'
          />
        }
      >
        <MenuContent align='start' className='max-h-none w-auto max-w-none p-2'>
          <DayPicker
            disabled={{before: now}}
            fromMonth={now}
            defaultMonth={endTime}
            onDayClick={handleDayClick}
            selected={endTime}
            toMonth={NEXT_YEAR}
          />
        </MenuContent>
      </Menu>
    </>
  )
}

export default StageTimerModalEndTimeDate
