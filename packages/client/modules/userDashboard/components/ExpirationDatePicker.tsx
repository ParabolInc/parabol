import * as Popover from '@radix-ui/react-popover'
import {useState} from 'react'
import {DayPicker} from 'react-day-picker'

const today = new Date()
const maxExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
const formatDate = (date: Date) =>
  date.toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: 'numeric'})

interface Props {
  selected: Date
  onSelect: (date: Date) => void
}

export const ExpirationDatePicker = ({selected, onSelect}: Props) => {
  const [open, setOpen] = useState(false)

  return (
    <div className='flex flex-col gap-1'>
      <label className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>
        Expiration Date
      </label>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button className='w-full rounded-md border border-slate-300 px-3 py-2 text-left text-slate-700 text-sm hover:border-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500'>
            {formatDate(selected)}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align='start'
            className='z-50 rounded-lg border border-slate-200 bg-white shadow-lg'
          >
            <DayPicker
              mode='single'
              selected={selected}
              onSelect={(day) => {
                if (day) {
                  onSelect(day)
                  setOpen(false)
                }
              }}
              disabled={{before: today, after: maxExpiresAt}}
              defaultMonth={selected}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}
