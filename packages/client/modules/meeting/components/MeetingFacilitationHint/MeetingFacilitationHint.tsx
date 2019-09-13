import React from 'react'
import Ellipsis from '../../../../components/Ellipsis/Ellipsis'
import styled from '@emotion/styled'
import {PALETTE} from '../../../../styles/paletteV2'

const Hint = styled('div')({
  color: PALETTE.TEXT_GRAY,
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
