import clsx from 'clsx'
import dayjs from 'dayjs'
import utcPlugin from 'dayjs/plugin/utc'
import React, {PropsWithChildren, useEffect} from 'react'
import {Frequency, RRule} from 'rrule'
import {MenuPosition} from '../../../hooks/useCoords'
import useMenu from '../../../hooks/useMenu'
import {PortalId} from '../../../hooks/usePortal'
import plural from '../../../utils/plural'
import DropdownMenuToggle from '../../DropdownMenuToggle'
import {toHumanReadable} from './HumanReadableRecurrenceRule'
import {Day, RecurrenceDayCheckbox} from './RecurrenceDayCheckbox'
import {RecurrenceTimePicker} from './RecurrenceTimePicker'
import Legitity from '../../../validation/Legitity'
import {isNotNull} from '../../../utils/predicates'
dayjs.extend(utcPlugin)

export const ALL_DAYS: Day[] = [
  {
    name: 'Monday',
    shortName: 'Mon',
    abbreviation: 'M',
    rruleVal: RRule.MO,
    intVal: 0,
    isWeekday: true
  },
  {
    name: 'Tuesday',
    shortName: 'Tue',
    abbreviation: 'T',
    rruleVal: RRule.TU,
    intVal: 1,
    isWeekday: true
  },
  {
    name: 'Wednesday',
    shortName: 'Wed',
    abbreviation: 'W',
    rruleVal: RRule.WE,
    intVal: 2,
    isWeekday: true
  },
  {
    name: 'Thursday',
    shortName: 'Thu',
    abbreviation: 'T',
    rruleVal: RRule.TH,
    intVal: 3,
    isWeekday: true
  },
  {
    name: 'Friday',
    shortName: 'Fri',
    abbreviation: 'F',
    rruleVal: RRule.FR,
    intVal: 4,
    isWeekday: true
  },
  {
    name: 'Saturday',
    shortName: 'Sat',
    abbreviation: 'S',
    rruleVal: RRule.SA,
    intVal: 5,
    isWeekday: false
  },
  {
    name: 'Sunday',
    shortName: 'Sun',
    abbreviation: 'S',
    rruleVal: RRule.SU,
    intVal: 6,
    isWeekday: false
  }
]

