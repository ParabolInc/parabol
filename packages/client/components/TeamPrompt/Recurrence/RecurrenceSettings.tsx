import styled from '@emotion/styled'
import dayjs from 'dayjs'
import utcPlugin from 'dayjs/plugin/utc'
import React, {useEffect, useState} from 'react'
import {Frequency, RRule} from 'rrule'
import {MenuPosition} from '../../../hooks/useCoords'
import useMenu from '../../../hooks/useMenu'
import {PortalId} from '../../../hooks/usePortal'
import {PALETTE} from '../../../styles/paletteV3'
import DropdownMenuToggle from '../../DropdownMenuToggle'
import {Day, RecurrenceDayCheckbox} from './RecurrenceDayCheckbox'
import {RecurrenceTimePicker} from './RecurrenceTimePicker'
dayjs.extend(utcPlugin)

export const ALL_DAYS: Day[] = [
  {name: 'Monday', short: 'M', rruleVal: RRule.MO, intVal: 0},
  {name: 'Tuesday', short: 'T', rruleVal: RRule.TU, intVal: 1},
  {name: 'Wednesday', short: 'W', rruleVal: RRule.WE, intVal: 2},
  {name: 'Thursday', short: 'T', rruleVal: RRule.TH, intVal: 3},
  {name: 'Friday', short: 'F', rruleVal: RRule.FR, intVal: 4},
  {name: 'Saturday', short: 'S', rruleVal: RRule.SA, intVal: 5},
  {name: 'Sunday', short: 'S', rruleVal: RRule.SU, intVal: 6}
]

const SUPPORTED_FREQUENCIES = [Frequency.WEEKLY, Frequency.MONTHLY] as const
type SupportedFrequency = typeof SUPPORTED_FREQUENCIES[number]

const SUPPORTED_FREQUENCIES_LABELS: Record<SupportedFrequency, string> = {
  [Frequency.MONTHLY]: 'Monthly',
  [Frequency.WEEKLY]: 'Weekly'
}

const INTERVAL_INPUT_PROPS_CONFIG: Record<SupportedFrequency, {min: number; max: number}> = {
  [Frequency.WEEKLY]: {
    min: 1,
    max: 52
  },
  [Frequency.MONTHLY]: {
    min: 1,
    max: 12
  }
} as const

const RecurrenceFrequencyPickerRoot = styled('div')({
  display: 'flex',
  justifyContent: 'start',
  alignItems: 'center',
  gap: 8,
  margin: '16px 0'
})

const RecurrenceIntervalInput = styled('input')({
  height: 36,
  flex: 1,
  padding: 8,
  border: 'solid',
  borderWidth: 1,
  borderRadius: 4,
  borderColor: PALETTE.SLATE_500,
  '&:hover, :focus, :focus-visible, :active': {
    outline: `1px solid ${PALETTE.SLATE_600}`,
    borderColor: PALETTE.SLATE_600,
    borderRadius: 4
  }
})

const RecurrenceFrequencySelect = styled('select')({
  height: 36,
  appearance: 'none',
  flex: 1,
  padding: 8,
  border: 'solid',
  cursor: 'pointer',
  borderWidth: 1,
  borderRadius: 4,
  borderColor: PALETTE.SLATE_500,
  '&:hover, :focus, :focus-visible, :active': {
    outline: `1px solid ${PALETTE.SLATE_600}`,
    borderColor: PALETTE.SLATE_600,
    borderRadius: 4
  }
})

const RecurrenceSettingsRoot = styled('div')({
  padding: 16,
  fontSize: 14
})

const RecurrenceSettingsTitle = styled('div')({
  fontSize: 18,
  fontWeight: 600
})

const HumanReadableRecurrenceRule = styled('div')({
  fontSize: 14,
  maxWidth: 360,
  overflow: 'hidden'
})

const RecurrenceDayPickerRoot = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 8,
  marginTop: 16,
  marginBottom: 8
})

const StartTimeDropdownToggle = styled(DropdownMenuToggle)({
  fontSize: 14,
  width: '100%',
  marginTop: 8,
  '&:hover, :focus, :focus-visible, :active': {
    outline: `1px solid ${PALETTE.SLATE_600}`,
    borderColor: PALETTE.SLATE_600,
    borderRadius: 4
  }
})

const StartTimeSection = styled('div')({
  marginTop: 16
})

interface Props {
  parentId: PortalId
  onRecurrenceRuleUpdated: (rrule: RRule | null) => void
  recurrenceRule: RRule | null
}

export const RecurrenceSettings = (props: Props) => {
  const {parentId, onRecurrenceRuleUpdated, recurrenceRule} = props
  const [recurrenceInterval, setRecurrenceInterval] = React.useState(
    recurrenceRule ? recurrenceRule.options.interval : 1
  )
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<SupportedFrequency>(
    recurrenceRule ? (recurrenceRule.options.freq as SupportedFrequency) : Frequency.WEEKLY
  )
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
          .toDate() // suggest 6:00 AM tomorrow)
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
      setRecurrenceInterval(interval)
    } catch (error) {
      console.error(error)
    }
  }

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      const frequency = parseInt(e.target.value)
      setRecurrenceFrequency(frequency)
    } catch (error) {
      console.error(error)
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
      recurrenceDays.length > 0
        ? new RRule({
            freq: recurrenceFrequency,
            interval: recurrenceInterval,
            byweekday: recurrenceDays.map((day) => day.rruleVal),
            dtstart: dayjs(recurrenceStartTime).utc().toDate(),
            //TODO: this causes rrule to provide 'Invalid Date' for the next occurrences - see https://github.com/jakubroztocil/rrule/pull/547
            tzid: timeZone
          })
        : null

    onRecurrenceRuleUpdated(rrule)
  }, [recurrenceDays, recurrenceFrequency, recurrenceInterval, recurrenceStartTime])

  return (
    <RecurrenceSettingsRoot>
      <RecurrenceSettingsTitle>Recurrence</RecurrenceSettingsTitle>
      <RecurrenceFrequencyPickerRoot>
        <span>Repeats every</span>
        <RecurrenceIntervalInput
          type='number'
          onChange={handleIntervalChange}
          value={recurrenceInterval}
          {...INTERVAL_INPUT_PROPS_CONFIG[recurrenceFrequency]}
        />
        <RecurrenceFrequencySelect onChange={handleFrequencyChange} value={recurrenceFrequency}>
          {SUPPORTED_FREQUENCIES.map((frequency) => (
            <option key={frequency} value={frequency}>
              {SUPPORTED_FREQUENCIES_LABELS[frequency]}
            </option>
          ))}
        </RecurrenceFrequencySelect>
      </RecurrenceFrequencyPickerRoot>
      <RecurrenceDayPickerRoot>
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
      </RecurrenceDayPickerRoot>
      <HumanReadableRecurrenceRule>
        Your meeting{' '}
        <strong>
          {recurrenceRule ? `will restart ${recurrenceRule.toText()}` : 'will not restart'}
        </strong>
      </HumanReadableRecurrenceRule>
      <StartTimeSection>
        <div>Each instance starts at</div>
        <StartTimeDropdownToggle
          defaultText={`${dayjs(recurrenceStartTime).format('h:mm A')} (${timeZone})`}
          onClick={togglePortal}
          ref={originRef}
          size='small'
        />
        {menuPortal(
          <RecurrenceTimePicker menuProps={menuProps} onClick={setRecurrenceStartTime} />
        )}
      </StartTimeSection>
    </RecurrenceSettingsRoot>
  )
}
