import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useHotkey from '../hooks/useHotkey'
import PokerAnnounceDeckHoverMutation from '../mutations/PokerAnnounceDeckHoverMutation'
import {PALETTE} from '../styles/paletteV2'
import {PokerCards} from '../types/constEnums'
import getRotatedBBox from '../utils/getRotatedBBox'
import {PokerCardDeck_meeting} from '../__generated__/PokerCardDeck_meeting.graphql'
import PokerCard from './PokerCard'

const Deck = styled('div')({
  display: 'flex',
  left: '50%',
  position: 'absolute',
  bottom: 0,
  width: '100%',
  zIndex: 1 // TODO remove. needs to be under bottom bar but above dimension bg
})
interface Props {
  meeting: PokerCardDeck_meeting
}

const MAX_HIDDEN = .3 // The max % of the card that can be hidden below the fold

const PokerCardDeck = (props: Props) => {
  const {meeting} = props
  const {id: meetingId, localStage, showSidebar} = meeting
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
    {label: '13', value: 13, color: PALETTE.BACKGROUND_RED}
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
      console.log({
        leaving: cardId,
        ref: hoveringCardIdRef.current,
        announce: hoveringCardIdRef.current === cardId,
        isHover: false
      })
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

  const [radius, setRadius] = useState(400)
  useHotkey('q', () => {
    const nextRadius = Math.max(0, radius - 10)
    setRadius(nextRadius)
  })
  useHotkey('w', () => {
    const nextRadius = Math.min(1500, radius + 10)
    setRadius(nextRadius)
  })
  const [tilt, setTilt] = useState(30)
  useHotkey('e', () => {
    const nextTilt = Math.max(0, tilt - 1)
    setTilt(nextTilt)
  })
  useHotkey('r', () => {
    const nextTilt = Math.min(90, tilt + 1)
    setTilt(nextTilt)
  })

  // const left = usePokerDeckLeft(deckRef, totalCards, showSidebar)

  const maxSpreadDeg = tilt * 2
  const rotationPerCard = maxSpreadDeg / totalCards
  const initialRotation = (totalCards - 1) / 2 * -rotationPerCard
  const {height} = getRotatedBBox(tilt, PokerCards.WIDTH, PokerCards.HEIGHT)
  const pxBelowFold = height * (1 - MAX_HIDDEN)
  const yOffset = radius * Math.cos((initialRotation * Math.PI) / 180) - pxBelowFold

  return (
    <Deck ref={deckRef}>
      {cards.map((card, idx) => {
        const isSelected = selectedIdx === idx
        const onClick = () => {
          if (isCollapsed) return
          setSelectedIdx(isSelected ? undefined : idx)
        }
        const rotation = initialRotation + rotationPerCard * idx
        return <PokerCard yOffset={yOffset} rotation={rotation} radius={radius} onMouseEnter={onMouseEnter(card.label)} onMouseLeave={onMouseLeave(card.label)} key={card.value} card={card} idx={idx} totalCards={totalCards} onClick={onClick} isCollapsed={isCollapsed} isSelected={isSelected} deckRef={deckRef} />
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
  }
`
export default createFragmentContainer(PokerCardDeck, {
  meeting: graphql`
    fragment PokerCardDeck_meeting on PokerMeeting {
      id
      showSidebar
      localStage {
        ...PokerCardDeckStage @relay(mask: false)
      }
      phases {
        stages {
          ...PokerCardDeckStage @relay(mask: false)
        }
      }
    }
  `
})
