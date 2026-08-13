import type {Dayjs} from 'dayjs'
import {type DayModifiers, DayPicker} from 'react-day-picker'
import {AccessTime, Event} from '~/ui/icons'
import DropdownMenuToggle from '../../../../components/DropdownMenuToggle'
import StageTimerHourPicker from '../../../../components/StageTimerHourPicker'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import formatTime from '../../../../utils/date/formatTime'

interface Props {
  label: string
  value: Dayjs
  onChange: (next: Date) => void
}

const GcalDateTimeRow = (props: Props) => {
  const {label, value, onChange} = props
  const date = value.toDate()
  const dateMenu = useMenu<HTMLDivElement>(MenuPosition.LOWER_LEFT, {
    id: 'gcalDateTimePicker',
    isDropdown: true
  })
  const timeMenu = useMenu<HTMLDivElement>(MenuPosition.LOWER_LEFT, {
    id: 'gcalDateTimePicker',
    isDropdown: true
  })

  const handleDayClick = (day: Date, {disabled, selected}: DayModifiers) => {
    if (disabled || selected) return
    const next = new Date(date)
    next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate())
    onChange(next)
    dateMenu.menuProps.closePortal()
  }

  const handleHourPick = (next: Date) => {
    onChange(next)
    timeMenu.menuProps.closePortal()
  }

  return (
    <div className='flex flex-col'>
      <div className='pb-1 font-semibold text-fg-secondary text-xs'>{label}</div>
      <div className='flex items-center space-x-2'>
        <Event className='text-fg-secondary' />
        <DropdownMenuToggle
          className='min-w-[180px] py-1 pr-0 pl-2 text-[14px]'
          defaultText={value.format('MMMM D, YYYY')}
          onClick={dateMenu.togglePortal}
          ref={dateMenu.originRef}
          flat
          size='small'
        />
        <AccessTime className='text-fg-secondary' />
        <DropdownMenuToggle
          className='min-w-[120px] py-1 pr-0 pl-2 text-[14px]'
          defaultText={formatTime(date)}
          onClick={timeMenu.togglePortal}
          ref={timeMenu.originRef}
          flat
          size='small'
        />
      </div>
      {dateMenu.menuPortal(
        <DayPicker defaultMonth={date} onDayClick={handleDayClick} selected={date} />
      )}
      {timeMenu.menuPortal(
        <StageTimerHourPicker
          endTime={date}
          menuProps={timeMenu.menuProps}
          onClick={handleHourPick}
        />
      )}
    </div>
  )
}

export default GcalDateTimeRow
