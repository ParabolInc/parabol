import styled from '@emotion/styled'
import React, {useEffect, useState} from 'react'
import {Frequency, RRule, Weekday} from 'rrule'
import {PALETTE} from '../../../styles/paletteV3'

type DayFullName =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday'
type DayShortName = 'M' | 'T' | 'W' | 'F' | 'S'
type Day = {name: DayFullName; short: DayShortName; rruleVal: Weekday}

const ALL_DAYS: Day[] = [
  {name: 'Monday', short: 'M', rruleVal: RRule.MO},
  {name: 'Tuesday', short: 'T', rruleVal: RRule.TU},
  {name: 'Wednesday', short: 'W', rruleVal: RRule.WE},
  {name: 'Thursday', short: 'T', rruleVal: RRule.TH},
  {name: 'Friday', short: 'F', rruleVal: RRule.FR},
  {name: 'Saturday', short: 'S', rruleVal: RRule.SA},
  {name: 'Sunday', short: 'S', rruleVal: RRule.SU}
]

const CheckBoxRoot = styled('div')({
  position: 'relative',
  width: 42,
  height: 42
})

const StyledCheckbox = styled('input')({
  appearance: 'none',
  margin: 0,
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  border: `2px solid ${PALETTE.SLATE_200}`,
  borderRadius: 8,
  '&:checked': {
    border: `2px solid ${PALETTE.SKY_500}`,
    backgroundColor: PALETTE.SKY_500
  }
})

const StyledCheckboxLabel = styled('label')<{isChecked: boolean}>(({isChecked}) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  fontSize: 20,
  lineHeight: '26px',
  fontWeight: 600,
  display: 'flex',
  color: isChecked ? PALETTE.WHITE : PALETTE.SLATE_800,
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer'
}))

interface RecurrenceDayCheckBox {
  day: Day
  onToggle: (day: Day) => void
}

const RecurrenceDayCheckBox = (props: RecurrenceDayCheckBox) => {
  const {day, onToggle} = props
  const [checked, setChecked] = React.useState(false)

  return (
    <CheckBoxRoot>
      <StyledCheckbox
        type='checkbox'
        id={day.name}
        name={day.short}
        onChange={(e) => {
          setChecked(e.target.checked)
          onToggle(day)
        }}
      />
      <StyledCheckboxLabel htmlFor={day.name} isChecked={checked}>
        {day.short}
      </StyledCheckboxLabel>
    </CheckBoxRoot>
  )
}

const RecurrenceFrequencyPickerRoot = styled('div')({
  display: 'flex',
  justifyContent: 'start',
  alignItems: 'center',
  gap: 8,
  margin: '16px 0'
})

const RecurrenceIntervalInput = styled('input')({
  flex: 1,
  padding: 8,
  border: 'solid',
  borderWidth: 1,
  borderRadius: 4,
  borderColor: PALETTE.SLATE_500,
  '&:hover,:focus': {
    borderColor: PALETTE.SLATE_600
  }
})

const RecurrenceFrequencySelect = styled('select')({
  appearance: 'none',
  flex: 1,
  padding: 8,
  border: 'solid',
  borderWidth: 1,
  borderRadius: 4,
  borderColor: PALETTE.SLATE_500,
  '&:hover,:focus': {
    borderColor: PALETTE.SLATE_600
  }
})

const RecurrenceSettingsRoot = styled('div')({
  padding: 16
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

const convertToUTC = (localStartTime: Date) => {
  return new Date(
    Date.UTC(
      localStartTime.getUTCFullYear(),
      localStartTime.getUTCMonth(),
      localStartTime.getUTCDate() + 1,
      localStartTime.getUTCHours()
    )
  )
}

interface RecurrenceSettingsProps {
  onRecurrenceRuleUpdated: (rrule: RRule | null) => void
  recurrenceRule: RRule | null
}

export const RecurrenceSettings = (props: RecurrenceSettingsProps) => {
  const {onRecurrenceRuleUpdated, recurrenceRule} = props
  const [recurrenceInterval, setRecurrenceInterval] = React.useState(
    recurrenceRule ? recurrenceRule.options.interval : 1
  )
  const [recurrenceFrequency, setRecurrenceFrequency] = useState(
    recurrenceRule ? recurrenceRule.options.freq : RRule.WEEKLY
  )
  const [recurrenceDays, setRecurrenceDays] = React.useState<Day[]>([])
  //TODO: get this from the UI select
  const [startTime] = React.useState<Date>(new Date())

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
            dtstart: convertToUTC(startTime),
            //TODO: this causes rrule to provide 'Invalid Date' for the next occurrences - see https://github.com/jakubroztocil/rrule/pull/547
            tzid: Intl.DateTimeFormat().resolvedOptions().timeZone
          })
        : null

    onRecurrenceRuleUpdated(rrule)
  }, [recurrenceDays, recurrenceFrequency, recurrenceInterval, startTime])

  return (
    <RecurrenceSettingsRoot>
      <RecurrenceSettingsTitle>Recurrence</RecurrenceSettingsTitle>
      <RecurrenceFrequencyPickerRoot>
        <span>Repeats every</span>
        <RecurrenceIntervalInput
          type='number'
          min='1'
          max='7'
          defaultValue='1'
          onChange={handleIntervalChange}
        />
        <RecurrenceFrequencySelect onChange={handleFrequencyChange}>
          <option value={Frequency.WEEKLY}>Week</option>
          <option value={Frequency.MONTHLY}>Month</option>
          <option value={Frequency.YEARLY}>Year</option>
        </RecurrenceFrequencySelect>
      </RecurrenceFrequencyPickerRoot>
      <RecurrenceDayPickerRoot>
        {ALL_DAYS.map((day) => (
          <RecurrenceDayCheckBox key={day.name} day={day} onToggle={handleDayChange} />
        ))}
      </RecurrenceDayPickerRoot>
      <HumanReadableRecurrenceRule>
        Your meeting{' '}
        <strong>
          {recurrenceRule ? `will repeat ${recurrenceRule.toText()}` : 'will not repeat'}
        </strong>
      </HumanReadableRecurrenceRule>
    </RecurrenceSettingsRoot>
  )
}
