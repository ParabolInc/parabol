// @flow
import * as React from 'react'
import {DragDropContext as dragDropContext} from '@mattkrick/react-dnd'
import HTML5Backend from '@mattkrick/react-dnd-html5-backend'
import withHotkey from 'react-hotkey-hoc'
import {createFragmentContainer} from 'react-relay'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import type {Match, RouterHistory} from 'react-router-dom'
import {withRouter} from 'react-router-dom'
import styled from 'react-emotion'
import {Helmet} from 'react-helmet'
import NewMeetingSidebar from 'universal/components/NewMeetingSidebar'
import NewMeetingLobby from 'universal/components/NewMeetingLobby'
import type {MeetingTypeEnum} from 'universal/types/schema.flow'
import RetroReflectPhase from 'universal/components/RetroReflectPhase/RetroReflectPhase'
import type {NewMeeting_viewer as Viewer} from './__generated__/NewMeeting_viewer.graphql'
import {meetingTypeToLabel} from 'universal/utils/meetings/lookups'
import ui from 'universal/styles/ui'
import {
  RETRO_LOBBY_FREE,
  RETRO_LOBBY_PAID,
  CHECKIN,
  DISCUSS,
  GROUP,
  REFLECT,
  VOTE,
  PRO
} from 'universal/utils/constants'
import NewMeetingCheckIn from 'universal/components/NewMeetingCheckIn'
import findStageById from 'universal/utils/meetings/findStageById'
import NavigateMeetingMutation from 'universal/mutations/NavigateMeetingMutation'
import ErrorBoundary from 'universal/components/ErrorBoundary'
import findStageAfterId from 'universal/utils/meetings/findStageAfterId'
import findStageBeforeId from 'universal/utils/meetings/findStageBeforeId'
import handleHotkey from 'universal/utils/meetings/handleHotkey'
import {connect} from 'react-redux'
import EndNewMeetingMutation from 'universal/mutations/EndNewMeetingMutation'
import RejoinFacilitatorButton from 'universal/modules/meeting/components/RejoinFacilitatorButton/RejoinFacilitatorButton'
import type {Dispatch} from 'redux'
import NewMeetingAvatarGroup from 'universal/modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup'
import updateLocalStage from 'universal/utils/relay/updateLocalStage'
import NewMeetingPhaseHeading from 'universal/components/NewMeetingPhaseHeading/NewMeetingPhaseHeading'
import RetroGroupPhase from 'universal/components/RetroGroupPhase'
import RetroVotePhase from 'universal/components/RetroVotePhase'
import RetroDiscussPhase from 'universal/components/RetroDiscussPhase'
import NewMeetingCheckInMutation from 'universal/mutations/NewMeetingCheckInMutation'
import MeetingHelpDialog from 'universal/modules/meeting/components/MeetingHelpDialog/MeetingHelpDialog'
import isForwardProgress from 'universal/utils/meetings/isForwardProgress'

const {Component} = React

const MeetingContainer = styled('div')({
  backgroundColor: ui.backgroundColor,
  display: 'flex',
  height: '100vh',
  overflowX: 'auto'
})

const MeetingSidebarLayout = styled('div')(({sidebarCollapsed}) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  position: 'absolute',
  transition: `
    box-shadow ${ui.transition[0]},
    transform ${ui.transition[0]}
  `,
  transform: sidebarCollapsed
    ? `translate3d(-${ui.meetingSidebarWidth}, 0, 0)`
    : 'translate3d(0, 0, 0)',
  width: ui.meetingSidebarWidth,
  zIndex: 200
}))

const MeetingArea = styled('div')({
  display: 'flex',
  width: '100%',
  zIndex: 100
})

const MeetingContent = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  width: '100%'
})

const LayoutPusher = styled('div')(({sidebarCollapsed}) => ({
  flexShrink: 0,
  transition: `width ${ui.transition[0]}`,
  width: sidebarCollapsed ? 0 : ui.meetingSidebarWidth
}))

const MeetingAreaHeader = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  margin: 0,
  maxWidth: '100%',
  padding: '0 1rem 1rem',
  width: '100%',
  [ui.breakpoint.wide]: {
    padding: '0 1rem 2rem'
  }
})

const MeetingHelpBlock = styled('div')(({isFacilitating}) => ({
  bottom: isFacilitating ? '5.25rem' : '1.25rem',
  position: 'fixed',
  right: '1.25rem',
  zIndex: 200
}))

