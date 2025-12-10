import DateRangeIcon from '@mui/icons-material/DateRange'
import dayjs from 'dayjs'
import {type DateRange, DayPicker} from 'react-day-picker'
import useRouter from '~/hooks/useRouter'
import {Menu} from '~/ui/Menu/Menu'
import {MenuContent} from '~/ui/Menu/MenuContent'

const SearchDatePicker = () => {
  const {location, history} = useRouter()
  const params = new URLSearchParams(location.search)

  const startParam = params.get('start')
  const endParam = params.get('end')

  const selectedRange: DateRange | undefined = startParam
    ? {
        from: new Date(startParam),
        to: endParam ? new Date(endParam) : undefined
      }
    : undefined

  let dateRangeLabel = 'Updated after...'
  if (selectedRange?.from) {
    if (selectedRange.to) {
      dateRangeLabel = `${dayjs(selectedRange.from).format('MMM D, YYYY')} - ${dayjs(selectedRange.to).format('MMM D, YYYY')}`
    } else {
      dateRangeLabel = `After ${dayjs(selectedRange.from).format('MMM D, YYYY')}`
    }
  }

  const onSelect = (range: DateRange | undefined) => {
    const newParams = new URLSearchParams(location.search)
    if (range?.from) {
      newParams.set('start', range.from.toISOString())
    } else {
      newParams.delete('start')
    }

    if (range?.to) {
      newParams.set('end', range.to.toISOString())
    } else {
      newParams.delete('end')
    }

    history.replace(`${location.pathname}?${newParams.toString()}`)
  }

  return (
    <Menu
      trigger={
        <div className='flex cursor-pointer flex-row items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:border-slate-300 active:bg-slate-50'>
          <DateRangeIcon className='text-slate-500' sx={{fontSize: 20}} />
          <span className='font-medium text-sm'>{dateRangeLabel}</span>
        </div>
      }
    >
      <MenuContent align='start' sideOffset={4} className='max-h-96'>
        <DayPicker mode='range' selected={selectedRange} onSelect={onSelect} />
      </MenuContent>
    </Menu>
  )
}

export default SearchDatePicker
