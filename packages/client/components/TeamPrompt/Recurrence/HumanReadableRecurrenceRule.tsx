import styled from '@emotion/styled'
import React, {useMemo} from 'react'
import {RRule} from 'rrule'
import {PALETTE} from '../../../styles/paletteV3'

const HumanReadableRecurrenceRuleHeading = styled('h2')({
  fontSize: 14,
  fontWeight: 400,
  lineHeight: '14px',
  margin: `4px 0px 0px 0px`,
  color: PALETTE.SLATE_700
})

interface Props {
  recurrenceRule: string
}

export const HumanReadableRecurrenceRule = ({recurrenceRule}: Props) => {
  const humanReadableText = useMemo(() => {
    return RRule.fromString(recurrenceRule).toText()
  }, [recurrenceRule])

  return (
    <HumanReadableRecurrenceRuleHeading>
      Recurs {humanReadableText}
    </HumanReadableRecurrenceRuleHeading>
  )
}
