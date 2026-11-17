import * as RadixSelect from '@radix-ui/react-select'
import ms from 'ms'
import type {ReactNode} from 'react'
import {Select} from '../ui/Select/Select'
import {SelectContent} from '../ui/Select/SelectContent'
import {SelectItem} from '../ui/Select/SelectItem'
import {SelectTrigger} from '../ui/Select/SelectTrigger'
import formatTime from '../utils/date/formatTime'

interface Props {
  endTime: Date
  trigger: ReactNode
  onClick: (n: Date) => void
}

const options = [...Array(48).keys()].map((n) => n * ms('30m'))

const StageTimerHourPicker = (props: Props) => {
  const {endTime, trigger, onClick} = props
  const startOfToday = new Date(endTime).setHours(0, 0, 0, 0)
  const currentValue = endTime.getHours() * ms('1h') + endTime.getMinutes() * ms('1m')
  return (
    <Select
      value={String(currentValue)}
      onValueChange={(value) => onClick(new Date(startOfToday + Number(value)))}
    >
      <SelectTrigger asChild>{trigger}</SelectTrigger>
      <SelectContent>
        <RadixSelect.ScrollUpButton className='flex cursor-default items-center justify-center py-1' />
        {options.map((n) => {
          const proposedTime = new Date(startOfToday + n)
          return (
            <SelectItem key={n} value={String(n)} disabled={proposedTime.getTime() < Date.now()}>
              {formatTime(proposedTime)}
            </SelectItem>
          )
        })}
        <RadixSelect.ScrollDownButton className='flex cursor-default items-center justify-center py-1' />
      </SelectContent>
    </Select>
  )
}

export default StageTimerHourPicker
