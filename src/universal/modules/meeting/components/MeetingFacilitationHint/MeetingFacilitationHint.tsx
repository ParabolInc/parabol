import React from 'react'
import Ellipsis from 'universal/components/Ellipsis/Ellipsis'
import styled from 'react-emotion'
import {PALETTE} from 'universal/styles/paletteV2'

const Hint = styled('div')({
  color: PALETTE.TEXT.LIGHT,
  display: 'inline-block',
  fontSize: 13,
  lineHeight: '20px',
  textAlign: 'center'
})
const MeetingFacilitationHint = (props) => {
  const {children} = props
  return (
    <Hint>
      {'('}
      {children}
      <Ellipsis />
      {')'}
    </Hint>
  )
}

export default MeetingFacilitationHint
