import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useGotoNext from '~/hooks/useGotoNext'
import {TransitionStatus} from '~/hooks/useTransition'
import FlagReadyToAdvanceMutation from '~/mutations/FlagReadyToAdvanceMutation'
import {PALETTE} from '~/styles/paletteV2'
import {BezierCurve} from '~/types/constEnums'
import {NewMeetingPhaseTypeEnum} from '~/types/graphql'
import handleRightArrow from '~/utils/handleRightArrow'
import isDemoRoute from '~/utils/isDemoRoute'
import {BottomControlBarReady_meeting} from '~/__generated__/BottomControlBarReady_meeting.graphql'
import BottomControlBarProgress from './BottomControlBarProgress'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'
import Icon from './Icon'

interface Props {
  isDemoStageComplete?: boolean
  meeting: BottomControlBarReady_meeting
  status: TransitionStatus
  onTransitionEnd: () => void
  handleGotoNext: ReturnType<typeof useGotoNext>
}

const CheckIcon = styled(Icon)<{progress: number; isNext: boolean}>(({progress, isNext}) => ({
  color: isNext
    ? progress === 1
      ? PALETTE.TEXT_GREEN
      : PALETTE.EMPHASIS_WARM
    : progress > 0
    ? PALETTE.TEXT_GREEN
    : PALETTE.TEXT_GRAY,
  fontSize: 24,
  fontWeight: 600,
  height: 24,
  transformOrigin: '0 0',
  // 20px to 16 = 0.75
  transform: progress > 0 ? `scale(0.75)translate(4px, 4px)` : undefined,
  transition: `transform 100ms ${BezierCurve.DECELERATE}`
}))

const BottomControlBarReady = (props: Props) => {
  const {handleGotoNext, isDemoStageComplete, meeting, onTransitionEnd, status} = props
  const {id: meetingId, facilitatorUserId, localStage, meetingMembers, reflectionGroups} = meeting
  const {id: stageId, isViewerReady, phaseType} = localStage
  const {gotoNext, ref} = handleGotoNext
  const activeCount = meetingMembers.filter((member) => member.isCheckedIn).length
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const isFacilitating = facilitatorUserId === viewerId
  const readyCount = localStage.readyCount || 0
  const progress = readyCount / Math.max(1, activeCount - 1)
  const onClick = () => {
    if (isFacilitating) {
      gotoNext()
    } else {
      FlagReadyToAdvanceMutation(atmosphere, {isReady: !isViewerReady, meetingId, stageId})
    }
  }
  const onKeyDown = isFacilitating
    ? handleRightArrow(() => {
        gotoNext()
      })
    : undefined
  const icon = isFacilitating ? 'arrow_forward' : 'check'
  const label = isFacilitating ? 'Next' : 'Ready'
  const getDisabled = () => {
    if (!isFacilitating) return false
    if (isDemoRoute()) {
      return !isDemoStageComplete && !(window as any).Cypress
    }
    if (phaseType === NewMeetingPhaseTypeEnum.reflect) {
      return reflectionGroups?.length === 0 ?? true
    }
    return false
  }
  const disabled = getDisabled()
  return (
    <BottomNavControl
      disabled={disabled}
      onClick={onClick}
      status={status}
      onTransitionEnd={onTransitionEnd}
      onKeyDown={onKeyDown}
      ref={ref}
    >
      <BottomControlBarProgress progress={progress} />
      <BottomNavIconLabel label={label}>
        <CheckIcon isNext={isFacilitating} progress={progress}>
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
      facilitatorUserId
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
