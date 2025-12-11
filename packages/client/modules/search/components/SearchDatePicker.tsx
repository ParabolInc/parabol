import styled from '@emotion/styled'
import DateRangeIcon from '@mui/icons-material/DateRange'
import dayjs from 'dayjs'
import {type DateRange, DayPicker} from 'react-day-picker'
import Toggle from '~/components/Toggle/Toggle'
import useRouter from '~/hooks/useRouter'
import {PALETTE} from '~/styles/paletteV3'
import {SearchDateType} from '~/types/constEnums'
import {Menu} from '~/ui/Menu/Menu'
import {MenuContent} from '~/ui/Menu/MenuContent'

const ToggleRow = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  borderBottom: `1px solid ${PALETTE.SLATE_200}`,
  fontSize: 14,
  fontWeight: 500,
  color: PALETTE.SLATE_600
})

const SearchDatePicker = () => {
  const {location, history} = useRouter()
  const params = new URLSearchParams(location.search)

  const startParam = params.get('start')
  const endParam = params.get('end')
  // Default to UPDATED if not specified
  const dateFieldParam = params.get('dateField') || SearchDateType.UPDATED

  const selectedRange: DateRange | undefined = startParam
    ? {
        from: new Date(startParam),
        to: endParam ? new Date(endParam) : undefined
      }
    : undefined

  const fieldLabel = dateFieldParam === SearchDateType.CREATED ? 'Created' : 'Updated'

  let dateRangeLabel = 'Filter by date'
  if (selectedRange?.from) {
    if (selectedRange.to) {
      dateRangeLabel = `${fieldLabel} ${dayjs(selectedRange.from).format('MMM D, YYYY')} - ${dayjs(selectedRange.to).format('MMM D, YYYY')}`
    } else {
      dateRangeLabel = `${fieldLabel} after ${dayjs(selectedRange.from).format('MMM D, YYYY')}`
    }
  }

  const updateParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(location.search)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
    })
    history.replace(`${location.pathname}?${newParams.toString()}`)
  }

  const onSelect = (range: DateRange | undefined) => {
    updateParams({
      start: range?.from?.toISOString() || null,
      end: range?.to?.toISOString() || null
    })
  }

  const toggleDateField = () => {
    const isCreated = dateFieldParam === SearchDateType.CREATED
    updateParams({
      dateField: isCreated ? SearchDateType.UPDATED : SearchDateType.CREATED
    })
  }

  return (
    <Menu
      trigger={
        <div className='flex cursor-pointer flex-row items-center gap-2 px-3 py-2 font-semibold text-slate-600 hover:text-slate-700'>
          <DateRangeIcon sx={{fontSize: 24}} />
          <span className='text-sm'>{dateRangeLabel}</span>
        </div>
      }
    >
      <MenuContent align='start' sideOffset={4} className='max-h-96'>
        <ToggleRow>
          <span>Use created date</span>
          <Toggle active={dateFieldParam === SearchDateType.CREATED} onClick={toggleDateField} />
        </ToggleRow>
        <DayPicker mode='range' selected={selectedRange} onSelect={onSelect} />
      </MenuContent>
    </Menu>
  )
}

export default SearchDatePicker
