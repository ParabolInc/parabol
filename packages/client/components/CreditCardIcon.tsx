import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '../styles/paletteV2'
import Icon from './Icon'
import useSVG from '../hooks/useSVG'

const Background = styled('div')({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: PALETTE.TEXT_LIGHT,
  borderRadius: '100%',
  height: 64,
  justifyContent: 'center',
  margin: '0 0 .5rem',
  width: 64
})

const FallbackIcon = styled(Icon)({
  color: '#fff',
  fontSize: 40
})

const SVGStyles = styled('div')({
  width: 40,
  height: 40
})

interface Props {
  cardTypeIcon: string
}

const CCDir =  `${__STATIC_IMAGES__}/creditCards`

const CreditCardIcon = (props: Props) => {
  const {cardTypeIcon} = props
  const isFallback = cardTypeIcon === 'credit_card'
  const {svg, svgRef} = useSVG(isFallback ? '' : `${CCDir}/${cardTypeIcon}.svg`, (svgEl: SVGElement) => {
    const path = svgEl.firstChild as SVGPathElement
    path.setAttribute('fill', 'white')
  })

  return (
    <Background>
      {isFallback || !svg ? <FallbackIcon>credit_card</FallbackIcon> : <SVGStyles ref={svgRef} dangerouslySetInnerHTML={{__html: svg}}/>}
    </Background>


  )
}

export default CreditCardIcon
