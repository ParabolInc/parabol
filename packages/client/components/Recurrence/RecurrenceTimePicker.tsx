import * as RadixSelect from '@radix-ui/react-select'
import dayjs, {type Dayjs} from 'dayjs'
import ms from 'ms'
import {Select} from '../../ui/Select/Select'
import {SelectContent} from '../../ui/Select/SelectContent'
import {SelectItem} from '../../ui/Select/SelectItem'
import {SelectTrigger} from '../../ui/Select/SelectTrigger'
import {SelectValue} from '../../ui/Select/SelectValue'

interface Props {
  value: Dayjs
  onValueChange: (value: Dayjs) => void
}

const MS_PER_SLOT = ms('15m')
const OPTIONS = [...Array(96).keys()].map((n) => n * MS_PER_SLOT)

const toSlotMs = (d: Dayjs) => {
  const totalMs = (d.hour() * 60 + d.minute()) * 60_000
  return Math.round(totalMs / MS_PER_SLOT) * MS_PER_SLOT
}

export const RecurrenceTimePicker = ({value, onValueChange}: Props) => {
  const {timeZone} = Intl.DateTimeFormat().resolvedOptions()
  const slotMs = toSlotMs(value)

  const handleChange = (val: string) => {
    const n = Number(val)
    const todayAtTime = dayjs.tz(dayjs().startOf('day').add(n, 'ms'), timeZone)
    const proposedTime = todayAtTime.isAfter(dayjs()) ? todayAtTime : todayAtTime.add(1, 'day')
    onValueChange(proposedTime)
  }

  return (
    <Select value={String(slotMs)} onValueChange={handleChange}>
      <SelectTrigger className='w-full text-sm'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent position='item-aligned' className='max-h-60 overflow-y-auto'>
        <RadixSelect.ScrollUpButton className='flex cursor-default items-center justify-center py-1' />
        {OPTIONS.map((n) => {
          const label = dayjs().startOf('day').add(n, 'ms').format('h:mm A')
          return (
            <SelectItem key={n} value={String(n)}>
              {label}
            </SelectItem>
          )
        })}
        <RadixSelect.ScrollDownButton className='flex cursor-default items-center justify-center py-1' />
      </SelectContent>
    </Select>
  )
}
