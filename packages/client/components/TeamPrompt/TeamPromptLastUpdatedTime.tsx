import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '../../styles/paletteV3'
import relativeDate from '../../utils/date/relativeDate'

const Timestamp = styled('div')({
  color: PALETTE.SLATE_600,
  fontWeight: 600,
  fontSize: 12
})

interface Props {
  createdAt: string | Date
  updatedAt: string | Date
}

export default function LastUpdatedTime({updatedAt, createdAt}: Props) {
  const isEdited = createdAt !== updatedAt
  const formattedTime = updatedAt ? relativeDate(updatedAt) : relativeDate(createdAt)
  return (
    <Timestamp>
      {formattedTime}
      {isEdited && <span> · Edited</span>}
    </Timestamp>
  )
}
