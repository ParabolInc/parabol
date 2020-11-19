import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import styled from '@emotion/styled'
import MiniPokerCardPlaceholder from './MiniPokerCardPlaceholder'
import MiniPokerCard from './MiniPokerCard'
import {PALETTE} from '~/styles/paletteV2'
import {createFragmentContainer} from 'react-relay'
import {PokerDimensionValueStatic_scaleValue} from '../__generated__/PokerDimensionValueStatic_scaleValue.graphql'

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
  scaleValue: PokerDimensionValueStatic_scaleValue | null
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

export default createFragmentContainer(
  PokerDimensionValueStatic,
  {
    scaleValue: graphql`
    fragment PokerDimensionValueStatic_scaleValue on TemplateScaleValue {
      ...MiniPokerCard_scaleValue
    }`
  }
)
