import graphql from 'babel-plugin-relay/macro'
/**
 * Renders the UI for the reflection phase of the retrospective meeting
 *
 */
import React, {useState} from 'react'
import {useFragment} from 'react-relay'
import {Info as InfoIcon} from '@mui/icons-material'
import useCallbackRef from '~/hooks/useCallbackRef'
import {RetroGroupPhase_meeting$key} from '~/__generated__/RetroGroupPhase_meeting.graphql'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import GroupingKanban from './GroupingKanban'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingPhaseWrapper from './MeetingPhaseWrapper'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderDescription from './PhaseHeaderDescription'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'
import {RetroMeetingPhaseProps} from './RetroMeeting'
import StageTimerDisplay from './StageTimerDisplay'
import PrimaryButton from './PrimaryButton'
import styled from '@emotion/styled'
import AutogroupMutation from '../mutations/AutogroupMutation'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import {Elevation} from '../styles/elevation'
import useTooltip from '../hooks/useTooltip'
import {MenuPosition} from '../hooks/useCoords'

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
  const [hasSuggestedGroups, setHasSuggestedGroups] = useState(false)
  const {id: meetingId, endedAt, showSidebar, organization, autogroupReflectionGroups} = meeting
  const {featureFlags, tier} = organization
  const {suggestGroups} = featureFlags
  const {openTooltip, closeTooltip, tooltipPortal, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER
  )

  const handleAutoGroupClick = () => {
    if (!hasSuggestedGroups) {
      AutogroupMutation(atmosphere, {meetingId}, {onError, onCompleted})
      // TODO: show ungroup button instead
      setHasSuggestedGroups(true)
    }
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
            {suggestGroups && (
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
      {tooltipPortal(
        `Click to group cards by common topics. Don't worry, you'll be able to undo this! ${
          tier === 'starter'
            ? `This is a premium feature that we'll share with you during your first few retros.`
            : ''
        }`
      )}
    </>
  )
}

export default RetroGroupPhase