type Props = {
  atmosphere: Object,
  bindHotkey: (mousetrapKey: string | Array<string>, cb: () => void) => void,
  dispatch: Dispatch<*>,
  history: RouterHistory,
  match: Match,
  meetingType: MeetingTypeEnum,
  submitting: boolean,
  viewer: Viewer
}

type State = {
  sidebarCollapsed: boolean
}

type Variables = {
  meetingId: string,
  facilitatorStageId: ?string,
  completedStageId?: string
}

class NewMeeting extends Component<Props, State> {
  constructor (props) {
    super(props)
    const {bindHotkey} = props
    this.state = {
      sidebarCollapsed: false
    }
    bindHotkey(['enter', 'right'], handleHotkey(this.gotoNext))
    bindHotkey('left', handleHotkey(this.gotoPrev))
    bindHotkey('i c a n t h a c k i t', handleHotkey(this.endMeeting))
  }

  endMeeting = () => {
    const {
      atmosphere,
      dispatch,
      history,
      viewer: {
        team: {newMeeting}
      }
    } = this.props
    if (!newMeeting) return
    const {meetingId} = newMeeting
    EndNewMeetingMutation(atmosphere, {meetingId}, {dispatch, history})
  }

  gotoStageId = (stageId, submitMutation, onError, onCompleted) => {
    const {
      atmosphere,
      submitting,
      viewer: {
        team: {newMeeting}
      }
    } = this.props
    if (submitting) return
    if (!newMeeting) return
    const {facilitatorStageId, facilitatorUserId, meetingId, phases} = newMeeting
    const {viewerId} = atmosphere
    const isViewerFacilitator = viewerId === facilitatorUserId
    const {
      stage: {isNavigable, isNavigableByFacilitator}
    } = findStageById(phases, facilitatorStageId)
    const canNavigate = isViewerFacilitator ? isNavigableByFacilitator : isNavigable
    if (!canNavigate) return
    updateLocalStage(atmosphere, meetingId, stageId)
    if (isViewerFacilitator && isNavigableByFacilitator) {
      const {
        stage: {isComplete}
      } = findStageById(phases, facilitatorStageId)
      const variables: Variables = {meetingId, facilitatorStageId: stageId}
      if (!isComplete && isForwardProgress(phases, facilitatorStageId, stageId)) {
        variables.completedStageId = facilitatorStageId
      }
      // submitMutation();
      NavigateMeetingMutation(atmosphere, variables, onError, onCompleted)
    }
  }

  gotoNext = (options) => {
    const {
      atmosphere,
      submitting,
      viewer: {
        team: {newMeeting}
      }
    } = this.props
    if (!newMeeting || submitting) return
    const {
      meetingId,
      localPhase: {phaseType},
      localStage: {localStageId, teamMember},
      phases
    } = newMeeting
    // it feels dirty to put phase-specific logic here,
    // but if we didn't each phase would have to handle the keybinding & unbind it on a setTimeout, which is dirtier
    if (phaseType === CHECKIN) {
      if (!teamMember) return
      const {meetingMember, userId} = teamMember
      if (!meetingMember) return
      const {isCheckedIn} = meetingMember
      const nextCheckedInValue = options ? options.isCheckedIn : true
      if (isCheckedIn !== nextCheckedInValue) {
        NewMeetingCheckInMutation(atmosphere, {meetingId, userId, isCheckedIn: nextCheckedInValue})
      }
    }
    const nextStageRes = findStageAfterId(phases, localStageId)
    if (!nextStageRes) return
    const {
      stage: {id: nextStageId}
    } = nextStageRes
    this.gotoStageId(nextStageId)
  }

  gotoPrev = () => {
    const {
      viewer: {
        team: {newMeeting}
      }
    } = this.props
    if (!newMeeting) return
    const {
      localStage: {localStageId},
      phases
    } = newMeeting
    const nextStageRes = findStageBeforeId(phases, localStageId)
    if (!nextStageRes) return
    const {
      stage: {id: nextStageId}
    } = nextStageRes
    this.gotoStageId(nextStageId)
  }

  toggleSidebar = () => {
    this.setState({
      sidebarCollapsed: !this.state.sidebarCollapsed
    })
  }

