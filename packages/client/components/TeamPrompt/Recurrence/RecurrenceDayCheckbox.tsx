import styled from '@emotion/styled'
import React from 'react'
import {Weekday} from 'rrule'
import {PALETTE} from '../../../styles/paletteV3'

type DayFullName =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday'

export type Day = {
  name: DayFullName
  shortName: string
  abbreviation: string
  rruleVal: Weekday
  intVal: number
  isWeekday: boolean
}

export const CheckboxRoot = styled('div')({
  position: 'relative',
  width: 46,
  height: 46
})

export const StyledCheckbox = styled('input')({
  appearance: 'none',
  margin: 0,
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  border: `1px solid ${PALETTE.SLATE_400}`,
  borderRadius: 8,
  '&:checked': {
    border: `1px solid ${PALETTE.SKY_500}`,
    backgroundColor: PALETTE.SKY_500
  },
  ':hover, :focus, :focus-visible, :active': {
    outline: `1px solid ${PALETTE.SLATE_500}`,
    borderRadius: 4
  }
})

export const StyledCheckboxLabel = styled('label')<{isChecked: boolean}>(({isChecked}) => ({
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

export interface Props {
  day: Day
  isChecked: boolean
  onToggle: (day: Day) => void
}

export const RecurrenceDayCheckbox = (props: Props) => {
  const {day, onToggle, isChecked} = props
  const toggle = () => {
    onToggle(day)
  }

  return (
    <CheckboxRoot>
      <StyledCheckbox
        type='checkbox'
        id={day.name}
        name={day.abbreviation}
        checked={isChecked}
        onChange={toggle}
      />
      <StyledCheckboxLabel htmlFor={day.name} isChecked={isChecked}>
        {day.abbreviation}
      </StyledCheckboxLabel>
    </CheckboxRoot>
  )
}
