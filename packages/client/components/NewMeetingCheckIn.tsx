import React, {ReactElement} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import Icon from './Icon'
import MeetingContent from './MeetingContent'
import MeetingTopBar from './MeetingTopBar'
import MeetingHelpToggle from './MenuHelpToggle'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import useAtmosphere from '../hooks/useAtmosphere'
import CheckInControls from '../modules/meeting/components/CheckInControls/CheckInControls'
import NewMeetingCheckInPrompt from '../modules/meeting/components/MeetingCheckInPrompt/NewMeetingCheckInPrompt'
import MeetingFacilitatorBar from '../modules/meeting/components/MeetingControlBar/MeetingFacilitatorBar'
import MeetingFacilitationHint from '../modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint'
import {PALETTE} from '../styles/paletteV2'
import {ICON_SIZE} from '../styles/typographyV2'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import lazyPreload from '../utils/lazyPreload'
import findStageAfterId from '../utils/meetings/findStageAfterId'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import EndMeetingButton from './EndMeetingButton'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import PhaseWrapper from './PhaseWrapper'
import {NewMeetingCheckIn_meeting} from '__generated__/NewMeetingCheckIn_meeting.graphql'
import useGotoNext from '../hooks/useGotoNext'

const CheckIn = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  minHeight: 98,
  padding: 16,
  width: '100%'
})

const Hint = styled('div')({
  marginTop: 16
})

const StyledIcon = styled(Icon)({
  color: PALETTE.TEXT_GRAY,
  display: 'block',
  margin: '0 auto 4px',
  width: ICON_SIZE.MD24
})

const CheckInHelpMenu = lazyPreload(async () =>
  import(/* webpackChunkName: 'CheckInHelpMenu' */ './MeetingHelp/CheckInHelpMenu')
)

interface Props {
  avatarGroup: ReactElement
  handleGotoNext: ReturnType<typeof useGotoNext>
  meeting: NewMeetingCheckIn_meeting
  toggleSidebar: () => void
}

const NewMeetingCheckIn = (props: Props) => {
  const {avatarGroup, handleGotoNext, meeting, toggleSidebar} = props
  const atmosphere = useAtmosphere()
  const {
    endedAt,
    showSidebar,
    facilitator: {userId: facilitatorUserId},
    localStage,
    id: meetingId,
    phases,
    meetingType
  } = meeting
  const {id: localStageId} = localStage
  const teamMember = localStage.teamMember!
  const meetingMember = localStage.meetingMember!
  const {userId} = teamMember
  const nextStageRes = findStageAfterId(phases, localStageId)
  // in case the checkin is the last phase of the meeting
  if (!nextStageRes) return null
  const {viewerId} = atmosphere
  const isFacilitating = facilitatorUserId === viewerId && !endedAt
  const isMyMeetingSection = userId === viewerId
  return (
    <MeetingContent>
      <MeetingHeaderAndPhase>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
        >
          <PhaseHeaderTitle>{phaseLabelLookup[NewMeetingPhaseTypeEnum.checkin]}</PhaseHeaderTitle>
        </MeetingTopBar>
        <PhaseWrapper>
          <NewMeetingCheckInPrompt meeting={meeting} teamMember={teamMember} />
          <CheckIn>
            {isMyMeetingSection && (
              <Hint>
                <StyledIcon>record_voice_over</StyledIcon>
                <MeetingFacilitationHint>
                  {'Verbally share your response with the team'}
                </MeetingFacilitationHint>
              </Hint>
            )}
          </CheckIn>
        </PhaseWrapper>
        <MeetingHelpToggle menu={<CheckInHelpMenu meetingType={meetingType} />} />
      </MeetingHeaderAndPhase>
      <MeetingFacilitatorBar isFacilitating={isFacilitating}>
        <CheckInControls handleGotoNext={handleGotoNext} meetingMember={meetingMember} />
        <EndMeetingButton meetingId={meetingId} isEnded={!!endedAt} />
      </MeetingFacilitatorBar>
    </MeetingContent>
  )
}

graphql`
  fragment NewMeetingCheckInLocalStage on CheckInStage {
    meetingMember {
      ...CheckInControls_meetingMember
    }
    teamMember {
      userId
      ...NewMeetingCheckInPrompt_teamMember
    }
  }
`

export default createFragmentContainer(NewMeetingCheckIn, {
  meeting: graphql`
    fragment NewMeetingCheckIn_meeting on NewMeeting {
      ...NewMeetingCheckInPrompt_meeting
      endedAt
      showSidebar
      meetingType
      id
      facilitatorStageId
      facilitator {
        userId
      }
      localStage {
        id
        ...NewMeetingCheckInLocalStage @relay(mask: false)
      }
      phases {
        stages {
          id
          ...NewMeetingCheckInLocalStage @relay(mask: false)
        }
      }
      teamId
    }
  `
})
