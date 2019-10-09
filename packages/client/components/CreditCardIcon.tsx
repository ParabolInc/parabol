import styled from '@emotion/styled'
import React from 'react'
import useSVG from '../hooks/useSVG'
import {BezierCurve} from '../types/constEnums'
import {keyframes} from '@emotion/core'

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
  cardTypeIcon: string
}

const CCDir = `${__STATIC_IMAGES__}/creditCards`

const CreditCardIcon = (props: Props) => {
  const {cardTypeIcon} = props
  const isFallback = cardTypeIcon === 'credit_card'
  const {svg, svgRef} = useSVG(isFallback ? '' : `${CCDir}/${cardTypeIcon}.svg`)
  if (!svg) return null
  return <SVGStyles ref={svgRef} dangerouslySetInnerHTML={{__html: svg}} />
}

export default CreditCardIcon
