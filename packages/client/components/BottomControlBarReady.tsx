import {ArrowForward, CheckCircle, CheckCircleOutline} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import type {BottomControlBarReady_meeting$key} from '~/__generated__/BottomControlBarReady_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import type useGotoNext from '~/hooks/useGotoNext'
import FlagReadyToAdvanceMutation from '~/mutations/FlagReadyToAdvanceMutation'
import {BezierCurve, Times} from '~/types/constEnums'
import handleRightArrow from '~/utils/handleRightArrow'
import type {NewMeetingPhaseTypeEnum} from '../__generated__/BottomControlBarReady_meeting.graphql'
import {MenuPosition} from '../hooks/useCoords'
import useTooltip from '../hooks/useTooltip'
import {cn} from '../ui/cn'
import BottomControlBarProgress from './BottomControlBarProgress'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'

interface Props {
  isNext: boolean
  isPoker: boolean
  isFacilitating: boolean
  cancelConfirm: undefined | (() => void)
  isConfirming: boolean
  setConfirmingButton: (button: string) => void
  isDemoStageComplete?: boolean
  meeting: BottomControlBarReady_meeting$key
  handleGotoNext: ReturnType<typeof useGotoNext>
}

const PHASE_REQUIRES_CONFIRM = new Set<NewMeetingPhaseTypeEnum>(['reflect', 'group', 'vote'])

const BottomControlBarReady = (props: Props) => {
  const {
    cancelConfirm,
    isConfirming,
    isPoker,
    isNext,
    isFacilitating,
    setConfirmingButton,
    handleGotoNext,
    meeting: meetingRef
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
          isConnectedAt
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
      (meetingMember) => meetingMember.userId === viewerId || meetingMember.isConnectedAt
    )
  }, [meetingMembers])
  const activeCount = connectedMeetingMembers.length
  const readyUserIds = localStage.readyUserIds ?? []
  const readyCount = useMemo(() => {
    return readyUserIds.filter(
      (userId) =>
        (!isFacilitating || userId !== viewerId) &&
        connectedMeetingMembers.find((member) => member.userId === userId)
    ).length
  }, [readyUserIds, connectedMeetingMembers, isFacilitating, viewerId])

  const {openTooltip, tooltipPortal, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER,
    {
      delay: Times.MEETING_CONFIRM_TOOLTIP_DELAY
    }
  )
  const isOnlyViewer = activeCount === 1
  const progress = isOnlyViewer || isPoker ? 1.0 : readyCount / (activeCount - 1)
  const isLastStageInPhase = stages[stages.length - 1]?.id === localStage?.id
  const isConfirmRequired =
    isLastStageInPhase &&
    PHASE_REQUIRES_CONFIRM.has(phaseType!) &&
    readyCount < activeCount - 1 &&
    activeCount > 1

  const onClick = () => {
    if (!isNext) {
      FlagReadyToAdvanceMutation(atmosphere, {
        isReady: !isViewerReady,
        meetingId,
        stageId
      })
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

  const iconColor = isNext ? 'text-rose-500' : isViewerReady ? 'text-jade-400' : 'text-slate-600'

  return (
    <>
      <BottomNavControl
        dataCy={`next-phase`}
        confirming={!!cancelConfirm}
        onClick={cancelConfirm || onClick}
        onKeyDown={onKeyDown}
        ref={ref}
      >
        {isNext && <BottomControlBarProgress isNext={isNext} progress={progress} />}
        <BottomNavIconLabel className='px-2' label={label} ref={originRef}>
          <div
            className={cn(
              'h-6 w-6 origin-top-left',
              iconColor,
              '[&_svg]:fill-current [&_svg]:stroke-current'
            )}
            style={{
              transform: isNext
                ? progress > 0
                  ? 'scale(0.75)translate(4px, 4px)'
                  : undefined
                : 'none',
              transition: `transform 100ms ${BezierCurve.DECELERATE}`
            }}
          >
            {isNext ? (
              <ArrowForward style={{strokeWidth: 1}} />
            ) : isViewerReady ? (
              <CheckCircle />
            ) : (
              <CheckCircleOutline />
            )}
          </div>
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
    readyUserIds
    isViewerReady
    phaseType
  }
`

export default BottomControlBarReady
