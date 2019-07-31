import {NewMeetingCheckIn_team} from '../__generated__/NewMeetingCheckIn_team.graphql'
import React, {ReactElement} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import ErrorBoundary from './ErrorBoundary'
import Icon from './Icon'
import MeetingContent from './MeetingContent'
import MeetingContentHeader from './MeetingContentHeader'
import MeetingHelpToggle from './MenuHelpToggle'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import useAtmosphere from '../hooks/useAtmosphere'
import {useGotoNext} from '../hooks/useMeeting'
import CheckInControls from '../modules/meeting/components/CheckInControls/CheckInControls'
import NewMeetingCheckInPrompt from '../modules/meeting/components/MeetingCheckInPrompt/NewMeetingCheckInPrompt'
import MeetingControlBar from '../modules/meeting/components/MeetingControlBar/MeetingControlBar'
import MeetingFacilitationHint from '../modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint'
import {PALETTE} from '../styles/paletteV2'
import {ICON_SIZE} from '../styles/typographyV2'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import lazyPreload from '../utils/lazyPreload'
import findStageAfterId from '../utils/meetings/findStageAfterId'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import EndMeetingButton from './EndMeetingButton'

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

const BottomControlSpacer = styled('div')({
  minWidth: 96
})

const StyledBottomBar = styled(MeetingControlBar)({
  justifyContent: 'space-between'
})

const StyledIcon = styled(Icon)({
  color: PALETTE.TEXT_LIGHT,
  display: 'block',
  margin: '0 auto 4px',
  width: ICON_SIZE.MD24
})

const CheckInWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%'
})

const CheckInHelpMenu = lazyPreload(async () =>
  import(
    /* webpackChunkName: 'CheckInHelpMenu' */ './MeetingHelp/CheckInHelpMenu'
  )
)

interface Props {
  avatarGroup: ReactElement
  handleGotoNext: ReturnType<typeof useGotoNext>
  team: NewMeetingCheckIn_team
  toggleSidebar: () => void
}

const NewMeetingCheckIn = (props: Props) => {
  const {avatarGroup, handleGotoNext, team, toggleSidebar} = props
  const atmosphere = useAtmosphere()
  const {isMeetingSidebarCollapsed, newMeeting} = team
  if (!newMeeting) return null
  const {
    facilitator: {userId: facilitatorUserId},
    localStage: {id: localStageId},
    id: meetingId,
    phases,
    meetingType
  } = newMeeting
  const teamMember = newMeeting.localStage.teamMember!
  const {userId} = teamMember
  const nextStageRes = findStageAfterId(phases, localStageId)
  // in case the checkin is the last phase of the meeting
  if (!nextStageRes) return null
  const {viewerId} = atmosphere
  const isFacilitating = facilitatorUserId === viewerId
  const isMyMeetingSection = userId === viewerId
  return (
    <MeetingContent>
      <MeetingContentHeader
        avatarGroup={avatarGroup}
        isMeetingSidebarCollapsed={!!isMeetingSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      >
        <PhaseHeaderTitle>{phaseLabelLookup[NewMeetingPhaseTypeEnum.checkin]}</PhaseHeaderTitle>
      </MeetingContentHeader>
      <ErrorBoundary>
        <CheckInWrapper>
          <NewMeetingCheckInPrompt team={team} teamMember={teamMember} />
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
        </CheckInWrapper>
        {isFacilitating && (
          <StyledBottomBar>
            <BottomControlSpacer />
            <CheckInControls handleGotoNext={handleGotoNext} teamMember={teamMember} />
            <EndMeetingButton meetingId={meetingId} />
          </StyledBottomBar>
        )}
        <MeetingHelpToggle
          floatAboveBottomBar={isFacilitating}
          menu={<CheckInHelpMenu meetingType={meetingType} />}
        />
      </ErrorBoundary>
    </MeetingContent>
  )
}

graphql`
  fragment NewMeetingCheckInLocalStage on CheckInStage {
    teamMember {
      userId
      ...NewMeetingCheckInPrompt_teamMember
      ...CheckInControls_teamMember
    }
  }
`

export default createFragmentContainer(NewMeetingCheckIn, {
  team: graphql`
    fragment NewMeetingCheckIn_team on Team {
      ...NewMeetingCheckInPrompt_team
      isMeetingSidebarCollapsed
      newMeeting {
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
      }
      teamId: id
    }
  `
})
