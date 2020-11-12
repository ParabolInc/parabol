import styled from '@emotion/styled'
import React, {useRef, useState} from 'react'
import useAtmosphere from '../hooks/useAtmosphere'
import useHotkey from '../hooks/useHotkey'
import usePokerDeckLeft from '../hooks/usePokerDeckLeft'
import {PALETTE} from '../styles/paletteV2'
import PokerCard from './PokerCard'
import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import PokerAnnounceDeckHoverMutation from '../mutations/PokerAnnounceDeckHoverMutation'
import {PokerCardDeck_meeting} from '../__generated__/PokerCardDeck_meeting.graphql'
const Deck = styled('div')<{left: number}>(({left}) => ({
  display: 'flex',
  left,
  // justifyContent: 'center',
  position: 'absolute',
  bottom: -32,
  width: '100%',
  zIndex: 1 // TODO remove. needs to be under bottom bar but above dimension bg
}))
interface Props {
  meeting: PokerCardDeck_meeting
}

const PokerCardDeck = (props: Props) => {
  const {meeting} = props
  const {id: meetingId, localStage} = meeting
  const stageId = localStage.id!
  const cards = [
    {label: '1', value: 1, color: PALETTE.BACKGROUND_RED},
    {label: '2', value: 2, color: PALETTE.BACKGROUND_BLUE},
    {label: '3', value: 3, color: PALETTE.BACKGROUND_GREEN},
    {label: '4', value: 4, color: PALETTE.BACKGROUND_YELLOW},
    {label: '5', value: 5, color: PALETTE.BACKGROUND_RED},
    {label: '6', value: 6, color: PALETTE.BACKGROUND_BLUE},
    {label: '7', value: 7, color: PALETTE.BACKGROUND_GREEN},
    {label: '8', value: 8, color: PALETTE.BACKGROUND_YELLOW},
    {label: '9', value: 9, color: PALETTE.BACKGROUND_RED},
    {label: '10', value: 10, color: PALETTE.BACKGROUND_BLUE},
    {label: '11', value: 11, color: PALETTE.BACKGROUND_GREEN},
    {label: '12', value: 12, color: PALETTE.BACKGROUND_YELLOW},
    {label: '13', value: 13, color: PALETTE.BACKGROUND_RED},
  ]
  const totalCards = cards.length
  const [selectedIdx, setSelectedIdx] = useState<number | undefined>()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const deckRef = useRef<HTMLDivElement>(null)
  const hoveringCardIdRef = useRef('')
  const atmosphere = useAtmosphere()
  const onMouseEnter = (cardId: string) => () => {
    if (!hoveringCardIdRef.current) {
      PokerAnnounceDeckHoverMutation(atmosphere, {isHover: true, meetingId, stageId: stageId})
    }
    hoveringCardIdRef.current = cardId
  }

  const onMouseLeave = (cardId: string) => () => {
    // leave fires before enter, but we want it to happen after
    // this complexity is necessary because we don't care if the enter/leave the deck, but the individual cards. precision counts!
    setTimeout(() => {
      console.log({leaving: cardId, ref: hoveringCardIdRef.current, announce: hoveringCardIdRef.current === cardId, isHover: false})
      if (hoveringCardIdRef.current === cardId) {
        hoveringCardIdRef.current = ''
        PokerAnnounceDeckHoverMutation(atmosphere, {isHover: false, meetingId, stageId: stageId})
      }
    })
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }
  useHotkey('c', toggleCollapse)
  const left = usePokerDeckLeft(deckRef, totalCards)

  return (
    <Deck ref={deckRef} left={left}>
      {cards.map((card, idx) => {
        const isSelected = selectedIdx === idx
        const onClick = () => {
          if (isCollapsed) return
          setSelectedIdx(isSelected ? undefined : idx)
        }
        return <PokerCard onMouseEnter={onMouseEnter(card.label)} onMouseLeave={onMouseLeave(card.label)} key={card.value} card={card} idx={idx} totalCards={totalCards} onClick={onClick} isCollapsed={isCollapsed} isSelected={isSelected} deckRef={deckRef} />
      })}
    </Deck>
  )
}

graphql`
fragment PokerCardDeckStage on EstimateStage {
  id
  hoveringUsers {
    id
  }
}`
export default createFragmentContainer(
  PokerCardDeck,
  {
    meeting: graphql`
      fragment PokerCardDeck_meeting on PokerMeeting {
        id
        localStage {
          ...PokerCardDeckStage @relay(mask: false)
        }
        phases {
          stages {
            ...PokerCardDeckStage @relay(mask: false)
          }
        }
      }`
  }
)
