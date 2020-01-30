import {ActionMeetingFirstCall_meeting} from '../__generated__/ActionMeetingFirstCall_meeting.graphql'
import ms from 'ms'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {ActionMeetingPhaseProps} from './ActionMeeting'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'
import MeetingContent from './MeetingContent'
import MeetingTopBar from './MeetingTopBar'
import MeetingHelpToggle from './MenuHelpToggle'
import useAtmosphere from '../hooks/useAtmosphere'
import useTimeout from '../hooks/useTimeout'
import AgendaShortcutHint from '../modules/meeting/components/AgendaShortcutHint/AgendaShortcutHint'
import MeetingFacilitatorBar from '../modules/meeting/components/MeetingControlBar/MeetingFacilitatorBar'
import MeetingCopy from '../modules/meeting/components/MeetingCopy/MeetingCopy'
import MeetingFacilitationHint from '../modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint'
import MeetingPhaseHeading from '../modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading'
import {AGENDA_ITEM_LABEL, AGENDA_ITEMS} from '../utils/constants'
import handleRightArrow from '../utils/handleRightArrow'
import lazyPreload from '../utils/lazyPreload'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import EndMeetingButton from './EndMeetingButton'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import PhaseWrapper from './PhaseWrapper'
import PhaseHeaderTitle from './PhaseHeaderTitle'

const BottomControlSpacer = styled('div')({
  minWidth: 90
})

interface Props extends ActionMeetingPhaseProps {
  meeting: ActionMeetingFirstCall_meeting
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
  const {avatarGroup, toggleSidebar, meeting, handleGotoNext} = props
  const atmosphere = useAtmosphere()
  const {gotoNext, ref: gotoNextRef} = handleGotoNext
  const minTimeComplete = useTimeout(ms('30s'))
  const {viewerId} = atmosphere
  const {endedAt, facilitator, facilitatorUserId, id: meetingId, showSidebar} = meeting
  const {preferredName} = facilitator
  const isFacilitating = facilitatorUserId === viewerId && !endedAt
  const phaseName = phaseLabelLookup[AGENDA_ITEMS]
  return (
    <MeetingContent>
      <MeetingHeaderAndPhase>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
        >
          <PhaseHeaderTitle>
            {phaseLabelLookup[NewMeetingPhaseTypeEnum.agendaitems]}
          </PhaseHeaderTitle>
        </MeetingTopBar>
        <PhaseWrapper>
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
        </PhaseWrapper>
        <MeetingHelpToggle menu={<ActionMeetingFirstCallHelpMenu />} />
      </MeetingHeaderAndPhase>
      <MeetingFacilitatorBar isFacilitating={isFacilitating}>
        <BottomControlSpacer />
        <BottomNavControl
          isBouncing={minTimeComplete}
          onClick={() => gotoNext()}
          onKeyDown={handleRightArrow(() => gotoNext())}
          ref={gotoNextRef}
        >
          <BottomNavIconLabel icon='arrow_forward' iconColor='warm' label={phaseName} />
        </BottomNavControl>
        <EndMeetingButton meetingId={meetingId} isEnded={!!endedAt} />
      </MeetingFacilitatorBar>
    </MeetingContent>
  )
}

export default createFragmentContainer(ActionMeetingFirstCall, {
  meeting: graphql`
    fragment ActionMeetingFirstCall_meeting on ActionMeeting {
      id
      showSidebar
      endedAt
      facilitatorUserId
      facilitator {
        preferredName
      }
    }
  `
})
