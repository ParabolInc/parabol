import styled from '@emotion/styled'
import {ArrowForward, CheckCircle, CheckCircleOutline} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import {BottomControlBarReady_meeting$key} from '~/__generated__/BottomControlBarReady_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import useGotoNext from '~/hooks/useGotoNext'
import {TransitionStatus} from '~/hooks/useTransition'
import FlagReadyToAdvanceMutation from '~/mutations/FlagReadyToAdvanceMutation'
import {PALETTE} from '~/styles/paletteV3'
import {BezierCurve, Times} from '~/types/constEnums'
import handleRightArrow from '~/utils/handleRightArrow'
import {NewMeetingPhaseTypeEnum} from '../__generated__/BottomControlBarReady_meeting.graphql'
import {MenuPosition} from '../hooks/useCoords'
import useTooltip from '../hooks/useTooltip'
import BottomControlBarProgress from './BottomControlBarProgress'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'

interface Props {
  isNext: boolean
  isPoker: boolean
  cancelConfirm: undefined | (() => void)
  isConfirming: boolean
  setConfirmingButton: (button: string) => void
  isDemoStageComplete?: boolean
  meeting: BottomControlBarReady_meeting$key
  status: TransitionStatus
  onTransitionEnd: () => void
  handleGotoNext: ReturnType<typeof useGotoNext>
}

const StyledIcon = styled('div')<{progress: number; isNext: boolean; isViewerReady: boolean}>(
  ({isViewerReady, progress, isNext}) => ({
    height: 24,
    width: 24,
    transformOrigin: '0 0',
    // 20px to 16 = 0.75
    transform: isNext ? (progress > 0 ? `scale(0.75)translate(4px, 4px)` : undefined) : 'none',
    transition: `transform 100ms ${BezierCurve.DECELERATE}`,
    svg: {
      // without fill property the stroke property will be ignored
      fill: isNext ? PALETTE.ROSE_500 : isViewerReady ? PALETTE.JADE_400 : PALETTE.SLATE_600,
      stroke: isNext ? PALETTE.ROSE_500 : isViewerReady ? PALETTE.JADE_400 : PALETTE.SLATE_600,
      strokeWidth: isNext ? 1 : 0
    }
  })
)

const PHASE_REQUIRES_CONFIRM = new Set<NewMeetingPhaseTypeEnum>(['reflect', 'group', 'vote'])

const BottomControlBarReady = (props: Props) => {
  const {
    cancelConfirm,
    isConfirming,
    isPoker,
    isNext,
    setConfirmingButton,
    handleGotoNext,
    meeting: meetingRef,
    onTransitionEnd,
    status
  } = props
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const meeting = useFragment(
    graphql`
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
        localPhase {
          stages {
            ...BottomControlBarReadyStage @relay(mask: false)
          }
        }
        meetingMembers {
          id
          userId
          user {
            isConnected
            lastSeenAtURLs
          }
        }
        phases {
          stages {
            ...BottomControlBarReadyStage @relay(mask: false)
          }
        }
      }
    `,
    meetingRef
  )
  const {id: meetingId, localPhase, localStage, meetingMembers} = meeting
  const stages = localPhase.stages || []
  const {id: stageId, isComplete, isViewerReady, phaseType} = localStage
  const {gotoNext, ref} = handleGotoNext

  const connectedMeetingMembers = useMemo(() => {
    return meetingMembers.filter(
      (meetingMember) =>
        meetingMember.userId === viewerId ||
        (meetingMember.user.lastSeenAtURLs?.includes(`/meet/${meetingId}`) &&
          meetingMember.user.isConnected)
    )
  }, [meetingMembers])
  const activeCount = connectedMeetingMembers.length

  const {openTooltip, tooltipPortal, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER,
    {
      delay: Times.MEETING_CONFIRM_TOOLTIP_DELAY
    }
  )
  const readyCount = localStage.readyCount || 0
  const isOnlyViewer = activeCount === 1 // viewer is the only active meeting member
  const progress = isOnlyViewer || isPoker ? 1.0 : readyCount / (activeCount - 1)
  const isLastStageInPhase = stages[stages.length - 1]?.id === localStage?.id
  const isConfirmRequired =
    isLastStageInPhase &&
    PHASE_REQUIRES_CONFIRM.has(phaseType!) &&
    readyCount < activeCount - 1 &&
    activeCount > 1

  const onClick = () => {
    if (!isNext) {
      FlagReadyToAdvanceMutation(atmosphere, {isReady: !isViewerReady, meetingId, stageId})
    } else if (isComplete || !isConfirmRequired || isConfirming) {
      setConfirmingButton('')
      gotoNext()
    } else {
      setConfirmingButton('next')
      // let the above flush so isConfirming is set before opening
      setTimeout(openTooltip)
    }
  }
  const onKeyDown = isNext
    ? handleRightArrow(() => {
        gotoNext()
      })
    : undefined
  let label = ''
  if (isNext) {
    label = progress === 1.0 ? 'Next' : `${readyCount} / ${activeCount - 1} Ready`
  } else {
    label = isViewerReady ? 'Undo ready status' : 'Tap when ready'
  }

  return (
    <>
      <BottomNavControl
        dataCy={`next-phase`}
        confirming={!!cancelConfirm}
        onClick={cancelConfirm || onClick}
        status={status}
        onTransitionEnd={onTransitionEnd}
        onKeyDown={onKeyDown}
        ref={ref}
      >
        {isNext && <BottomControlBarProgress isNext={isNext} progress={progress} />}
        <BottomNavIconLabel className='px-2' label={label} ref={originRef}>
          <StyledIcon isViewerReady={isViewerReady} isNext={isNext} progress={progress}>
            {isNext ? <ArrowForward /> : isViewerReady ? <CheckCircle /> : <CheckCircleOutline />}
          </StyledIcon>
        </BottomNavIconLabel>
      </BottomNavControl>
      {tooltipPortal(`Tap 'Next' again if everyone is ready`)}
    </>
  )
}

graphql`
  fragment BottomControlBarReadyStage on NewMeetingStage {
    id
    isComplete
    readyCount
    isViewerReady
    phaseType
  }
`

export default BottomControlBarReady
