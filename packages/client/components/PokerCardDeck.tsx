import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useMemo, useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import useMutationProps from '~/hooks/useMutationProps'
import useAtmosphere from '../hooks/useAtmosphere'
import useForceUpdate from '../hooks/useForceUpdate'
import useInitialRender from '../hooks/useInitialRender'
import usePokerCardLocation from '../hooks/usePokerCardLocation'
import PokerAnnounceDeckHoverMutation from '../mutations/PokerAnnounceDeckHoverMutation'
import VoteForPokerStoryMutation from '../mutations/VoteForPokerStoryMutation'
import {PokerCards} from '../types/constEnums'
import {PokerCardDeck_meeting} from '../__generated__/PokerCardDeck_meeting.graphql'
import PokerCard from './PokerCard'

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

const PokerCardDeck = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {meeting} = props
  const {id: meetingId, localStage} = meeting
  const {dimension, id: stageId} = localStage
  const scores = localStage.scores!
  const isVoting = localStage.isVoting!
  if (!stageId) return <div>No stage ID</div>
  const {selectedScale} = dimension!
  const {values: cards} = selectedScale
  const totalCards = cards.length
  const [isCollapsed, setIsCollapsed] = useState(!isVoting)
  const isInit = useInitialRender()
  const forceUpdate = useForceUpdate()
  // re-render to triger the animation
  useEffect(forceUpdate, [])
  useEffect(() => {
    setIsCollapsed(!isVoting)
  }, [isVoting])
  const tilt = isInit ? 0 : PokerCards.TILT
  const maxHidden = isInit ? 1 : PokerCards.MAX_HIDDEN
  const radius = isInit ? 0 : PokerCards.RADIUS as number
  const selectedIdx = useMemo(() => {
    const userVote = scores.find(({userId}) => userId === viewerId)
    return userVote ? cards.findIndex(({label}) => label === userVote.label) : undefined
  }, [scores])
  const deckRef = useRef<HTMLDivElement>(null)
  const hoveringCardIdRef = useRef('')
  const {yOffset, initialRotation, rotationPerCard} = usePokerCardLocation(totalCards, tilt, maxHidden, radius)
  const {onError, onCompleted, submitMutation, submitting, error} = useMutationProps()
  const onMouseEnter = (cardId: string) => () => {
    if (!hoveringCardIdRef.current) {
      PokerAnnounceDeckHoverMutation(atmosphere, {isHover: true, meetingId, stageId})
    }
    hoveringCardIdRef.current = cardId
  }

  const onMouseLeave = (cardId: string) => () => {
    // leave fires before enter, but we want it to happen after
    // this complexity is necessary because we don't care if they enter/leave the deck, but the individual cards. precision counts!
    setTimeout(() => {
      if (hoveringCardIdRef.current === cardId) {
        hoveringCardIdRef.current = ''
        PokerAnnounceDeckHoverMutation(atmosphere, {isHover: false, meetingId, stageId})
      }
    })
  }


  useEffect(() => {
    if (error) {
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: 'voteError',
        message: error.message || 'Error submitting vote',
        autoDismiss: 5
      })
    }
  }, [error])

  const vote = (score: string | null) => {
    if (submitting) return
    submitMutation()
    if (!isVoting) {
      setIsCollapsed(true)
    }
    VoteForPokerStoryMutation(
      atmosphere,
      {meetingId, stageId, score},
      {onError, onCompleted}
    )
  }

  return (
    <Deck ref={deckRef}>
      {cards.map((card, idx) => {
        const isSelected = selectedIdx === idx
        const {label} = card
        const onClick = () => {
          if (isCollapsed) {
            setIsCollapsed(false)
          } else {
            // if card is selected and clicked again remove vote
            vote(isSelected ? null : label)
          }
        }
        const rotation = initialRotation + rotationPerCard * idx
        return <PokerCard key={card.label} yOffset={yOffset} rotation={rotation} onMouseEnter={onMouseEnter(card.label)} onMouseLeave={onMouseLeave(card.label)} scaleValue={card} idx={idx} totalCards={totalCards} onClick={onClick} isCollapsed={isCollapsed} isSelected={isSelected} deckRef={deckRef} radius={radius} />
      })}
    </Deck>
  )
}

graphql`
  fragment PokerCardDeckStage on EstimateStage {
    id
    isVoting
    dimension {
      selectedScale {
        values {
          ...PokerCard_scaleValue
          label
        }
      }
    }
    scores {
      userId
      label
    }
  }
`
export default createFragmentContainer(
  PokerCardDeck, {
  meeting: graphql`
    fragment PokerCardDeck_meeting on PokerMeeting {
      id
      showSidebar
      phases {
        ... on EstimatePhase {
          stages {
            ...PokerCardDeckStage @relay(mask: false)
          }
        }
      }
      localStage {
        ...PokerCardDeckStage @relay(mask: false)
      }
    }`
}
)
