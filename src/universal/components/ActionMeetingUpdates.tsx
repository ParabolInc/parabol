import {ActionMeetingUpdates_team} from '__generated__/ActionMeetingUpdates_team.graphql'
import ms from 'ms'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import ActionMeetingUpdatesPrompt from 'universal/components/ActionMeetingUpdatesPrompt'
import BottomNavControl from 'universal/components/BottomNavControl'
import BottomNavIconLabel from 'universal/components/BottomNavIconLabel'
import ErrorBoundary from 'universal/components/ErrorBoundary'
import MeetingContent from 'universal/components/MeetingContent'
import MeetingContentHeader from 'universal/components/MeetingContentHeader'
import MeetingPhaseWrapper from 'universal/components/MeetingPhaseWrapper'
import MeetingHelpToggle from 'universal/components/MenuHelpToggle'
import {ActionMeetingPhaseProps} from 'universal/components/ActionMeeting'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import useTimeout from 'universal/hooks/useTimeout'
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar'
import {GROUP} from 'universal/utils/constants'
import handleRightArrow from 'universal/utils/handleRightArrow'
import lazyPreload from 'universal/utils/lazyPreload'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import EndMeetingButton from './EndMeetingButton'

const BottomControlSpacer = styled('div')({
  minWidth: '6rem'
})

const StyledBottomBar = styled(MeetingControlBar)({
  justifyContent: 'space-between'
})

interface Props extends ActionMeetingPhaseProps {
  team: ActionMeetingUpdates_team
}

const UpdatesHelpMenu = lazyPreload(async () =>
  import(/* webpackChunkName: 'UpdatesHelpMenu' */ 'universal/components/MeetingHelp/UpdatesHelpMenu')
)

const ActionMeetingUpdates = (props: Props) => {
  const {avatarGroup, toggleSidebar, team, handleGotoNext} = props
  const atmosphere = useAtmosphere()
  const {current} = handleGotoNext
  const {gotoNext, ref: gotoNextRef} = current
  const minTimeComplete = useTimeout(ms('2m'))
  const {viewerId} = atmosphere
  const {isMeetingSidebarCollapsed, newMeeting} = team
  if (!newMeeting) return null
  const {facilitatorUserId, id: meetingId} = newMeeting
  const isFacilitating = facilitatorUserId === viewerId
  return (
    <MeetingContent>
      <MeetingContentHeader
        avatarGroup={avatarGroup}
        isMeetingSidebarCollapsed={!!isMeetingSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      >
        <ActionMeetingUpdatesPrompt team={team} />
      </MeetingContentHeader>
      <ErrorBoundary>
        <MeetingPhaseWrapper>
          {/*<TaskColumns*/}
          {/*  getTaskById={getTaskById(allTasks)}*/}
          {/*  isMyMeetingSection={isMyMeetingSection}*/}
          {/*  myTeamMemberId={myTeamMemberId}*/}
          {/*  tasks={tasks}*/}
          {/*  area={MEETING}*/}
          {/*/>*/}
        </MeetingPhaseWrapper>
        {isFacilitating && (
          <StyledBottomBar>
            <BottomControlSpacer />
            <BottomNavControl
              isBouncing={minTimeComplete}
              onClick={() => gotoNext()}
              onKeyDown={handleRightArrow(() => gotoNext())}
              innerRef={gotoNextRef}
            >
              <BottomNavIconLabel
                icon='arrow_forward'
                iconColor='warm'
                label={`Next: ${phaseLabelLookup[GROUP]}`}
              />
            </BottomNavControl>
            <EndMeetingButton meetingId={meetingId} />
          </StyledBottomBar>
        )}
      </ErrorBoundary>
      <MeetingHelpToggle floatAboveBottomBar={isFacilitating} menu={<UpdatesHelpMenu />} />
    </MeetingContent>
  )
}

graphql`
  fragment ActionMeetingUpdates_phase on ReflectPhase {
    reflectPrompts {
      id
      question
      description
      editorIds
    }
  }
`

export default createFragmentContainer(
  ActionMeetingUpdates,
  graphql`
    fragment ActionMeetingUpdates_team on Team {
      ...ActionMeetingUpdatesPrompt_team
      isMeetingSidebarCollapsed
      newMeeting {
        ...PhaseItemColumn_meeting
        id
        facilitatorUserId
        ... on ActionMeeting {
          localStage {
            isComplete
          }
          localPhase {
            ...ActionMeetingUpdates_phase @relay(mask: false)
          }
          phases {
            ...ActionMeetingUpdates_phase @relay(mask: false)
          }
        }
      }
    }
  `
)
