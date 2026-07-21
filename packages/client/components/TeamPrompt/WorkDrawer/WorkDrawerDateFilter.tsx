import DateRangeIcon from '@mui/icons-material/DateRange'
import dayjs from 'dayjs'
import {useState} from 'react'
import {DayPicker} from 'react-day-picker'
import {ClearFilterIcon} from '../../../modules/search/ClearFilterIcon'
import {Button} from '../../../ui/Button/Button'
import {Menu} from '../../../ui/Menu/Menu'
import {MenuContent} from '../../../ui/Menu/MenuContent'

export interface WorkDrawerDateRange {
  startAt: string
  endAt: string
}

interface Props {
  dateRange: WorkDrawerDateRange | undefined
  setDateRange: (range: WorkDrawerDateRange | undefined) => void
}

const PRESETS = [
  {label: 'Last 24 hours', hours: 24},
  {label: 'Last week', hours: 24 * 7},
  {label: 'Last 2 weeks', hours: 24 * 14}
]

export const WorkDrawerDateFilter = ({dateRange, setDateRange}: Props) => {
  const [open, setOpen] = useState(false)

  const handlePreset = (hours: number) => {
    setDateRange({
      startAt: dayjs().subtract(hours, 'hour').toISOString(),
      endAt: dayjs().endOf('day').toISOString()
    })
    setOpen(false)
  }

  const selectedDates = {
    from: dateRange?.startAt ? new Date(dateRange.startAt) : undefined,
    to: dateRange?.endAt ? new Date(dateRange.endAt) : undefined
  }

  const dateRangeText = dateRange
    ? `${dayjs(dateRange.startAt).format('MMM DD')} - ${dayjs(dateRange.endAt).format('MMM DD')}`
    : 'Any time'

  return (
    <Menu
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          variant='flat'
          data-dirty={dateRange ? '' : undefined}
          className='group items-center justify-center rounded-xl p-1 px-2 text-fg-secondary text-sm hover:bg-surface-raised data-dirty:text-fg-primary'
        >
          <DateRangeIcon className='pr-1' />
          <span>{dateRangeText}</span>
          {dateRange && !open && <ClearFilterIcon onClick={() => setDateRange(undefined)} />}
        </Button>
      }
    >
      <MenuContent
        align='start'
        sideOffset={4}
        className='z-30 h-fit max-h-96 w-auto min-w-[300px] max-w-none border border-hairline p-4 shadow-xl'
      >
        <div className='flex flex-col'>
          <div className='flex justify-between'>
            {dateRange && (
              <Button className='p-1 font-semibold text-xs' onClick={() => setDateRange(undefined)}>
                Clear
              </Button>
            )}
          </div>
          <div className='flex justify-evenly pb-0.5'>
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                className='cursor-pointer rounded p-1 text-left text-fg-primary text-sm hover:bg-surface-raised'
                onClick={() => handlePreset(preset.hours)}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className='flex justify-center border-hairline border-t pt-4'>
            <DayPicker
              mode='range'
              selected={selectedDates}
              onSelect={(range) => {
                if (!range?.from) {
                  setDateRange(undefined)
                  return
                }
                setDateRange({
                  startAt: dayjs(range.from).startOf('day').toISOString(),
                  endAt: dayjs(range.to ?? range.from)
                    .endOf('day')
                    .toISOString()
                })
              }}
            />
          </div>
        </div>
      </MenuContent>
    </Menu>
  )
}
