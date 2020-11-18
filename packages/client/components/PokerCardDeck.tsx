import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import useHotkey from '../hooks/useHotkey'
import PokerAnnounceDeckHoverMutation from '../mutations/PokerAnnounceDeckHoverMutation'
import {PokerCards} from '../types/constEnums'
import getRotatedBBox from '../utils/getRotatedBBox'
import {PokerCardDeck_meeting} from '../__generated__/PokerCardDeck_meeting.graphql'
import PokerCard from './PokerCard'
import useMutationProps from '~/hooks/useMutationProps'
import VoteForPokerStoryMutation from '../mutations/VoteForPokerStoryMutation'
import useAtmosphere from '../hooks/useAtmosphere'
import getGraphQLError from '~/utils/relay/getGraphQLError'
import Atmosphere from '~/Atmosphere'

const Deck = styled('div')({
  bottom: 0,
  display: 'flex',
  left: '45%',
  position: 'absolute',
  width: '100%',
  zIndex: 1 // TODO remove. needs to be under bottom bar but above dimension bg
})

interface Props {
  meeting: PokerCardDeck_meeting
}

const MAX_HIDDEN = .35

const makeHandleCompleted = (onCompleted: () => void, atmosphere: Atmosphere) => (res, errors) => {
  onCompleted()
  const error = getGraphQLError(res, errors)
  if (error) {
    atmosphere.eventEmitter.emit('addSnackbar', {
      key: 'voteError',
      message: error.message || 'Error submitting vote',
      autoDismiss: 5
    })
  }
}

const PokerCardDeck = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {viewerId: userId} = atmosphere
  const {meeting} = props
  const {id: meetingId, localStage, showSidebar} = meeting
  console.log(showSidebar, 'showSidebar')
  const {dimension, scores, id: stageId} = localStage
  if (!stageId) return <div>No stage ID</div>
  const {selectedScale} = dimension!
  const {values: cards} = selectedScale
  const totalCards = cards.length

  const maybeGetUserVoteValueIdx = () => {
    const userVote = scores!.find(({userId: scoreUserId}) => userId === scoreUserId)
    if (!userVote) return undefined
    const {value: userVoteValue} = userVote
    const idx = cards.findIndex(({value}) => value === userVoteValue)
    return idx
  }
  const userVoteValueIdx = maybeGetUserVoteValueIdx()

  const [selectedIdx, setSelectedIdx] = useState<number | undefined>(userVoteValueIdx)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const deckRef = useRef<HTMLDivElement>(null)
  const hoveringCardIdRef = useRef('')
  const onMouseEnter = (cardId: string) => () => {
    if (!hoveringCardIdRef.current) {
      PokerAnnounceDeckHoverMutation(atmosphere, {isHover: true, meetingId, stageId})
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
        PokerAnnounceDeckHoverMutation(atmosphere, {isHover: false, meetingId, stageId})
      }
    })
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }
  useHotkey('c', toggleCollapse)

  const radius = 1200
  const tilt = 8

  const maxSpreadDeg = tilt * 2
  const rotationPerCard = maxSpreadDeg / totalCards
  const initialRotation = (totalCards - 1) / 2 * -rotationPerCard
  const {height} = getRotatedBBox(tilt, PokerCards.WIDTH, PokerCards.HEIGHT)
  const pxBelowFold = height * (1 - MAX_HIDDEN)
  const yOffset = radius * Math.cos((initialRotation * Math.PI) / 180) - pxBelowFold

  const {onError, onCompleted, submitMutation} = useMutationProps()
  const vote = (score: number | null) => {
    // voteForPokerStory score is the value field of EstimateUserScore
    submitMutation()
    const handleCompleted = makeHandleCompleted(onCompleted, atmosphere)
    VoteForPokerStoryMutation(
      atmosphere,
      {meetingId, stageId, score},
      {onError, onCompleted: handleCompleted}
    )
  }

  return (
    <Deck ref={deckRef}>
      {cards.map((card, idx) => {
        const isSelected = selectedIdx === idx
        const {value} = card
        const onClick = () => {
          if (isCollapsed) return
          setSelectedIdx(isSelected ? undefined : idx)
          // if card is selected and clicked again remove vote
          vote(isSelected ? null : value)
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
export default createFragmentContainer(
  PokerCardDeck, {
  meeting: graphql`
    fragment PokerCardDeck_meeting on PokerMeeting {
      id
      showSidebar
      localStage {
        ...PokerCardDeckStage @relay(mask: false)
        ... on EstimateStage {
          id
          dimension {
            selectedScale {
              values {
                color
                label
                value
              }
            }
          }
          scores {
            userId
            label
            value
          }
        }
      }
    }`
}
)
