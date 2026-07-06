import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {RetroReflectPhase_meeting$key} from '~/__generated__/RetroReflectPhase_meeting.graphql'
import useCallbackRef from '~/hooks/useCallbackRef'
import useRightDrawer from '~/hooks/useRightDrawer'
import useBreakpoint from '../../hooks/useBreakpoint'
import {Breakpoint, DiscussionThreadEnum} from '../../types/constEnums'
import {phaseLabelLookup} from '../../utils/meetings/lookups'
import DiscussionDrawer from '../DiscussionDrawer'
import MeetingContent from '../MeetingContent'
import MeetingHeaderAndPhase from '../MeetingHeaderAndPhase'
import MeetingTopBar from '../MeetingTopBar'
import PhaseHeaderDescription from '../PhaseHeaderDescription'
import PhaseHeaderTitle from '../PhaseHeaderTitle'
import PhaseWrapper from '../PhaseWrapper'
import ResponsiveDashSidebar from '../ResponsiveDashSidebar'
import type {RetroMeetingPhaseProps} from '../RetroMeeting'
import StageTimerDisplay from '../StageTimerDisplay'
import RetroWorkDrawer from '../TeamPrompt/WorkDrawer/RetroWorkDrawer'
import PhaseItemColumn from './PhaseItemColumn'
import ReflectWrapperMobile from './ReflectionWrapperMobile'
import ReflectWrapperDesktop from './ReflectWrapperDesktop'

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
        ...DiscussionDrawerTranscripts_meeting
        ...RetroWorkDrawer_meeting
        id
        endedAt
        rightDrawerOpen
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
        disableAnonymity
      }
    `,
    meetingRef
  )
  const [callbackRef, phaseRef] = useCallbackRef()
  const [activeIdx, setActiveIdx] = useState(0)
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)
  const {disableAnonymity, localPhase, endedAt, showSidebar, rightDrawerOpen} = meeting
  const [toggleDrawer, setActiveTab] = useRightDrawer(meeting.id, 'inspiration')
  if (!localPhase || !localPhase.reflectPrompts) return null
  const reflectPrompts = localPhase!.reflectPrompts
  const focusedPromptId = localPhase!.focusedPromptId
  const ColumnWrapper = isDesktop ? ReflectWrapperDesktop : ReflectWrapperMobile

  return (
    <MeetingContent ref={callbackRef}>
      <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
        <MeetingTopBar
          meetingId={meeting.id}
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          rightDrawerOpen={rightDrawerOpen}
          drawerType='inspiration'
          toggleSidebar={toggleSidebar}
          toggleDrawer={toggleDrawer}
        >
          <PhaseHeaderTitle>{phaseLabelLookup.reflect}</PhaseHeaderTitle>
          <PhaseHeaderDescription>
            {`Add ${disableAnonymity ? '' : 'anonymous'} reflections for each prompt`}
          </PhaseHeaderDescription>
        </MeetingTopBar>
        <PhaseWrapper>
          <StageTimerDisplay meeting={meeting} />
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
      <ResponsiveDashSidebar
        isOpen={rightDrawerOpen != null}
        isRightDrawer
        onToggle={toggleDrawer}
        sidebarWidth={DiscussionThreadEnum.WIDTH}
      >
        <DiscussionDrawer
          hideDiscussion
          onToggle={toggleDrawer}
          allowedThreadables={[]}
          meetingRef={meeting}
          meetingId={meeting.id}
          workContent={<RetroWorkDrawer meetingRef={meeting} />}
          activeTab={rightDrawerOpen}
          onChangeTab={setActiveTab}
        />
      </ResponsiveDashSidebar>
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
