import graphql from 'babel-plugin-relay/macro'
import type * as React from 'react'
import {useRef} from 'react'
import {useFragment} from 'react-relay'
import type {EstimatePhaseArea_meeting$key} from '~/__generated__/EstimatePhaseArea_meeting.graphql'
import useBreakpoint from '~/hooks/useBreakpoint'
import type useGotoStageId from '~/hooks/useGotoStageId'
import {PALETTE} from '~/styles/paletteV3'
import {Breakpoint} from '~/types/constEnums'
import EstimateDimensionColumn from './EstimateDimensionColumn'
import PokerCardDeck from './PokerCardDeck'
import SwipeablePanel from './SwipeablePanel'

const innerStyle = (isDesktop: boolean, hasSingleDimension: boolean): React.CSSProperties => {
  return {
    height: '100%',
    margin: isDesktop ? '0 auto' : undefined,
    maxWidth: hasSingleDimension ? (isDesktop ? 1536 : undefined) : isDesktop ? 1600 : undefined,
    padding: hasSingleDimension
      ? isDesktop
        ? '12px 8px 0'
        : '4px 4px 0'
      : isDesktop
        ? '8px 40px 0'
        : '8px 16px 0',
    width: '100%',
    overflow: 'visible'
  }
}

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  meeting: EstimatePhaseArea_meeting$key
}

const EstimatePhaseArea = (props: Props) => {
  const {gotoStageId, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
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
    `,
    meetingRef
  )
  const {localStage, phases} = meeting
  const {id: localStageId, taskId} = localStage
  const {stages} = phases.find(({phaseType}) => phaseType === 'ESTIMATE')!
  const dimensionStages = stages!.filter((stage) => stage.taskId === taskId)
  const stageIdx = dimensionStages!.findIndex(({id}) => id === localStageId)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const estimateAreaRef = useRef<HTMLDivElement>(null)

  const onChangeIdx = (idx: number) => {
    const stageId = dimensionStages[idx]?.id
    if (stageId) gotoStageId(stageId)
  }

  const hasSingleDimension = dimensionStages.length === 1

  return (
    <div className='flex w-full flex-1 flex-col overflow-hidden' ref={estimateAreaRef}>
      {dimensionStages.length > 1 && (
        <div className='flex w-full justify-center pt-1'>
          {dimensionStages.map((_, idx) => {
            const isActive = idx === stageIdx
            return (
              <div
                key={idx}
                className='mx-0.5 h-2 w-2 cursor-pointer rounded-full'
                style={{
                  backgroundColor: isActive ? PALETTE.GRAPE_700 : PALETTE.SLATE_600,
                  opacity: isActive ? undefined : 0.35
                }}
                onClick={() => onChangeIdx(idx)}
              />
            )
          })}
        </div>
      )}
      <PokerCardDeck meeting={meeting} estimateAreaRef={estimateAreaRef} />
      <SwipeablePanel
        index={stageIdx}
        onChangeIndex={onChangeIdx}
        style={innerStyle(isDesktop, hasSingleDimension)}
      >
        {dimensionStages.map((stage, idx) => (
          <div
            key={idx}
            className='flex-1 rounded-t-lg'
            style={{
              background: PALETTE.SLATE_300,
              paddingBottom: isDesktop ? 8 * 19 : 8 * 12,
              padding: isDesktop ? '0 8px' : '0 4px'
            }}
          >
            <EstimateDimensionColumn meeting={meeting} stage={stage} />
          </div>
        ))}
      </SwipeablePanel>
    </div>
  )
}

graphql`
  fragment EstimatePhaseAreaStage on EstimateStage {
    id
    taskId
  }
`

export default EstimatePhaseArea
