import graphql from 'babel-plugin-relay/macro'
/**
 * Renders the UI for the reflection phase of the retrospective meeting
 *
 */
import React, {useState} from 'react'
import {useFragment} from 'react-relay'
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

const ButtonWrapper = styled('div')({
  display: 'flex',
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
        organization {
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
  const {id: meetingId, endedAt, showSidebar, organization} = meeting
  const {featureFlags} = organization
  const {suggestGroups} = featureFlags

  const handleAutoGroupClick = () => {
    if (!hasSuggestedGroups) {
      AutogroupMutation(atmosphere, {meetingId}, {onError, onCompleted})
      // TODO: show ungroup button instead
      setHasSuggestedGroups(true)
    }
  }

  return (
    <MeetingContent ref={callbackRef}>
      <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
        >
          <PhaseHeaderTitle>{phaseLabelLookup.group}</PhaseHeaderTitle>
          <PhaseHeaderDescription>{'Drag cards to group by common topics'}</PhaseHeaderDescription>
          {suggestGroups && (
            <ButtonWrapper>
              <StyledButton disabled={hasSuggestedGroups} onClick={handleAutoGroupClick}>
                {'Suggest Groups ✨'}
              </StyledButton>
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
  )
}

export default RetroGroupPhase
