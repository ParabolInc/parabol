import styled from '@emotion/styled'
import dayjs from 'dayjs'
import React, {useEffect, useState} from 'react'
import {Frequency, RRule} from 'rrule'
import {MenuPosition} from '../../../hooks/useCoords'
import useMenu from '../../../hooks/useMenu'
import {PALETTE} from '../../../styles/paletteV3'
import DropdownMenuToggle from '../../DropdownMenuToggle'
import {Day, RecurrenceDayCheckBox} from './RecurrenceDayCheckBox'
import {RecurrenceTimePicker} from './RecurrenceTimePicker'

export const ALL_DAYS: Day[] = [
  {name: 'Monday', short: 'M', rruleVal: RRule.MO},
  {name: 'Tuesday', short: 'T', rruleVal: RRule.TU},
  {name: 'Wednesday', short: 'W', rruleVal: RRule.WE},
  {name: 'Thursday', short: 'T', rruleVal: RRule.TH},
  {name: 'Friday', short: 'F', rruleVal: RRule.FR},
  {name: 'Saturday', short: 'S', rruleVal: RRule.SA},
  {name: 'Sunday', short: 'S', rruleVal: RRule.SU}
]

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
  '&:hover,:focus': {
    borderColor: PALETTE.SLATE_600
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

const Toggle = styled(DropdownMenuToggle)({
  fontSize: 14,
  width: '100%',
  marginTop: 16
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

interface Props {
  onRecurrenceRuleUpdated: (rrule: RRule | null) => void
  recurrenceRule: RRule | null
}

export const RecurrenceSettings = (props: Props) => {
  const {onRecurrenceRuleUpdated, recurrenceRule} = props
  const [recurrenceInterval, setRecurrenceInterval] = React.useState(
    recurrenceRule ? recurrenceRule.options.interval : 1
  )
  const [recurrenceFrequency, setRecurrenceFrequency] = useState(
    recurrenceRule ? recurrenceRule.options.freq : RRule.WEEKLY
  )
  const [recurrenceDays, setRecurrenceDays] = React.useState<Day[]>([])
  const [startTime, setStartTime] = React.useState<Date>(
    dayjs()
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
      id: 'RecurrenceStartTimePicker',
      parentId: 'newMeetingRoot',
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
            dtstart: convertToUTC(startTime),
            //TODO: this causes rrule to provide 'Invalid Date' for the next occurrences - see https://github.com/jakubroztocil/rrule/pull/547
            tzid: timeZone
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
          {recurrenceRule ? `will restart ${recurrenceRule.toText()}` : 'will not restart'}
        </strong>
      </HumanReadableRecurrenceRule>
      <>
        <Toggle
          defaultText={`${dayjs(startTime).format('h:mm A')} (${timeZone})`}
          onClick={togglePortal}
          ref={originRef}
          size='small'
        />
        {menuPortal(<RecurrenceTimePicker menuProps={menuProps} onClick={setStartTime} />)}
      </>
    </RecurrenceSettingsRoot>
  )
}
