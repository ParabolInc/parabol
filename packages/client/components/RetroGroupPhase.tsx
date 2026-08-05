/**
 * Renders the UI for the group phase of the retrospective meeting
 *
 */
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {RetroGroupPhase_meeting$key} from '~/__generated__/RetroGroupPhase_meeting.graphql'
import useCallbackRef from '~/hooks/useCallbackRef'
import useRightDrawer from '~/hooks/useRightDrawer'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import GroupingKanban from './GroupingKanban'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingPhaseWrapper from './MeetingPhaseWrapper'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderDescription from './PhaseHeaderDescription'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'
import type {RetroMeetingPhaseProps} from './RetroMeeting'
import StageTimerDisplay from './StageTimerDisplay'
import SuggestedGroupsButton from './SuggestedGroupsButton'

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
        ...SuggestedGroupsButton_meeting
        id
        endedAt
        showSidebar
        rightDrawerOpen
        localStage {
          isComplete
          phaseType
        }
      }
    `,
    meetingRef
  )
  const [callbackRef, phaseRef] = useCallbackRef()
  const {id: meetingId, endedAt, showSidebar, rightDrawerOpen, localStage} = meeting
  const [toggleDrawer] = useRightDrawer(meetingId, 'inspiration', false)
  const isGroupPhaseActive = localStage?.phaseType === 'group' && !localStage?.isComplete

  return (
    <>
      {/* select-none is for Safari. Repro: drag a card & see the whole area get highlighted */}
      <MeetingContent ref={callbackRef} className='select-none'>
        <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
          <MeetingTopBar
            avatarGroup={avatarGroup}
            isMeetingSidebarCollapsed={!showSidebar}
            rightDrawerOpen={rightDrawerOpen}
            drawerType='inspiration'
            toggleSidebar={toggleSidebar}
            toggleDrawer={toggleDrawer}
          >
            <PhaseHeaderTitle>{phaseLabelLookup.group}</PhaseHeaderTitle>
            <PhaseHeaderDescription>
              {'Drag cards to group by common topics'}
            </PhaseHeaderDescription>
            {isGroupPhaseActive && (
              <div className='flex items-center pt-4 pb-2'>
                <SuggestedGroupsButton meeting={meeting} />
              </div>
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
    </>
  )
}

export default RetroGroupPhase