  render () {
    const {atmosphere, meetingType, viewer} = this.props
    const {team} = viewer
    const {newMeeting, teamName, tier} = team
    const {facilitatorStageId, facilitatorUserId, localPhase, localStage} = newMeeting || {}
    const {viewerId} = atmosphere
    const isFacilitating = viewerId === facilitatorUserId
    const meetingLabel = meetingTypeToLabel[meetingType]
    const inSync = localStage ? localStage.localStageId === facilitatorStageId : true
    const localPhaseType = localPhase && localPhase.phaseType
    const retroLobbyHelpContent = tier === PRO ? RETRO_LOBBY_PAID : RETRO_LOBBY_FREE
    const {sidebarCollapsed} = this.state
    const hasToggle = localPhase
    return (
      <MeetingContainer>
        <Helmet title={`${meetingLabel} Meeting | ${teamName}`} />
        <MeetingSidebarLayout sidebarCollapsed={sidebarCollapsed}>
          <NewMeetingSidebar
            gotoStageId={this.gotoStageId}
            meetingType={meetingType}
            hasToggle={hasToggle}
            toggleSidebar={this.toggleSidebar}
            viewer={viewer}
          />
        </MeetingSidebarLayout>
        <MeetingArea>
          <LayoutPusher sidebarCollapsed={sidebarCollapsed} />
          <MeetingContent>
            {/* For performance, the correct height of this component should load synchronously, otherwise the grouping grid will be off */}
            <MeetingAreaHeader>
              <NewMeetingPhaseHeading
                hasToggle={sidebarCollapsed}
                meeting={newMeeting}
                toggleSidebar={this.toggleSidebar}
              />
              <NewMeetingAvatarGroup gotoStageId={this.gotoStageId} team={team} />
            </MeetingAreaHeader>
            <ErrorBoundary>
              <React.Fragment>
                {localPhaseType === CHECKIN && (
                  <NewMeetingCheckIn
                    gotoNext={this.gotoNext}
                    meetingType={meetingType}
                    team={team}
                  />
                )}
                {localPhaseType === REFLECT && (
                  <RetroReflectPhase gotoNext={this.gotoNext} team={team} />
                )}
                {localPhaseType === GROUP && (
                  <RetroGroupPhase gotoNext={this.gotoNext} team={team} />
                )}
                {localPhaseType === VOTE && <RetroVotePhase gotoNext={this.gotoNext} team={team} />}
                {localPhaseType === DISCUSS && (
                  <RetroDiscussPhase gotoNext={this.gotoNext} team={team} />
                )}
                {!localPhaseType && <NewMeetingLobby meetingType={meetingType} team={team} />}
              </React.Fragment>
            </ErrorBoundary>
          </MeetingContent>
        </MeetingArea>
        {!inSync && (
          <RejoinFacilitatorButton onClickHandler={() => this.gotoStageId(facilitatorStageId)} />
        )}
        <MeetingHelpBlock isFacilitating={isFacilitating}>
          <MeetingHelpDialog phase={localPhaseType || retroLobbyHelpContent} />
        </MeetingHelpBlock>
      </MeetingContainer>
    )
  }
}

export default createFragmentContainer(
  dragDropContext(HTML5Backend)(
    withHotkey(withAtmosphere(withMutationProps(withRouter(connect()(NewMeeting)))))
  ),
  graphql`
    fragment NewMeeting_viewer on User {
      ...NewMeetingSidebar_viewer
      team(teamId: $teamId) {
        ...NewMeetingAvatarGroup_team
        ...NewMeetingLobby_team
        ...NewMeetingCheckIn_team
        ...RetroReflectPhase_team
        ...RetroGroupPhase_team
        ...RetroVotePhase_team
        ...RetroDiscussPhase_team
        checkInGreeting {
          content
          language
        }
        checkInQuestion
        teamId: id
        teamName: name
        meetingId
        tier
        teamMembers(sortBy: "checkInOrder") {
          id
          preferredName
          picture
          checkInOrder
          isConnected
          isFacilitator
          isLead
          isSelf
          userId
        }
        newMeeting {
          ...NewMeetingPhaseHeading_meeting
          meetingId: id
          facilitatorStageId
          facilitatorUserId
          localPhase {
            phaseType
          }
          localStage {
            localStageId: id
            ... on CheckInStage {
              teamMember {
                meetingMember {
                  isCheckedIn
                }
                userId
              }
            }
          }
          phases {
            id
            phaseType
            stages {
              id
              isComplete
              isNavigable
              isNavigableByFacilitator
            }
          }
        }
      }
    }
  `
)
