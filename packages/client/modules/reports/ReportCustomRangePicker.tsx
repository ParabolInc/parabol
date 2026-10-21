import dayjs from 'dayjs'
import {useState} from 'react'
import {type DateRange, DayPicker} from 'react-day-picker'
import useBreakpoint from '../../hooks/useBreakpoint'
import {Breakpoint} from '../../types/constEnums'
import {Button} from '../../ui/Button/Button'
import plural from '../../utils/plural'
import type {ReportPagePeriod} from './reportPeriodParam'

interface Props {
  period: ReportPagePeriod
  orgCreatedAt: string
  onApply: (period: ReportPagePeriod) => void
  onCancel: () => void
}

const LOCAL_DATE = 'YYYY-MM-DD'

// matches the server: days up to a month, weeks up to 6 months, then months
const stepFor = (days: number) => (days <= 31 ? 'day' : days <= 186 ? 'week' : 'month')

const ReportCustomRangePicker = ({period, orgCreatedAt, onApply, onCancel}: Props) => {
  const isWide = useBreakpoint(Breakpoint.FUZZY_TABLET)
  const [range, setRange] = useState<DateRange | undefined>(
    period.startDate && period.endDate
      ? {from: dayjs(period.startDate).toDate(), to: dayjs(period.endDate).toDate()}
      : undefined
  )
  const today = dayjs().startOf('day')
  const {from, to} = range ?? {}
  const days = from && to ? dayjs(to).diff(from, 'day') + 1 : null
  const formatDay = (date: Date | undefined) => (date ? dayjs(date).format('MMM D, YYYY') : '—')
  const apply = () => {
    if (!from || !to) return
    onApply({startDate: dayjs(from).format(LOCAL_DATE), endDate: dayjs(to).format(LOCAL_DATE)})
  }
  return (
    <div className='flex flex-col'>
      <div className='flex flex-wrap gap-x-4 gap-y-1 px-4 pt-3 text-sm'>
        <span>
          <span className='text-fg-secondary'>Start</span> <strong>{formatDay(from)}</strong>
        </span>
        <span>
          <span className='text-fg-secondary'>End</span> <strong>{formatDay(to)}</strong>
        </span>
      </div>
      <DayPicker
        mode='range'
        numberOfMonths={isWide ? 2 : 1}
        selected={range}
        onSelect={setRange}
        defaultMonth={(from ? dayjs(from) : today.subtract(isWide ? 1 : 0, 'month')).toDate()}
        disabled={[{after: today.toDate()}, {before: dayjs(orgCreatedAt).startOf('day').toDate()}]}
      />
      <div className='flex flex-wrap items-center gap-2 border-hairline border-t px-4 py-3'>
        <span className='flex-1 text-fg-secondary text-sm'>
          {days === null
            ? 'Pick a start and end date'
            : `${days} ${plural(days, 'day')} · charts over time step by ${stepFor(days)}`}
        </span>
        <Button variant='flat' size='md' onClick={onCancel}>
          Cancel
        </Button>
        <Button variant='dialogPrimary' size='md' disabled={days === null} onClick={apply}>
          Apply
        </Button>
      </div>
    </div>
  )
}

export default ReportCustomRangePicker
