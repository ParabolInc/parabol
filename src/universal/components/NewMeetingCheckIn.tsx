import {NewMeetingCheckIn_team} from '__generated__/NewMeetingCheckIn_team.graphql'
import React, {Component} from 'react'
import styled from 'react-emotion'
import withHotkey from 'react-hotkey-hoc'
import {createFragmentContainer, graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import CheckInHelpMenu from 'universal/components/MeetingHelp/CheckInHelpMenu'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import CheckInControls from 'universal/modules/meeting/components/CheckInControls/CheckInControls'
import NewMeetingCheckInPrompt from 'universal/modules/meeting/components/MeetingCheckInPrompt/NewMeetingCheckInPrompt'
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar'
import MeetingFacilitationHint from 'universal/modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint'
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection'
import {MeetingTypeEnum} from 'universal/types/graphql'
import findStageAfterId from 'universal/utils/meetings/findStageAfterId'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import EndMeetingButton from './EndMeetingButton'
import Icon from 'universal/components/Icon'
import {PALETTE} from 'universal/styles/paletteV2'
import {ICON_SIZE} from 'universal/styles/typographyV2'

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
  color: PALETTE.TEXT.LIGHT,
  display: 'block',
  margin: '0 auto 4px',
  width: ICON_SIZE.MD24
})

interface Props extends WithAtmosphereProps, WithMutationProps, RouteComponentProps<{}> {
  gotoNext (options: {isCheckedIn: boolean}): void
  gotoNextRef: React.RefObject<HTMLDivElement>
  meetingType: MeetingTypeEnum
  team: NewMeetingCheckIn_team
}

class NewMeetingCheckIn extends Component<Props> {
  checkinPressFactory = (isCheckedIn) => () => {
    const {gotoNext} = this.props
    gotoNext({isCheckedIn})
  }

  render () {
    const {atmosphere, gotoNextRef, team, meetingType} = this.props
    const {newMeeting} = team
    if (!newMeeting) return
    const {
      facilitator: {facilitatorUserId},
      localStage: {localStageId},
      meetingId,
      phases
    } = newMeeting
    const teamMember = newMeeting.localStage.teamMember!
    const {isSelf: isMyMeetingSection} = teamMember
    const nextStageRes = findStageAfterId(phases, localStageId)
    // in case the checkin is the last phase of the meeting
    if (!nextStageRes) return null
    const {viewerId} = atmosphere
    const isFacilitating = facilitatorUserId === viewerId
    return (
      <React.Fragment>
        <MeetingSection flexToFill paddingBottom='1rem'>
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
        </MeetingSection>
        {isFacilitating && (
          <StyledBottomBar>
            <BottomControlSpacer />
            <CheckInControls
              checkInPressFactory={this.checkinPressFactory}
              currentMemberName={teamMember.preferredName}
              localPhaseItem={localStageId}
              gotoNextRef={gotoNextRef}
            />
            <EndMeetingButton meetingId={meetingId} />
          </StyledBottomBar>
        )}
        <CheckInHelpMenu floatAboveBottomBar={isFacilitating} meetingType={meetingType} />
      </React.Fragment>
    )
  }
}

export default createFragmentContainer(
  withHotkey(withRouter(withAtmosphere(withMutationProps(NewMeetingCheckIn)))),
  graphql`
    fragment NewMeetingCheckIn_team on Team {
      ...NewMeetingCheckInPrompt_team
      newMeeting {
        meetingId: id
        facilitatorStageId
        facilitator {
          facilitatorUserId: id
        }
        localStage {
          localStageId: id
          ... on CheckInStage {
            teamMember {
              id
              isSelf
              preferredName
              userId
              meetingMember {
                isCheckedIn
              }
              ...NewMeetingCheckInPrompt_teamMember
            }
          }
        }
        phases {
          phaseType
          stages {
            id
            ... on CheckInStage {
              teamMember {
                id
                isSelf
                meetingMember {
                  isCheckedIn
                }
                preferredName
                userId
              }
            }
          }
        }
      }
      teamId: id
    }
  `
)
