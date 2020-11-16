import styled from '@emotion/styled'
import React, {useRef, useState} from 'react'
import useBreakpoint from '~/hooks/useBreakpoint'
import {Breakpoint} from '~/types/constEnums'
import useHotkey from '../hooks/useHotkey'
import usePokerDeckLeft from '../hooks/usePokerDeckLeft'
import {PALETTE} from '../styles/paletteV2'
import PokerCard from './PokerCard'

const Deck = styled('div')<{left: number}>(({left}) => ({
  display: 'flex',
  left,
  // justifyContent: 'center',
  position: 'absolute',
  bottom: -32,
  width: '100%',
  zIndex: 1 // TODO remove. needs to be under bottom bar but above dimension bg
}))

interface Props {}

const PokerCardDeck = (props: Props) => {
  const {} = props
  const cards = [
    {label: '1', value: 1, color: PALETTE.BACKGROUND_RED},
    {label: '2', value: 2, color: PALETTE.BACKGROUND_BLUE},
    {label: '3', value: 3, color: PALETTE.BACKGROUND_GREEN},
    {label: '4', value: 4, color: PALETTE.BACKGROUND_YELLOW}
  ]
  const totalCards = cards.length
  const showingSidebars = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const [selectedIdx, setSelectedIdx] = useState<number | undefined>()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const deckRef = useRef<HTMLDivElement>(null)
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }
  useHotkey('c', toggleCollapse)
  const left = usePokerDeckLeft(deckRef, totalCards, showingSidebars)

  return (
    <Deck ref={deckRef} left={left}>
      {cards.map((card, idx) => {
        const isSelected = selectedIdx === idx
        const onClick = () => {
          if (isCollapsed) return
          setSelectedIdx(isSelected ? undefined : idx)
        }
        return (
          <PokerCard
            key={card.value}
            card={card}
            idx={idx}
            totalCards={totalCards}
            onClick={onClick}
            isCollapsed={isCollapsed}
            isSelected={isSelected}
            deckRef={deckRef}
          />
        )
      })}
    </Deck>
  )
}

export default PokerCardDeck