const Label = ({
  className,
  children,
  ...rest
}: PropsWithChildren<React.LabelHTMLAttributes<HTMLLabelElement>>) => {
  return (
    <label className={clsx('text-sm font-semibold text-slate-800', className)} {...rest}>
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
  {label?: React.ReactNode; hasError: boolean} & React.InputHTMLAttributes<HTMLInputElement>
>) => {
  const focusStyles = 'focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600'
  const activeStyles =
    'active:border-slate-600 active:outline active:outline-slate-600 active:outline-1'
  const baseStyles =
    'form-input text-base font-sans p-2 border border-solid border-slate-500 rounded hover:border-slate-600'
  const errorStyles =
    'border-tomato-600 focus:border-tomato-600 focus:ring-tomato-600 active:border-tomato-600 active:outline-tomato-600'

  const hasLabel = !!label
  if (!hasLabel)
    return <input className={clsx(className, baseStyles, focusStyles, activeStyles)} {...rest} />

  return (
    <div>
      {label}
      <input
        className={clsx(
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
    <div
      className={clsx('max-w-xs break-words text-sm italic text-slate-600', className)}
      {...rest}
    >
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

const validateMeetingSeriesName = (name: string) => {
  const legitity = new Legitity(name)
  legitity.trim().max(50, 'Meeting series name must be less than 50 characters')

  return legitity.error
}

export interface RecurrenceSettings {
  name: string
  rrule: RRule | null
}

interface Props {
  parentId: PortalId
  onRecurrenceSettingsUpdated: (recurrenceSettings: RecurrenceSettings) => void
  recurrenceSettings: RecurrenceSettings
}

export const RecurrenceSettings = (props: Props) => {
  const {parentId, onRecurrenceSettingsUpdated, recurrenceSettings} = props
  const {name: meetingSeriesName, rrule: recurrenceRule} = recurrenceSettings
  const [name, setName] = React.useState(meetingSeriesName)
  const [nameError, setNameError] = React.useState<string | undefined>()
  const [recurrenceInterval, setRecurrenceInterval] = React.useState(
    recurrenceRule ? recurrenceRule.options.interval : 1
  )
  const [intervalError, setIntervalError] = React.useState<string | undefined>()
  const [recurrenceDays, setRecurrenceDays] = React.useState<Day[]>(
    recurrenceRule
      ? recurrenceRule.options.byweekday.map(
          (weekday) => ALL_DAYS.find((day) => day.intVal === weekday)!
        )
      : []
  )
  const [recurrenceStartTime, setRecurrenceStartTime] = React.useState<Date>(
    recurrenceRule
      ? recurrenceRule.options.dtstart
      : dayjs()
          .add(1, 'day')
          .set('hour', 6)
          .set('minute', 0)
          .set('second', 0)
          .set('millisecond', 0)
          .toDate() // suggest 6:00 AM tomorrow
  )

  const {timeZone} = Intl.DateTimeFormat().resolvedOptions()
  const {menuPortal, togglePortal, menuProps, originRef} = useMenu<HTMLDivElement>(
    MenuPosition.LOWER_LEFT,
    {
      id: 'recurrenceStartTimePicker',
      parentId,
      isDropdown: true
    }
  )

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const interval = parseInt(e.target.value)
      const error = validateInterval(interval)

      setRecurrenceInterval(interval)
      setIntervalError(error)
    } catch (error) {
      console.error(error)
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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    const res = validateMeetingSeriesName(name)

    setName(e.target.value)
    setNameError(res)
  }

  useEffect(() => {
    const rrule =
      recurrenceDays.length > 0 && !intervalError
        ? new RRule({
            freq: Frequency.WEEKLY,
            interval: recurrenceInterval,
            byweekday: recurrenceDays.map((day) => day.rruleVal),
            dtstart: dayjs(recurrenceStartTime).utc().toDate(),
            tzid: timeZone
          })
        : null

    onRecurrenceSettingsUpdated({name, rrule})
  }, [recurrenceDays, recurrenceInterval, recurrenceStartTime, name])
  const hasErrors = !!nameError || !!intervalError

  return (
    <div className='space-y-4 p-4'>
      <div className='text-lg font-semibold leading-none'>Recurrence</div>
      <div className='space-y-1'>
        <div className='flex items-center gap-2'>
          <Input
            className='h-[34px] w-[210px]'
            hasError={!!nameError}
            id='series-title'
            type='text'
            placeholder='Standup'
            value={meetingSeriesName}
            onChange={handleNameChange}
            min={1}
            max={50}
            label={
              <Label className='block ' htmlFor='series-title'>
                Series title
              </Label>
            }
          />
          <Input
            className={'h-[34px] w-[100px]'}
            hasError={!!intervalError}
            id='series-interval'
            type='number'
            label={
              <Label className='block' htmlFor='series-interval'>
                Restarts every
              </Label>
            }
            onChange={handleIntervalChange}
            value={recurrenceInterval}
            min={1}
            max={52}
          />
          <div className='self-end py-2 text-sm'>{plural(recurrenceInterval, 'week')}</div>
        </div>
        {hasErrors ? (
          [nameError, intervalError]
            .filter(isNotNull)
            .map((error) => <Error key={error}>{error}</Error>)
        ) : (
          <Description>
            The next meeting in this series will be called{' '}
            <span className='font-semibold'>
              "{meetingSeriesName || 'Standup'} - {dayjs(recurrenceStartTime).format('MMM DD')}"
            </span>
          </Description>
        )}
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
            {recurrenceRule
              ? `will restart ${toHumanReadable(recurrenceRule, {isPartOfSentence: true})}`
              : 'will not restart'}
          </span>
        </Description>
      </div>
      <div className='space-y-1'>
        <Label>Each instance starts at</Label>
        <DropdownMenuToggle
          className='w-full text-sm'
          defaultText={`${dayjs(recurrenceStartTime).format('h:mm A')} (${timeZone})`}
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
