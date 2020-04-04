import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import useAtmosphere from 'hooks/useAtmosphere'
import {TransitionStatus} from 'hooks/useTransition'
import FlagReadyToAdvanceMutation from 'mutations/FlagReadyToAdvanceMutation'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from 'styles/paletteV2'
import {BezierCurve} from 'types/constEnums'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'
import Icon from './Icon'
import BottomControlBarProgress from './BottomControlBarProgress'
import handleRightArrow from 'utils/handleRightArrow'
import useGotoNext from 'hooks/useGotoNext'
import isDemoRoute from 'utils/isDemoRoute'
import {BottomControlBarReady_meeting} from '__generated__/BottomControlBarReady_meeting.graphql'
import {NewMeetingPhaseTypeEnum} from 'types/graphql'

interface Props {
  isDemoStageComplete?: boolean
  meeting: BottomControlBarReady_meeting
  status: TransitionStatus
  onTransitionEnd: () => void
  handleGotoNext?: ReturnType<typeof useGotoNext>
}

const CheckIcon = styled(Icon)<{progress: number; isNext: boolean}>(({progress, isNext}) => ({
  color: isNext
    ? progress === 1
      ? PALETTE.TEXT_GREEN
      : PALETTE.EMPHASIS_WARM
    : progress > 0
    ? PALETTE.TEXT_BLUE
    : PALETTE.TEXT_GRAY,
  fontSize: progress > 0 ? 18 : 24,
  fontWeight: 600,
  height: 24,
  padding: progress > 0 ? 3 : undefined,
  transition: `all 100ms ${BezierCurve.DECELERATE}`
}))

const BottomControlBarReady = (props: Props) => {
  const {handleGotoNext, isDemoStageComplete, meeting, onTransitionEnd, status} = props
  const {id: meetingId, localStage, meetingMembers, reflectionGroups} = meeting
  const {id: stageId, isViewerReady, readyCount, phaseType} = localStage
  const activeCount = meetingMembers.filter((member) => member.isCheckedIn).length
  const progress = readyCount / Math.max(1, activeCount - 1)
  const atmosphere = useAtmosphere()

  const onClick = () => {
    if (handleGotoNext) {
      handleGotoNext.gotoNext()
    } else {
      FlagReadyToAdvanceMutation(atmosphere, {isReady: !isViewerReady, meetingId, stageId})
    }
  }
  const onKeyDown = handleGotoNext
    ? handleRightArrow(() => {
        handleGotoNext.gotoNext()
      })
    : undefined
  const icon = handleGotoNext ? 'arrow_forward' : 'check'
  const label = handleGotoNext ? 'Next' : 'Ready'
  const getDisabled = () => {
    if (!handleGotoNext) return false
    if (isDemoRoute()) {
      return !isDemoStageComplete && !(window as any).Cypress
    }
    if (phaseType === NewMeetingPhaseTypeEnum.reflect) {
      return reflectionGroups?.length === 0 ?? true
    }
  }
  const disabled = getDisabled()
  console.log('disabled', disabled)
  return (
    <BottomNavControl
      disabled={disabled}
      onClick={onClick}
      status={status}
      onTransitionEnd={onTransitionEnd}
      onKeyDown={onKeyDown}
      ref={handleGotoNext?.ref}
    >
      <BottomControlBarProgress progress={progress} />
      <BottomNavIconLabel label={label}>
        <CheckIcon isNext={!!handleGotoNext} progress={progress}>
          {icon}
        </CheckIcon>
      </BottomNavIconLabel>
    </BottomNavControl>
  )
}

graphql`
  fragment BottomControlBarReadyStage on NewMeetingStage {
    id
    readyCount
    isViewerReady
    phaseType
  }
`

export default createFragmentContainer(BottomControlBarReady, {
  meeting: graphql`
    fragment BottomControlBarReady_meeting on NewMeeting {
      ... on RetrospectiveMeeting {
        reflectionGroups {
          id
        }
      }
      id
      localStage {
        ...BottomControlBarReadyStage @relay(mask: false)
      }
      meetingMembers {
        id
        isCheckedIn
      }
      phases {
        stages {
          ...BottomControlBarReadyStage @relay(mask: false)
        }
      }
    }
  `
})
