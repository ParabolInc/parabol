import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {useFragment} from 'react-relay'
import useCallbackRef from '~/hooks/useCallbackRef'
import {RetroReflectPhase_meeting$key} from '~/__generated__/RetroReflectPhase_meeting.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useBreakpoint from '../../hooks/useBreakpoint'
import {Breakpoint} from '../../types/constEnums'
import {phaseLabelLookup} from '../../utils/meetings/lookups'
import MeetingContent from '../MeetingContent'
import MeetingHeaderAndPhase from '../MeetingHeaderAndPhase'
import MeetingTopBar from '../MeetingTopBar'
import PhaseHeaderDescription from '../PhaseHeaderDescription'
import PhaseHeaderTitle from '../PhaseHeaderTitle'
import PhaseWrapper from '../PhaseWrapper'
import PrimaryButton from '../PrimaryButton'
import {RetroMeetingPhaseProps} from '../RetroMeeting'
import StageTimerDisplay from '../StageTimerDisplay'
import PhaseItemColumn from './PhaseItemColumn'
import ReflectWrapperMobile from './ReflectionWrapperMobile'
import ReflectWrapperDesktop from './ReflectWrapperDesktop'
import AutogroupMutation from '../../mutations/AutogroupMutation'
import useMutationProps from '../../hooks/useMutationProps'

const ButtonWrapper = styled('div')({
  display: 'flex',
  width: '100%',
  paddingBottom: 32,
  paddingLeft: 80 // TODO: super hacky, only for demo
})

interface Props extends RetroMeetingPhaseProps {
  meeting: RetroReflectPhase_meeting$key
}

const RetroReflectPhase = (props: Props) => {
  const {avatarGroup, toggleSidebar, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment RetroReflectPhase_meeting on RetrospectiveMeeting {
        ...StageTimerDisplay_meeting
        ...StageTimerControl_meeting
        ...PhaseItemColumn_meeting
        id
        endedAt
        localPhase {
          ...RetroReflectPhase_phase @relay(mask: false)
        }
        localStage {
          isComplete
        }
        phases {
          ...RetroReflectPhase_phase @relay(mask: false)
        }
        showSidebar
        settings {
          disableAnonymity
        }
      }
    `,
    meetingRef
  )
  const [callbackRef, phaseRef] = useCallbackRef()
  const atmosphere = useAtmosphere()
  const [activeIdx, setActiveIdx] = useState(0)
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)
  const {id: meetingId, localPhase, endedAt, showSidebar, settings} = meeting
  const {disableAnonymity} = settings
  if (!localPhase || !localPhase.reflectPrompts) return null
  const reflectPrompts = localPhase!.reflectPrompts
  const focusedPromptId = localPhase!.focusedPromptId
  const ColumnWrapper = isDesktop ? ReflectWrapperDesktop : ReflectWrapperMobile
  const {onError, onCompleted} = useMutationProps()

  const handleClick = () => {
    AutogroupMutation(atmosphere, {meetingId}, {onError, onCompleted})
  }

  return (
    <MeetingContent ref={callbackRef}>
      <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
        >
          <PhaseHeaderTitle>{phaseLabelLookup.reflect}</PhaseHeaderTitle>
          <PhaseHeaderDescription>
            {`Add ${disableAnonymity ? '' : 'anonymous'} reflections for each prompt`}
          </PhaseHeaderDescription>
        </MeetingTopBar>
        <PhaseWrapper>
          <StageTimerDisplay meeting={meeting} />
          <ButtonWrapper>
            <PrimaryButton onClick={handleClick}>{'Auto Group ✨'}</PrimaryButton>
          </ButtonWrapper>
          <ColumnWrapper
            setActiveIdx={setActiveIdx}
            activeIdx={activeIdx}
            focusedIdx={reflectPrompts.findIndex(({id}) => id === focusedPromptId)}
          >
            {reflectPrompts.map((prompt, idx) => (
              <PhaseItemColumn
                key={prompt.id}
                meeting={meeting}
                prompt={prompt}
                idx={idx}
                phaseRef={phaseRef}
                isDesktop={isDesktop}
              />
            ))}
          </ColumnWrapper>
        </PhaseWrapper>
      </MeetingHeaderAndPhase>
    </MeetingContent>
  )
}

graphql`
  fragment RetroReflectPhase_phase on ReflectPhase {
    focusedPromptId
    reflectPrompts {
      ...PhaseItemColumn_prompt
      id
      sortOrder
    }
  }
`

export default RetroReflectPhase
