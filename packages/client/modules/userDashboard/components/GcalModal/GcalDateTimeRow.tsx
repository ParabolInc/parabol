import type {Dayjs} from 'dayjs'
import {useState} from 'react'
import {type DayModifiers, DayPicker} from 'react-day-picker'
import {AccessTime, Event} from '~/ui/icons'
import DropdownMenuToggle from '../../../../components/DropdownMenuToggle'
import StageTimerHourPicker from '../../../../components/StageTimerHourPicker'
import {Menu} from '../../../../ui/Menu/Menu'
import {MenuContent} from '../../../../ui/Menu/MenuContent'
import formatTime from '../../../../utils/date/formatTime'

interface Props {
  label: string
  value: Dayjs
  onChange: (next: Date) => void
}

const GcalDateTimeRow = (props: Props) => {
  const {label, value, onChange} = props
  const date = value.toDate()
  const [isDateOpen, setIsDateOpen] = useState(false)

  const handleDayClick = (day: Date, {disabled, selected}: DayModifiers) => {
    if (disabled || selected) return
    const next = new Date(date)
    next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate())
    onChange(next)
    setIsDateOpen(false)
  }

  return (
    <div className='flex flex-col'>
      <div className='pb-1 font-semibold text-fg-secondary text-xs'>{label}</div>
      <div className='flex items-center space-x-2'>
        <Event className='text-fg-secondary' />
        <Menu
          open={isDateOpen}
          onOpenChange={setIsDateOpen}
          trigger={
            <DropdownMenuToggle
              className='min-w-[180px] py-1 pr-0 pl-2 text-[14px]'
              defaultText={value.format('MMMM D, YYYY')}
              flat
              size='small'
            />
          }
        >
          <MenuContent align='start' className='max-h-none w-auto max-w-none p-2'>
            <DayPicker defaultMonth={date} onDayClick={handleDayClick} selected={date} />
          </MenuContent>
        </Menu>
        <AccessTime className='text-fg-secondary' />
        <StageTimerHourPicker
          endTime={date}
          onClick={onChange}
          trigger={
            <DropdownMenuToggle
              className='min-w-[120px] py-1 pr-0 pl-2 text-[14px]'
              defaultText={formatTime(date)}
              flat
              size='small'
            />
          }
        />
      </div>
    </div>
  )
}

export default GcalDateTimeRow
