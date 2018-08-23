// @flow
import * as React from 'react'
import {createFragmentContainer} from 'react-relay'
import type {Match} from 'react-router-dom'
import {withRouter} from 'react-router-dom'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import type {MutationProps} from 'universal/utils/relay/withMutationProps'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import type {NewMeetingCheckIn_team as Team} from './__generated__/NewMeetingCheckIn_team.graphql'
import type {MeetingTypeEnum} from 'universal/types/schema.flow'
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting'
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection'
import MeetingFacilitationHint from 'universal/modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint'
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar'
import CheckInControls from 'universal/modules/meeting/components/CheckInControls/CheckInControls'
import ui from 'universal/styles/ui'
import styled from 'react-emotion'
import NewMeetingCheckInPrompt from 'universal/modules/meeting/components/MeetingCheckInPrompt/NewMeetingCheckInPrompt'
import findStageAfterId from 'universal/utils/meetings/findStageAfterId'
import {CHECKIN} from 'universal/utils/constants'
import withHotkey from 'react-hotkey-hoc'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'

import {meetingHelpWithBottomBar} from 'universal/styles/meeting'
import MeetingHelpMenuLayout from 'universal/components/MeetingHelpMenuLayout'
import CheckInHelpMenu from 'universal/components/MeetingHelp/CheckInHelpMenu'

const {Component} = React

const StyledMeetingHelpMenuLayout = styled(MeetingHelpMenuLayout)(({isFacilitating}) => ({
  bottom: isFacilitating && meetingHelpWithBottomBar
}))

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

type Props = {
  atmosphere: Object,
  match: Match,
  meetingType: MeetingTypeEnum,
  team: Team,
  ...MutationProps
}

class NewMeetingCheckIn extends Component<Props> {
  checkinPressFactory = (isCheckedIn) => () => {
    const {gotoNext} = this.props
    gotoNext({isCheckedIn})
  }

  render () {
    const {atmosphere, team, meetingType} = this.props
    const {newMeeting} = team
    const {
      facilitator: {facilitatorName, facilitatorUserId},
      localStage: {localStageId, teamMember},
      phases
    } = newMeeting
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
            />
          </MeetingControlBar>
        )}
        <StyledMeetingHelpMenuLayout isFacilitating={isFacilitating}>
          <CheckInHelpMenu meetingType={meetingType} />
        </StyledMeetingHelpMenuLayout>
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
