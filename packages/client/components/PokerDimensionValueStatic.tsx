import React from 'react'
import styled from '@emotion/styled'
import MiniPokerCardPlaceholder from './MiniPokerCardPlaceholder'
import MiniPokerCard from './MiniPokerCard'
import {PALETTE} from '~/styles/paletteV2'

const Wrapper = styled('div')({
  alignItems: 'center',
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
  scaleValue?: any
}

const PokerDimensionValueStatic = (props: Props) => {
  const {scaleValue} = props
  return (
    <Wrapper>
      {scaleValue
        ? <MiniPokerCard scaleValue={scaleValue} />
        : <MiniPokerCardPlaceholder>{'?'}</MiniPokerCardPlaceholder>
      }
      <Label>Final Value</Label>
    </Wrapper>
  )
}

export default PokerDimensionValueStatic
