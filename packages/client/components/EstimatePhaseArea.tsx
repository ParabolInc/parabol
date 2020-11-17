import React, {useRef, useState} from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '~/styles/paletteV2'
import SwipeableViews from 'react-swipeable-views'
import useBreakpoint from '~/hooks/useBreakpoint'
import EstimateDimensionColumn from './EstimateDimensionColumn'
import {Breakpoint, DiscussionThreadEnum} from '~/types/constEnums'
import PokerCardDeck from './PokerCardDeck'
import DeckActivityAvatars from './DeckActivityAvatars'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {EstimatePhaseArea_meeting} from '~/__generated__/EstimatePhaseArea_meeting.graphql'


const EstimateArea = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  width: '100%'
})

const StepperDots = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  display: 'flex',
  justifyContent: 'center',
  padding: '4px 0 8px',
  width: isDesktop ? `calc(100% - ${DiscussionThreadEnum.WIDTH}px)` : '100%'
}))

const StepperDot = styled('div')<{isActive: boolean}>(({isActive}) => ({
  backgroundColor: isActive ? PALETTE.TEXT_PURPLE : PALETTE.TEXT_GRAY,
  borderRadius: '50%',
  height: 8,
  margin: '0 2px',
  opacity: isActive ? undefined : 0.35,
  width: 8
}))

const SwipableEstimateItem = styled('div')({
  borderRadius: '8px 8px 0 0',
  background: PALETTE.BACKGROUND_REFLECTION,
  height: '100%'
})

const innerStyle = (isDesktop: boolean) => {
  return {
    height: '100%',
    margin: isDesktop ? '0 auto' : null,
    maxWidth: isDesktop ? 656 : null,
    // maxWidth: 816,
    padding: isDesktop ? '0 80px' : '0 16px',
    width: '100%',
    overflow: 'visible'
  }
}

const containerStyle = {
  height: '100%'
}

interface Props {
  meeting: EstimatePhaseArea_meeting
}

const EstimatePhaseArea = (props: Props) => {
  const {meeting} = props
  const {localStage, phases} = meeting
  const [activeIdx, setActiveIdx] = useState(1)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)

  console.log(meeting, 'area meeting')

  const {stages} = phases!.find(({phaseType}) => phaseType === 'ESTIMATE')!
  const dimensionStages = stages?.filter(({story}) => (story.id === localStage.story!.id))

  console.log(dimensionStages, 'dimensionStages')
  console.dir(dimensionStages)

  const onChangeIdx = (idx: number) => {
    setActiveIdx(idx)
  }

  const avatarRef = useRef<{[userId: string]: HTMLDivElement}>({})

  const getVotedUserEl = (userId: string) => {
    return avatarRef.current[userId]
  }

  const setVotedUserEl = (userId: string, el: HTMLDivElement) => {
    avatarRef.current[userId] = el
  }

  const slideContainer = {
    padding: isDesktop ? '0 8px' : '0 4px'
  }

  return (
    <EstimateArea>
      <StepperDots isDesktop={isDesktop}>
        {dimensionStages!.map((_, idx) => {
          return <StepperDot key={idx} isActive={idx === activeIdx} />
        })}
      </StepperDots>
      <PokerCardDeck meeting={meeting} />
      <DeckActivityAvatars stage={localStage} getVotedUserEl={getVotedUserEl} />
      <SwipeableViews
        containerStyle={containerStyle}
        enableMouseEvents
        index={activeIdx}
        onChangeIndex={onChangeIdx}
        slideStyle={slideContainer}
        style={innerStyle(isDesktop)}
      >
        {dimensionStages!.map((stage, idx) => (
          <SwipableEstimateItem key={idx}>
            <EstimateDimensionColumn meeting={meeting} setVotedUserEl={setVotedUserEl} stage={stage} />
          </SwipableEstimateItem>
        ))}
      </SwipeableViews>
    </EstimateArea >
  )
}

export default createFragmentContainer(EstimatePhaseArea, {
  meeting: graphql`
    fragment EstimatePhaseArea_meeting on PokerMeeting {
      ...PokerCardDeck_meeting
      ...EstimateDimensionColumn_meeting
      localStage {
        ... on EstimateStage {
          ...DeckActivityAvatars_stage
          story {
            id
          }
        }
      }
      phases {
        ... on EstimatePhase {
          phaseType
          stages {
            ... on EstimateStage {
              ...DeckActivityAvatars_stage
              ...EstimateDimensionColumn_stage
              story {
                id
              }
            }
          }
        }
      }
    }
  `
})
