import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useHotkey from '../hooks/useHotkey'
import PokerAnnounceDeckHoverMutation from '../mutations/PokerAnnounceDeckHoverMutation'
import {PokerCards} from '../types/constEnums'
import getRotatedBBox from '../utils/getRotatedBBox'
import {PokerCardDeck_meeting} from '../__generated__/PokerCardDeck_meeting.graphql'
import PokerCard from './PokerCard'
import useMutationProps from '~/hooks/useMutationProps'
import VoteForPokerStoryMutation from '../mutations/VoteForPokerStoryMutation'
import getGraphQLError from '~/utils/relay/getGraphQLError'
import Atmosphere from '~/Atmosphere'

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
  const {id: meetingId, localStage, showSidebar, settings, phases} = meeting
  const stageId = localStage.id!
  const {stages} = phases!.find(({phaseType}) => phaseType === 'ESTIMATE')!
  const stage = stages.find(({id}) => id === stageId)
  const {dimensionId, scores} = stage
  const {selectedTemplate} = settings
  const {dimensions} = selectedTemplate
  const {selectedScale} = dimensions.find(({id}) => id === dimensionId)
  const {values: cards} = selectedScale
  const totalCards = cards.length

  const maybeGetUserVoteValueIdx = () => {
    const userVote = scores.find(({userId: scoreUserId}) => userId === scoreUserId)
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

  // const left = usePokerDeckLeft(deckRef, totalCards, showSidebar)

  const {onError, onCompleted, submitMutation} = useMutationProps()
  const vote = (score: number) => {
    // score is the value field of EstimateUserScore
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
          // todo: is there a way in the mutation to remove a vote?
          //       if the user taps a card, then taps the same card what happens?
          if (isCollapsed || isSelected) return
          setSelectedIdx(isSelected ? undefined : idx)
          vote(value)
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
      settings {
        selectedTemplate {
          dimensions {
            id
            selectedScale {
              values {
                color
                label
                value
              }
            }
          }
        }
      }
      localStage {
        ...PokerCardDeckStage @relay(mask: false)
        id
      }
      phases {
        phaseType
        stages {
          ... on EstimateStage {
            ...PokerCardDeckStage @relay(mask: false)
            id
            dimensionId
            scores {
              userId
              value
              label
            }
          }
        }
      }
    }`
}
)
