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
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting'
import ui from 'universal/styles/ui'
import {CHECKIN} from 'universal/utils/constants'
import findStageAfterId from 'universal/utils/meetings/findStageAfterId'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import MeetingTypeEnum = GQL.MeetingTypeEnum

const CheckIn = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  padding: '1rem 0',
  width: '100%',

  [ui.breakpoint.wide]: {
    padding: '2rem 0'
  },

  [ui.breakpoint.wider]: {
    padding: '3rem 0'
  },

  [ui.breakpoint.widest]: {
    padding: '4rem 0'
  }
})

const Hint = styled('div')({
  marginTop: '2.5rem'
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
      facilitator: {facilitatorName, facilitatorUserId},
      localStage: {localStageId},
      phases
    } = newMeeting
    const teamMember = newMeeting.localStage.teamMember!
    const {isSelf: isMyMeetingSection} = teamMember
    const nextStageRes = findStageAfterId(phases, localStageId)
    // in case the checkin is the last phase of the meeting
    if (!nextStageRes) return null
    const {stage: nextStage, phase: nextPhase} = nextStageRes
    const lastCheckInStage = nextPhase.phaseType !== CHECKIN
    const nextMemberName =
      (nextStage && nextStage.teamMember && nextStage.teamMember.preferredName) || ''
    const {viewerId} = atmosphere
    const isFacilitating = facilitatorUserId === viewerId
    return (
      <React.Fragment>
        <MeetingSection flexToFill paddingBottom='1rem'>
          <NewMeetingCheckInPrompt team={team} teamMember={teamMember} />
          <CheckIn>
            {!isFacilitating && (
              <Hint>
                <MeetingFacilitationHint showEllipsis={lastCheckInStage || !isMyMeetingSection}>
                  {!lastCheckInStage ? (
                    <span>
                      {isMyMeetingSection ? (
                        <span>{'Share with your teammates!'}</span>
                      ) : (
                        <span>
                          {'Waiting for'} <b>{teamMember.preferredName}</b>{' '}
                          {'to share with the team'}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span>
                      {'Waiting for'} <b>{facilitatorName}</b>{' '}
                      {`to advance to ${actionMeeting.updates.name}`}
                    </span>
                  )}
                </MeetingFacilitationHint>
              </Hint>
            )}
          </CheckIn>
        </MeetingSection>
        {isFacilitating && (
          <MeetingControlBar>
            <CheckInControls
              checkInPressFactory={this.checkinPressFactory}
              currentMemberName={teamMember.preferredName}
              localPhaseItem={localStageId}
              nextMemberName={nextMemberName}
              nextPhaseName={phaseLabelLookup[nextPhase.phaseType]}
              gotoNextRef={gotoNextRef}
            />
          </MeetingControlBar>
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
          facilitatorName: preferredName
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
