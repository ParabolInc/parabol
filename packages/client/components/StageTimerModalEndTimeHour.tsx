import {SelectValue} from '../ui/Select/SelectValue'
import formatTime from '../utils/date/formatTime'
import DropdownMenuToggle from './DropdownMenuToggle'
import StageTimerHourPicker from './StageTimerHourPicker'

interface Props {
  endTime: Date
  setEndTime: (date: Date) => void
}

const StageTimerModalEndTimeHour = (props: Props) => {
  const {endTime, setEndTime} = props
  const timeStr = formatTime(endTime)

  return (
    <StageTimerHourPicker
      endTime={endTime}
      onClick={setEndTime}
      trigger={
        <DropdownMenuToggle
          className='min-w-[160px] py-1 pr-0 pl-8 text-[14px]'
          // SelectValue anchors radix's item-aligned positioning over the trigger
          defaultText={<SelectValue>{timeStr}</SelectValue>}
          flat
          size='small'
        />
      }
    />
  )
}

export default StageTimerModalEndTimeHour
