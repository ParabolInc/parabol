import styled from '@emotion/styled'
import React, {useState} from 'react'
import {PALETTE} from '../styles/paletteV2'
import PokerCard from './PokerCard'

const Deck = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  position: 'absolute',
  bottom: -32,
  width: '100%',
  zIndex: 1 // TODO remove. needs to be under bottom bar but above dimension bg
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

  const [selectedIdx, setSelectedIdx] = useState<number>()
  // const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <Deck>
      {cards.map((card, idx) => {
        const isSelected = selectedIdx === idx
        const onClick = () => {
          setSelectedIdx(idx)
        }
        return <PokerCard key={card.value} card={card} idx={idx} totalCards={cards.length} onClick={onClick} isSelected={isSelected} />
      })}
    </Deck>
  )
}

export default PokerCardDeck
