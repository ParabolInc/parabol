import styled from '@emotion/styled'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import PassSVG from '../../../static/images/icons/no_entry.svg'
import {PokerCards} from '../types/constEnums'
import getPokerCardBackground from '../utils/getPokerCardBackground'
import MiniPokerCardPlaceholder from './MiniPokerCardPlaceholder'
import graphql from 'babel-plugin-relay/macro'
import {MiniPokerCard_scaleValue} from '../__generated__/MiniPokerCard_scaleValue.graphql'
import {PALETTE} from '../styles/paletteV2'
const Card = styled(MiniPokerCardPlaceholder)<{color: string}>(({color}) => ({
  background: getPokerCardBackground(color),
  border: 0,
  color: 'white',
  textShadow: '0px 1px 1px rgba(0, 0, 0, 0.1)'
}))

const Pass = styled('img')({
  display: 'block',
  height: 16,
  width: 16
})

interface Props {
  scaleValue: MiniPokerCard_scaleValue | null
  // required in case viewing an old meeting where the scaleValue no longer exists
  fallbackLabel?: string
}

const MiniPokerCard = (props: Props) => {
  const {fallbackLabel, scaleValue} = props
  const {color, label} = scaleValue || {color: PALETTE.BACKGROUND_GRAY, label: fallbackLabel}
  return (
    <Card color={color}>
      {label === PokerCards.PASS_CARD ? <Pass src={PassSVG} /> : label}
    </Card>
  )
}

export default createFragmentContainer(
  MiniPokerCard,
  {
    scaleValue: graphql`
    fragment MiniPokerCard_scaleValue on TemplateScaleValue {
      color
      label
    }`
  }
)
