import {ActionMeetingFirstCall_team} from '__generated__/ActionMeetingFirstCall_team.graphql'
import ms from 'ms'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer, graphql} from 'react-relay'
import {ActionMeetingPhaseProps} from 'universal/components/ActionMeeting'
import BottomNavControl from 'universal/components/BottomNavControl'
import BottomNavIconLabel from 'universal/components/BottomNavIconLabel'
import ErrorBoundary from 'universal/components/ErrorBoundary'
import MeetingContent from 'universal/components/MeetingContent'
import MeetingContentHeader from 'universal/components/MeetingContentHeader'
import MeetingHelpToggle from 'universal/components/MenuHelpToggle'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import useTimeout from 'universal/hooks/useTimeout'
import AgendaShortcutHint from 'universal/modules/meeting/components/AgendaShortcutHint/AgendaShortcutHint'
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar'
import MeetingCopy from 'universal/modules/meeting/components/MeetingCopy/MeetingCopy'
import MeetingFacilitationHint from 'universal/modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint'
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading'
import {AGENDA_ITEM_LABEL, AGENDA_ITEMS} from 'universal/utils/constants'
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
  team: ActionMeetingFirstCall_team
}

const ActionMeetingFirstCallHelpMenu = lazyPreload(async () =>
  import(
    /* webpackChunkName: 'ActionMeetingFirstCallHelpMenu' */ 'universal/components/MeetingHelp/ActionMeetingFirstCallHelpMenu'
  )
)

const FirstCallWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%'
})

const ActionMeetingFirstCall = (props: Props) => {
  const {avatarGroup, toggleSidebar, team, handleGotoNext} = props
  const atmosphere = useAtmosphere()
  const {gotoNext, ref: gotoNextRef} = handleGotoNext
  const minTimeComplete = useTimeout(ms('30s'))
  const {viewerId} = atmosphere
  const {isMeetingSidebarCollapsed, newMeeting} = team
  const {facilitator, facilitatorUserId, id: meetingId} = newMeeting!
  const {preferredName} = facilitator
  const isFacilitating = facilitatorUserId === viewerId
  const phaseName = phaseLabelLookup[AGENDA_ITEMS]
  return (
    <MeetingContent>
      <MeetingContentHeader
        avatarGroup={avatarGroup}
        isMeetingSidebarCollapsed={!!isMeetingSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />
      <ErrorBoundary>
        <FirstCallWrapper>
          <MeetingPhaseHeading>{'Now, what do you need?'}</MeetingPhaseHeading>

          <MeetingCopy>{`Time to add your ${AGENDA_ITEM_LABEL}s to the list.`}</MeetingCopy>
          <AgendaShortcutHint />
          {!isFacilitating && (
            <MeetingFacilitationHint>
              {'Waiting for'} <b>{preferredName}</b> {`to start the ${phaseName}`}
            </MeetingFacilitationHint>
          )}
        </FirstCallWrapper>
        {isFacilitating && (
          <StyledBottomBar>
            <BottomControlSpacer />
            <BottomNavControl
              isBouncing={minTimeComplete}
              onClick={() => gotoNext()}
              onKeyDown={handleRightArrow(() => gotoNext())}
              innerRef={gotoNextRef}
            >
              <BottomNavIconLabel icon='arrow_forward' iconColor='warm' label={phaseName} />
            </BottomNavControl>
            <EndMeetingButton meetingId={meetingId} />
          </StyledBottomBar>
        )}
      </ErrorBoundary>
      <MeetingHelpToggle
        floatAboveBottomBar={isFacilitating}
        menu={<ActionMeetingFirstCallHelpMenu />}
      />
    </MeetingContent>
  )
}

export default createFragmentContainer(ActionMeetingFirstCall, {
  team: graphql`
    fragment ActionMeetingFirstCall_team on Team {
      id
      isMeetingSidebarCollapsed
      newMeeting {
        id
        facilitatorUserId
        facilitator {
          preferredName
        }
      }
    }
  `
})
