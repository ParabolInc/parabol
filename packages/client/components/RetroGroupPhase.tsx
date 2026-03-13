/**
 * Renders the UI for the group phase of the retrospective meeting
 *
 */
import styled from '@emotion/styled'
import {Info as InfoIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {RetroGroupPhase_meeting$key} from '~/__generated__/RetroGroupPhase_meeting.graphql'
import useCallbackRef from '~/hooks/useCallbackRef'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuPosition} from '../hooks/useCoords'
import useMutationProps from '../hooks/useMutationProps'
import useTooltip from '../hooks/useTooltip'
import AutogroupMutation from '../mutations/AutogroupMutation'
import {Elevation} from '../styles/elevation'
import {Threshold} from '../types/constEnums'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import GroupingKanban from './GroupingKanban'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingPhaseWrapper from './MeetingPhaseWrapper'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderDescription from './PhaseHeaderDescription'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'
import PrimaryButton from './PrimaryButton'
import type {RetroMeetingPhaseProps} from './RetroMeeting'
import StageTimerDisplay from './StageTimerDisplay'

const ButtonWrapper = styled('div')({
  display: 'flex',
  alignItems: 'center',
  padding: '16px 0px 8px 0px'
})

const StyledButton = styled(PrimaryButton)({
  '&:hover, &:focus': {
    boxShadow: Elevation.Z2
  }
})

interface Props extends RetroMeetingPhaseProps {
  meeting: RetroGroupPhase_meeting$key
}

const RetroGroupPhase = (props: Props) => {
  const {avatarGroup, toggleSidebar, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment RetroGroupPhase_meeting on RetrospectiveMeeting {
        ...StageTimerControl_meeting
        ...StageTimerDisplay_meeting
        ...GroupingKanban_meeting
        id
        endedAt
        showSidebar
        localStage {
          isComplete
          phaseType
        }
        autogroupReflectionGroups {
          groupTitle
        }
        organization {
          tier
          useAI
        }
        team {
          qualAIMeetingsCount
        }
      }
    `,
    meetingRef
  )
  const [callbackRef, phaseRef] = useCallbackRef()
  const atmosphere = useAtmosphere()
  const {onError, onCompleted} = useMutationProps()
  const {
    id: meetingId,
    endedAt,
    showSidebar,
    organization,
    autogroupReflectionGroups,
    localStage,
    team
  } = meeting
  const {useAI, tier} = organization
  const {qualAIMeetingsCount} = team
  const teamOverLimit = qualAIMeetingsCount >= Threshold.MAX_QUAL_AI_MEETINGS && tier === 'starter'
  const isGroupPhaseActive = localStage?.phaseType === 'group' && !localStage?.isComplete
  const {openTooltip, closeTooltip, tooltipPortal, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER
  )

  const autogroupStatus: 'loading' | 'error' | 'ready' | null = (() => {
    if (!useAI || !isGroupPhaseActive) return null
    if (teamOverLimit) return null
    if (autogroupReflectionGroups == null) return 'loading'
    if (autogroupReflectionGroups.length === 0) return 'error'
    return 'ready'
  })()

  const tooltipSuggestGroupsText = `Click to group cards by common topics. Don't worry, you can ungroup any card afterwards! ${
    tier === 'starter'
      ? `This is a premium feature that we'll share with you during your first few retros.`
      : ''
  }`
  const teamOverLimitText = `You have reached the limit. Please upgrade to a paid plan to continue using this feature.`
  const tooltipText = (() => {
    if (teamOverLimit) return teamOverLimitText
    if (autogroupStatus === 'loading')
      return 'AI is analyzing your reflections and suggesting groups. This usually takes a few seconds.'
    if (autogroupStatus === 'error')
      return "AI grouping wasn't able to generate suggestions for this retro. You can still group cards manually by dragging them."
    return tooltipSuggestGroupsText
  })()

  const handleAutoGroupClick = () => {
    AutogroupMutation(atmosphere, {meetingId}, {onError, onCompleted})
  }

  return (
    <>
      {/* select-none is for Safari. Repro: drag a card & see the whole area get highlighted */}
      <MeetingContent ref={callbackRef} className='select-none'>
        <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
          <MeetingTopBar
            avatarGroup={avatarGroup}
            isMeetingSidebarCollapsed={!showSidebar}
            toggleSidebar={toggleSidebar}
          >
            <PhaseHeaderTitle>{phaseLabelLookup.group}</PhaseHeaderTitle>
            <PhaseHeaderDescription>
              {'Drag cards to group by common topics'}
            </PhaseHeaderDescription>
            {useAI && (
              <ButtonWrapper>
                <StyledButton
                  disabled={autogroupStatus !== 'ready'}
                  waiting={autogroupStatus === 'loading'}
                  onClick={handleAutoGroupClick}
                >
                  {autogroupStatus === 'loading' ? 'AI thinking...' : 'Suggest Groups ✨'}
                </StyledButton>
                <div
                  onMouseEnter={openTooltip}
                  onMouseLeave={closeTooltip}
                  className='ml-2 h-6 w-6 cursor-pointer text-slate-600'
                  ref={originRef}
                >
                  <InfoIcon />
                </div>
              </ButtonWrapper>
            )}
          </MeetingTopBar>
          <PhaseWrapper>
            <StageTimerDisplay meeting={meeting} canUndo={true} />
            <MeetingPhaseWrapper>
              <GroupingKanban meeting={meeting} phaseRef={phaseRef} />
            </MeetingPhaseWrapper>
          </PhaseWrapper>
        </MeetingHeaderAndPhase>
      </MeetingContent>
      {tooltipPortal(tooltipText)}
    </>
  )
}

export default RetroGroupPhase
