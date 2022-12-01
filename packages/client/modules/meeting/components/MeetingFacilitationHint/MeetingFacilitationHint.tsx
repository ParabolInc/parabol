import styled from '@emotion/styled'
import React, {ReactNode} from 'react'
import Ellipsis from '../../../../components/Ellipsis/Ellipsis'
import {PALETTE} from '../../../../styles/paletteV3'

const Hint = styled('div')({
  color: PALETTE.SLATE_600,
  display: 'inline-block',
  fontSize: 13,
  lineHeight: '20px',
  textAlign: 'center'
})

interface Props {
  children: ReactNode
}

const MeetingFacilitationHint = (props: Props) => {
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
