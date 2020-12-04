import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import SwipeableViews from 'react-swipeable-views'
import useBreakpoint from '~/hooks/useBreakpoint'
import useGotoStageId from '~/hooks/useGotoStageId'
import {PALETTE} from '~/styles/paletteV2'
import {Breakpoint} from '~/types/constEnums'
import {EstimatePhaseArea_meeting} from '~/__generated__/EstimatePhaseArea_meeting.graphql'
import DeckActivityAvatars from './DeckActivityAvatars'
import EstimateDimensionColumn from './EstimateDimensionColumn'
import PokerCardDeck from './PokerCardDeck'

const EstimateArea = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  width: '100%'
})

const StepperDots = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  paddingTop: 4,
  width: '100%'
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

const innerStyle = (isDesktop: boolean, hasSingleDimension: boolean) => {
  return {
    height: '100%',
    margin: isDesktop ? '0 auto' : null,
    maxWidth: hasSingleDimension
      ? isDesktop ? 1536 : null
      : isDesktop ? 1600 : null,
    padding: hasSingleDimension
      ? isDesktop ? '12px 8px 0' : '4px 4px 0'
      : isDesktop ? '8px 40px 0' : '8px 16px 0',
    width: '100%',
    overflow: 'visible'
  }
}

const containerStyle = {
  height: '100%'
}

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  meeting: EstimatePhaseArea_meeting
}

const EstimatePhaseArea = (props: Props) => {
  const {gotoStageId, meeting} = props
  const {localStage, phases} = meeting
  const {id: localStageId, serviceTaskId} = localStage
  const {stages} = phases.find(({phaseType}) => phaseType === 'ESTIMATE')!
  const dimensionStages = stages!.filter((stage) => stage.serviceTaskId === serviceTaskId)
  const stageIdx = dimensionStages!.findIndex(({id}) => id === localStageId)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const estimateAreaRef = useRef<HTMLDivElement>(null)

  const onChangeIdx = (idx: number) => {
    gotoStageId(dimensionStages[idx].id)
  }

  const slideContainer = {
    padding: isDesktop ? '0 8px' : '0 4px'
  }

  const hasSingleDimension = dimensionStages.length === 1

  return (
    <EstimateArea ref={estimateAreaRef}>
      {dimensionStages.length > 1 && <StepperDots>
        {dimensionStages.map((_, idx) => {
          return (
            <StepperDot key={idx} isActive={idx === stageIdx} onClick={() => onChangeIdx(idx)} />
          )
        })}
      </StepperDots>
      }
      <PokerCardDeck meeting={meeting} estimateAreaRef={estimateAreaRef} />
      <DeckActivityAvatars stage={localStage} />
      <SwipeableViews
        containerStyle={containerStyle}
        enableMouseEvents
        index={stageIdx}
        onChangeIndex={onChangeIdx}
        slideStyle={slideContainer}
        style={innerStyle(isDesktop, hasSingleDimension)}
      >
        {dimensionStages.map((stage, idx) => (
          <SwipableEstimateItem key={idx}>
            <EstimateDimensionColumn meeting={meeting} stage={stage} />
          </SwipableEstimateItem>
        ))}
      </SwipeableViews>
    </EstimateArea>
  )
}

graphql`
  fragment EstimatePhaseAreaStage on EstimateStage {
    ...DeckActivityAvatars_stage
    id
    serviceTaskId
  }
`

export default createFragmentContainer(EstimatePhaseArea, {
  meeting: graphql`
    fragment EstimatePhaseArea_meeting on PokerMeeting {
      ...PokerCardDeck_meeting
      ...EstimateDimensionColumn_meeting
      localStage {
        ...EstimatePhaseAreaStage @relay(mask: false)
      }
      phases {
        ... on EstimatePhase {
          phaseType
          stages {
            ...EstimateDimensionColumn_stage
            ...EstimatePhaseAreaStage @relay(mask: false)
          }
        }
      }
    }
  `
})
