import DateRangeIcon from '@mui/icons-material/DateRange'
import dayjs from 'dayjs'
import {DayPicker} from 'react-day-picker'
import type {SearchDateTypeEnum} from '../../__generated__/SearchDialogResultsQuery.graphql'
import {Button} from '../../ui/Button/Button'
import {Menu} from '../../ui/Menu/Menu'
import {MenuContent} from '../../ui/Menu/MenuContent'
import {Select} from '../../ui/Select/Select'
import {SelectContent} from '../../ui/Select/SelectContent'
import {SelectItem} from '../../ui/Select/SelectItem'
import {SelectTrigger} from '../../ui/Select/SelectTrigger'
import {SelectValue} from '../../ui/Select/SelectValue'

export interface DateRange {
  startAt?: string
  endAt?: string
}

interface Props {
  dateField: SearchDateTypeEnum
  setDateField: (type: SearchDateTypeEnum) => void
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
}

export const DateRangeFilter = ({dateField, setDateField, dateRange, setDateRange}: Props) => {
  const handleQuickSelect = (days: number) => {
    if (days === 0) {
      // Today
      setDateRange({
        startAt: dayjs().startOf('day').toISOString(),
        endAt: dayjs().endOf('day').toISOString()
      })
    } else {
      setDateRange({
        startAt: dayjs().subtract(days, 'day').startOf('day').toISOString(),
        endAt: dayjs().endOf('day').toISOString()
      })
    }
  }

  const clearDateRange = () => {
    setDateRange(undefined)
    setDateField('updatedAt')
  }

  const selectedDates = {
    from: dateRange?.startAt ? new Date(dateRange.startAt) : undefined,
    to: dateRange?.endAt ? new Date(dateRange.endAt) : undefined
  }

  const dateRangeText = dateRange
    ? `${dayjs(dateRange.startAt).format('MMM, DD')} - ${dayjs(dateRange.endAt).format('MMM, DD')}`
    : 'Date Range'

  return (
    <Menu
      trigger={
        <Button
          variant='flat'
          data-dirty={dateRange ? '' : undefined}
          className='items-center justify-center rounded-xl p-1 px-2 text-slate-600 text-sm hover:bg-slate-200 data-dirty:text-slate-700'
        >
          <DateRangeIcon className='pr-1' />
          <span>{dateRangeText}</span>
        </Button>
      }
    >
      <MenuContent
        align='start'
        sideOffset={4}
        className='z-30 h-fit max-h-96 w-auto min-w-[300px] max-w-none border border-slate-200 p-4 shadow-xl'
      >
        <div className='flex flex-col'>
          <div className='flex justify-between'>
            <Select
              value={dateField}
              onValueChange={(val) => setDateField(val as SearchDateTypeEnum)}
            >
              <SelectTrigger className='h-fit w-fit justify-start border-none p-0 px-1 text-xs hover:bg-slate-200'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent align='end' className='p-1'>
                <SelectItem
                  value='createdAt'
                  className='h-5 rounded py-0 text-xs hover:bg-slate-200'
                  checkClassName='h-4 w-4'
                >
                  Created
                </SelectItem>
                <SelectItem
                  value='updatedAt'
                  className='h-5 rounded py-0 text-xs hover:bg-slate-200'
                  checkClassName='h-4 w-4'
                >
                  Last edited
                </SelectItem>
              </SelectContent>
            </Select>
            {dateRange && (
              <Button className='p-1 font-semibold text-xs' onClick={clearDateRange}>
                Clear
              </Button>
            )}
          </div>

          <div className='flex justify-evenly'>
            <button
              className='cursor-pointer rounded p-1 text-left text-slate-700 text-sm hover:bg-slate-200'
              onClick={() => handleQuickSelect(0)}
            >
              Today
            </button>
            <button
              className='cursor-pointer rounded p-1 text-left text-slate-700 text-sm hover:bg-slate-200'
              onClick={() => handleQuickSelect(7)}
            >
              Last 7 days
            </button>
            <button
              className='cursor-pointer rounded p-1 text-left text-slate-700 text-sm hover:bg-slate-200'
              onClick={() => handleQuickSelect(30)}
            >
              Last 30 days
            </button>
          </div>

          <div className='flex justify-center border-slate-200 border-t pt-4'>
            <DayPicker
              mode='range'
              selected={selectedDates}
              onSelect={(range) => {
                setDateRange({
                  startAt: range?.from?.toISOString(),
                  endAt: range?.to?.toISOString()
                })
              }}
            />
          </div>
        </div>
      </MenuContent>
    </Menu>
  )
}
