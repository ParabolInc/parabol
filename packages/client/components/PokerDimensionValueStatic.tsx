import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '~/styles/paletteV2'
import MiniPokerCard from './MiniPokerCard'

const Wrapper = styled('div')({
  alignItems: 'center',
  // FIXME: WE HAVE TOO MANY COLORS
  backgroundColor: '#D4CFE2',
  borderRadius: 4,
  display: 'flex',
  margin: '0 8px',
  padding: 8
})

const Label = styled('label')({
  color: PALETTE.TEXT_MAIN,
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '24px',
  margin: '0 0 0 16px',
  padding: 0
})

interface Props {
  color?: string | null
  label: string | null
}

const PokerDimensionValueStatic = (props: Props) => {
  const {color, label} = props
  return (
    <Wrapper>
      <MiniPokerCard color={color || '#fff'}>{label || '?'}</MiniPokerCard>
      <Label>Final Value</Label>
    </Wrapper>
  )
}

export default PokerDimensionValueStatic
