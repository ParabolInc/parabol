import dayjs, {type Dayjs} from 'dayjs'
import timezonePlugin from 'dayjs/plugin/timezone'
import utcPlugin from 'dayjs/plugin/utc'
import * as React from 'react'
import {type PropsWithChildren, useEffect} from 'react'
import {Frequency, RRule} from 'rrule'
import {MenuPosition} from '../../hooks/useCoords'
import useMenu from '../../hooks/useMenu'
import {fromRRuleDateTime, toRRuleDateTime} from '../../shared/rruleUtil'
import {cn} from '../../ui/cn'
import {ALL_DAYS, type Day, toHumanReadable} from '../../utils/humanReadableRecurrenceRule'
import plural from '../../utils/plural'
import DropdownMenuToggle from '../DropdownMenuToggle'
import {RecurrenceDayCheckbox} from './RecurrenceDayCheckbox'
import {RecurrenceTimePicker} from './RecurrenceTimePicker'

dayjs.extend(utcPlugin)
dayjs.extend(timezonePlugin)

const Label = ({
  className,
  children,
  ...rest
}: PropsWithChildren<React.LabelHTMLAttributes<HTMLLabelElement>>) => {
  return (
    <label className={cn('text-sm font-semibold text-slate-800', className)} {...rest}>
      {children}
    </label>
  )
}

const Input = ({
  children,
  className,
  label,
  hasError,
  ...rest
}: PropsWithChildren<
  {
    label?: React.ReactNode
    hasError: boolean
  } & React.InputHTMLAttributes<HTMLInputElement>
>) => {
  const focusStyles =
    'focus:outline-hidden focus:border-slate-600 focus:ring-1 focus:ring-slate-600'
  const activeStyles =
    'active:border-slate-600 active:outline active:outline-slate-600 active:outline-1'
  const baseStyles =
    'form-input text-base font-sans p-2 border border-solid border-slate-500 rounded-sm hover:border-slate-600'
  const errorStyles =
    'border-tomato-600 focus:border-tomato-600 focus:ring-tomato-600 active:border-tomato-600 active:outline-tomato-600'

  const hasLabel = !!label
  if (!hasLabel)
    return <input className={cn(className, baseStyles, focusStyles, activeStyles)} {...rest} />

  return (
    <div>
      {label}
      <input
        className={cn(
          'mt-1',
          baseStyles,
          focusStyles,
          activeStyles,
          className,
          hasError && errorStyles
        )}
        {...rest}
      >
        {children}
      </input>
    </div>
  )
}

const Description = ({
  className,
  children,
  ...rest
}: PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => {
  return (
    <div className={cn('text-sm break-words text-slate-600 italic', className)} {...rest}>
      {children}
    </div>
  )
}

const Error = ({children, ...rest}: PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => {
  return (
    <div className='text-sm text-tomato-500' {...rest}>
      {children}
    </div>
  )
}

const validateInterval = (interval: number) => {
  if (!Number.isSafeInteger(interval)) return 'Interval must be number'
  if (interval < 1 || interval > 52) return 'Interval must be between 1 and 52'

  return undefined
}

export interface RecurrenceSettings {
  name: string
  rrule: RRule | null
}

interface Props {
  onRruleUpdated: (rrule: RRule | null) => void
  rrule: RRule | null
}

export const RecurrenceSettings = (props: Props) => {
  const {onRruleUpdated, rrule} = props
  const [recurrenceInterval, setRecurrenceInterval] = React.useState(
    rrule ? rrule.options.interval : 1
  )
  const [intervalError, setIntervalError] = React.useState<string | undefined>()
  const [recurrenceDays, setRecurrenceDays] = React.useState<Day[]>(
    rrule
      ? rrule.options.byweekday.map((weekday) => ALL_DAYS.find((day) => day.intVal === weekday)!)
      : []
  )
  const {timeZone} = Intl.DateTimeFormat().resolvedOptions()
  const [recurrenceStartTime, setRecurrenceStartTime] = React.useState<Dayjs>(
    rrule
      ? fromRRuleDateTime(rrule)
      : dayjs.tz(dayjs().add(1, 'day').startOf('day').add(6, 'hour'), timeZone) // suggest 6:00 AM tomorrow
  )

  const {menuPortal, togglePortal, menuProps, originRef} = useMenu<HTMLDivElement>(
    MenuPosition.LOWER_LEFT,
    {
      id: 'recurrenceStartTimePicker',
      isDropdown: true
    }
  )

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const interval = parseInt(e.target.value)
      const error = validateInterval(interval)

      setRecurrenceInterval(interval)
      setIntervalError(error)
    } catch {
      setIntervalError('Interval must be number')
    }
  }

  const handleDayChange = (day: Day) => {
    if (recurrenceDays.includes(day)) {
      setRecurrenceDays(recurrenceDays.filter((d) => d !== day))
    } else {
      setRecurrenceDays([...recurrenceDays, day])
    }
  }

  useEffect(() => {
    const rrule =
      recurrenceDays.length > 0 && !intervalError
        ? new RRule({
            freq: Frequency.WEEKLY,
            interval: recurrenceInterval,
            byweekday: recurrenceDays.map((day) => day.rruleVal),
            dtstart: toRRuleDateTime(recurrenceStartTime),
            tzid: timeZone
          })
        : null

    onRruleUpdated(rrule)
  }, [recurrenceDays, recurrenceInterval, recurrenceStartTime])

  return (
    <div className='space-y-4 p-4'>
      <div className='space-y-1'>
        <div className='flex items-center gap-2'>
          <label className='block text-sm text-slate-800' htmlFor='series-interval'>
            Restarts every
          </label>
          <Input
            className={'h-[34px] w-[100px]'}
            hasError={!!intervalError}
            id='series-interval'
            type='number'
            onChange={handleIntervalChange}
            value={recurrenceInterval}
            min={1}
            max={52}
          />
          <div className='self-end py-2 text-sm'>{plural(recurrenceInterval, 'week')}</div>
        </div>
        {intervalError && <Error key={intervalError}>{intervalError}</Error>}
      </div>
      <div className='space-y-1'>
        <Label>Repeats on</Label>
        <div className='flex items-center justify-between'>
          {ALL_DAYS.map((day) => {
            const isSelected = recurrenceDays.some(
              (recurrenceDay) => recurrenceDay.intVal === day.intVal
            )

            return (
              <RecurrenceDayCheckbox
                key={day.intVal}
                day={day}
                onToggle={handleDayChange}
                isChecked={isSelected}
              />
            )
          })}
        </div>
        <Description>
          Your meeting{' '}
          <span className='font-semibold'>
            {rrule
              ? `will restart ${toHumanReadable(rrule, {isPartOfSentence: true})}`
              : 'will not restart'}
          </span>
        </Description>
      </div>
      <div className='space-y-1'>
        <Label>Each instance starts at</Label>
        <DropdownMenuToggle
          className='w-full text-sm'
          defaultText={`${recurrenceStartTime.format('h:mm A')} (${timeZone})`}
          onClick={togglePortal}
          ref={originRef}
          size='small'
        />
        {menuPortal(
          <RecurrenceTimePicker menuProps={menuProps} onClick={setRecurrenceStartTime} />
        )}
      </div>
    </div>
  )
}
