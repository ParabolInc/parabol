import React, {useRef, useState} from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '~/styles/paletteV2'
import SwipeableViews from 'react-swipeable-views'
import useBreakpoint from '~/hooks/useBreakpoint'
import {Breakpoint} from '~/types/constEnums'
import EstimatePhaseDimensionColumn from './EstimatePhaseDimensionColumn'
import PokerCardDeck from './PokerCardDeck'
import DeckActivityAvatars from './DeckActivityAvatars'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {EstimatePhaseArea_meeting} from '../__generated__/EstimatePhaseArea_meeting.graphql'
import getDemoAvatar from '~/utils/getDemoAvatar'

const EstimateArea = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  width: '100%'
})

const StepperDots = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  padding: '4px 0 8px'
})

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
  const {localStage} = meeting
  const [activeIdx, setActiveIdx] = useState(1)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)

  const onChangeIdx = (idx) => {
    setActiveIdx(idx)
  }

  const avatarRef = useRef<{[userId: string]: HTMLDivElement}>({})

  const getVotedUserEl = (userId: string) => {
    // mock Element
    return avatarRef.current[userId]
  }

  const setVotedUserEl = (userId: string, el: HTMLDivElement) => {
    // userId param for?
    console.log(userId, 'setVotedUserEl userId param')
    avatarRef.current.userId = el
  }

  const mockMember1 = {
    ...getDemoAvatar(1),
    userId: 1
  }

  const mockMember2 = {
    ...getDemoAvatar(2),
    userId: 2
  }

  const mockMember3 = {
    ...getDemoAvatar(3),
    userId: 3
  }

  const mockMember4 = {
    ...getDemoAvatar(4),
    userId: 4
  }

  const mockMember5 = {
    ...getDemoAvatar(5),
    userId: 5
  }

  const mockMember6 = {
    ...getDemoAvatar(6),
    userId: 6
  }

  const mockMember7 = {
    ...getDemoAvatar(7),
    userId: 7
  }

  const mockMember8 = {
    ...getDemoAvatar(8),
    userId: 8
  }

  const mockMember9 = {
    ...getDemoAvatar(9),
    userId: 9
  }

  const mockMember10 = {
    ...getDemoAvatar(10),
    userId: 10
  }

  const mockMember11 = {
    ...getDemoAvatar(11),
    userId: 11
  }

  const mockMember12 = {
    ...getDemoAvatar(12),
    userId: 12
  }

  const mockTeamMembers = [
    mockMember1,
    mockMember2,
    mockMember3,
    mockMember4,
    mockMember5,
    mockMember6,
    mockMember7,
    mockMember8,
    mockMember9,
    mockMember10,
    mockMember11,
    mockMember12
  ]

  const MAX_32_BIT_INTEGER = Math.pow(2, 31) - 1
  const mockEstimateStages = [
    {
      dimensionName: 'Value',
      scores: [
        {userId: 1, value: -1, label: '?'},
        {userId: 2, value: 1, label: '1'},
        {userId: 3, value: 1, label: '1'},
        {userId: 4, value: 1, label: '1'},
        {userId: 5, value: 3, label: '3'},
        {userId: 6, value: 1, label: '1'},
        {userId: 7, value: 1, label: '1'},
        {userId: 8, value: 3, label: '3'},
        {userId: 9, value: 1, label: '1'},
        {userId: 10, value: 1, label: '1'},
        {userId: 11, value: 5, label: '5'},
        {userId: 12, value: MAX_32_BIT_INTEGER, label: 'P'}
      ],
      selectedScale: [
        {color: PALETTE.PROMPT_PINK, value: -1, label: '?'},
        {color: PALETTE.PROMPT_RED, value: 5, label: '5'},
        {color: PALETTE.PROMPT_ORANGE, value: 3, label: '3'},
        {color: PALETTE.PROMPT_GREEN, value: 1, label: '1'},
        {color: PALETTE.PROMPT_BLUE, value: MAX_32_BIT_INTEGER, label: 'P'}
      ],
      teamMembers: mockTeamMembers
    },
    {
      dimensionName: 'Effort',
      scores: [
        {userId: 1, value: -1, label: '?'},
        {userId: 2, value: 1, label: '1'},
        {userId: 3, value: 1, label: '1'},
        {userId: 4, value: 1, label: '1'},
        {userId: 5, value: 3, label: '3'},
        {userId: 6, value: 1, label: '1'},
        {userId: 7, value: 1, label: '1'},
        {userId: 8, value: 3, label: '3'},
        {userId: 9, value: 1, label: '1'},
        {userId: 10, value: 1, label: '1'},
        {userId: 11, value: 5, label: '5'},
        {userId: 12, value: MAX_32_BIT_INTEGER, label: 'P'}
      ],
      selectedScale: [
        {color: PALETTE.PROMPT_PINK, value: -1, label: '?'},
        {color: PALETTE.PROMPT_RED, value: 5, label: '5'},
        {color: PALETTE.PROMPT_ORANGE, value: 3, label: '3'},
        {color: PALETTE.PROMPT_GREEN, value: 1, label: '1'},
        {color: PALETTE.PROMPT_BLUE, value: MAX_32_BIT_INTEGER, label: 'P'}
      ],
      teamMembers: mockTeamMembers
    }
  ]

  const slideContainer = {
    padding: isDesktop ? '0 8px' : '0 4px'
  }

  return (
    <EstimateArea>
      <StepperDots>
        {mockEstimateStages.map((_, idx) => {
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
        {mockEstimateStages.map((stage, idx) => (
          <SwipableEstimateItem key={idx}>
            <EstimatePhaseDimensionColumn setVotedUserEl={setVotedUserEl} estimateStage={stage} />
          </SwipableEstimateItem>
        ))}
      </SwipeableViews>

    </EstimateArea>
  )
}

export default createFragmentContainer(
  EstimatePhaseArea,
  {
    meeting: graphql`
    fragment EstimatePhaseArea_meeting on PokerMeeting {
      ...PokerCardDeck_meeting
      localStage {
        ...on EstimateStage {
          ...DeckActivityAvatars_stage
        }
      }
      phases {
        ... on EstimatePhase {
          stages {
            ...DeckActivityAvatars_stage
          }
        }
      }
    }`
  }
)
