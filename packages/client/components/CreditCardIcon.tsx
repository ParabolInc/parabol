import styled from '@emotion/styled'
import React, {useEffect, useState} from 'react'
import SVG from './SVG'
import {PALETTE} from '../styles/paletteV2'
import Icon from './Icon'

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

const SVGStyles = styled(SVG)<{isReady: boolean}>(({isReady}) => ({
  width: isReady ? 40 : 0,
  height: 40
}))

interface Props {
  cardTypeIcon: string
}

const CCDir =  `${__STATIC_IMAGES__}/creditCards`

const CreditCardIcon = (props: Props) => {
  const {cardTypeIcon} = props
  const [isReady, setIsReady] = useState(false)
  const isFallback = cardTypeIcon === 'credit_card'
  useEffect(() => {
    if (isFallback) {
      setIsReady(false)
    }
  }, [isFallback])

  const setLayout = (svgEl: SVGElement) => {
    const path = svgEl.firstChild as SVGPathElement
    path.setAttribute('fill', 'white')
    setIsReady(true)
  }

  return (
    <Background>
      {isFallback || !isReady ? <FallbackIcon>credit_card</FallbackIcon> : null}
      {!isFallback && <SVGStyles isReady={isReady} src={`${CCDir}/${cardTypeIcon}.svg`} setLayout={setLayout} />}
    </Background>


  )
}

export default CreditCardIcon
