import {ActionMeetingFirstCall_team} from '../../__generated__/ActionMeetingFirstCall_team.graphql'
import ms from 'ms'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer, graphql} from 'react-relay'
import {ActionMeetingPhaseProps} from './ActionMeeting'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'
import ErrorBoundary from './ErrorBoundary'
import MeetingContent from './MeetingContent'
import MeetingContentHeader from './MeetingContentHeader'
import MeetingHelpToggle from './MenuHelpToggle'
import useAtmosphere from '../hooks/useAtmosphere'
import useTimeout from '../hooks/useTimeout'
import AgendaShortcutHint from '../modules/meeting/components/AgendaShortcutHint/AgendaShortcutHint'
import MeetingControlBar from '../modules/meeting/components/MeetingControlBar/MeetingControlBar'
import MeetingCopy from '../modules/meeting/components/MeetingCopy/MeetingCopy'
import MeetingFacilitationHint from '../modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint'
import MeetingPhaseHeading from '../modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading'
import {AGENDA_ITEM_LABEL, AGENDA_ITEMS} from '../utils/constants'
import handleRightArrow from '../utils/handleRightArrow'
import lazyPreload from '../utils/lazyPreload'
import {phaseLabelLookup} from '../utils/meetings/lookups'
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
    /* webpackChunkName: 'ActionMeetingFirstCallHelpMenu' */ './MeetingHelp/ActionMeetingFirstCallHelpMenu'
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
              ref={gotoNextRef}
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
