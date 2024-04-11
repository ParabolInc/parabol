import graphql from 'babel-plugin-relay/macro'
/**
 * Renders the UI for the reflection phase of the retrospective meeting
 *
 */
import styled from '@emotion/styled'
import {Info as InfoIcon} from '@mui/icons-material'
import React from 'react'
import {useFragment} from 'react-relay'
import {RetroGroupPhase_meeting$key} from '~/__generated__/RetroGroupPhase_meeting.graphql'
import useCallbackRef from '~/hooks/useCallbackRef'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuPosition} from '../hooks/useCoords'
import useMutationProps from '../hooks/useMutationProps'
import useTooltip from '../hooks/useTooltip'
import AutogroupMutation from '../mutations/AutogroupMutation'
import ResetReflectionGroupsMutation from '../mutations/ResetReflectionGroupsMutation'
import {Elevation} from '../styles/elevation'
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
import {RetroMeetingPhaseProps} from './RetroMeeting'
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
        autogroupReflectionGroups {
          groupTitle
        }
        resetReflectionGroups {
          groupTitle
        }
        organization {
          tier
          featureFlags {
            suggestGroups
          }
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
    resetReflectionGroups
  } = meeting
  const {featureFlags, tier} = organization
  const {suggestGroups: hasSuggestGroupsFlag} = featureFlags
  const {openTooltip, closeTooltip, tooltipPortal, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER
  )
  const showSuggestGroups = !resetReflectionGroups // resetReflectionGroups only exists after clicking suggest groups and is removed after clicking reset
  const tooltipSuggestGroupsText = `Click to group cards by common topics. Don't worry, you'll be able to undo this! ${
    tier === 'starter'
      ? `This is a premium feature that we'll share with you during your first few retros.`
      : ''
  }`
  const tooltipResetText = `Reset your groups to the way they were before you clicked Suggest Groups`
  const tooltipText = showSuggestGroups ? tooltipSuggestGroupsText : tooltipResetText

  const handleAutoGroupClick = () => {
    AutogroupMutation(atmosphere, {meetingId}, {onError, onCompleted})
  }

  const handleResetGroupsClick = () => {
    ResetReflectionGroupsMutation(atmosphere, {meetingId}, {onError, onCompleted})
  }

  return (
    <>
      <MeetingContent ref={callbackRef}>
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
            {hasSuggestGroupsFlag &&
              (showSuggestGroups ? (
                <ButtonWrapper>
                  <StyledButton
                    disabled={!autogroupReflectionGroups?.length}
                    onClick={handleAutoGroupClick}
                  >
                    {'Suggest Groups ✨'}
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
              ) : (
                <ButtonWrapper>
                  <StyledButton onClick={handleResetGroupsClick}>{'Reset Groups'}</StyledButton>
                  <div
                    onMouseEnter={openTooltip}
                    onMouseLeave={closeTooltip}
                    className='ml-2 h-6 w-6 cursor-pointer text-slate-600'
                    ref={originRef}
                  >
                    <InfoIcon />
                  </div>
                </ButtonWrapper>
              ))}
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
