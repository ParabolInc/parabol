import {keyframes} from '@emotion/core'
import styled from '@emotion/styled'
import React from 'react'
import ccAmex from '../../../static/images/creditCards/cc-amex-brands.svg'
import ccDiners from '../../../static/images/creditCards/cc-diners-club-brands.svg'
import ccDiscover from '../../../static/images/creditCards/cc-discover-brands.svg'
import ccJCB from '../../../static/images/creditCards/cc-jcb-brands.svg'
import ccMastercard from '../../../static/images/creditCards/cc-mastercard-brands.svg'
import ccVisa from '../../../static/images/creditCards/cc-visa-brands.svg'
import useSVG from '../hooks/useSVG'
import {BezierCurve} from '../types/constEnums'
import {CardTypeIcon} from '../utils/StripeClientManager'

const cardTypeIconToFilename = {
  'cc-amex-brands': ccAmex,
  'cc-diners-club-brands': ccDiners,
  'cc-discover-brands': ccDiscover,
  'cc-jcb-brands': ccJCB,
  'cc-mastercard-brands': ccMastercard,
  'cc-visa-brands': ccVisa,
  credit_card: ''
} as Record<CardTypeIcon, string>

const keyframesOpacity = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}`

const SVGStyles = styled('div')({
  animationName: keyframesOpacity.toString(),
  animationDuration: '300ms',
  animationTimingFunction: BezierCurve.DECELERATE,
  width: 36,
  height: 24,
  opacity: 1
})

interface Props {
  cardTypeIcon: CardTypeIcon
}

const CreditCardIcon = (props: Props) => {
  const {cardTypeIcon} = props
  const icon = cardTypeIconToFilename[cardTypeIcon]
  const {svg, svgRef} = useSVG(icon)
  if (!svg) return null
  return <SVGStyles ref={svgRef} dangerouslySetInnerHTML={{__html: svg}} />
}

export default CreditCardIcon
