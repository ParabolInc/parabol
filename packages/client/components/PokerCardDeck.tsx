import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '../styles/paletteV2'
import PokerCard from './PokerCard'

const Deck = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  position: 'absolute',
  bottom: -32,
  width: '100%',
  zIndex: 999 // TODO remove
})
interface Props {

}

const PokerCardDeck = (props: Props) => {
  const {} = props
  const cards = [
    {label: '1', value: 1, color: PALETTE.BACKGROUND_RED},
    {label: '2', value: 2, color: PALETTE.BACKGROUND_BLUE},
    {label: '3', value: 3, color: PALETTE.BACKGROUND_GREEN},
  ]

  return (
    <Deck>
      {cards.map((card) => {
        return <PokerCard key={card.value} card={card} />
      })}
    </Deck>
  )
}

export default PokerCardDeck
