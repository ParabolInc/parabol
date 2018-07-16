// @flow
import * as React from 'react'
import {DragDropContext as dragDropContext} from '@mattkrick/react-dnd'
import HTML5Backend from '@mattkrick/react-dnd-html5-backend'
import withHotkey from 'react-hotkey-hoc'
import {createFragmentContainer, commitLocalUpdate} from 'react-relay'
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
import makeShadowColor from 'universal/styles/helpers/makeShadowColor'
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
import {
  meetingChromeBoxShadow,
  meetingSidebarMediaQuery,
  meetingSidebarWidth
} from 'universal/styles/meeting'
import {minWidthMediaQueries} from 'universal/styles/breakpoints'

const {Component} = React

const boxShadowNone = makeShadowColor(0)

const MeetingContainer = styled('div')({
  backgroundColor: ui.backgroundColor,
  display: 'flex',
  height: '100vh',
  overflowX: 'auto'
})

const MeetingSidebarLayout = styled('div')(({isMeetingSidebarCollapsed}) => ({
  boxShadow: isMeetingSidebarCollapsed ? boxShadowNone : meetingChromeBoxShadow[2],
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  position: 'absolute',
  transition: `
    box-shadow ${ui.transition[0]},
    transform ${ui.transition[0]}
  `,
  transform: isMeetingSidebarCollapsed
    ? `translate3d(-${meetingSidebarWidth}, 0, 0)`
    : 'translate3d(0, 0, 0)',
  width: meetingSidebarWidth,
  zIndex: 400,

  [meetingSidebarMediaQuery]: {
    boxShadow: isMeetingSidebarCollapsed ? boxShadowNone : meetingChromeBoxShadow[0]
  }
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

const SidebarBackdrop = styled('div')(({isMeetingSidebarCollapsed}) => ({
  backgroundColor: ui.modalBackdropBackgroundColor,
  bottom: 0,
  left: 0,
  opacity: isMeetingSidebarCollapsed ? 0 : 1,
  pointerEvents: isMeetingSidebarCollapsed && 'none',
  position: 'fixed',
  right: 0,
  top: 0,
  transition: `opacity ${ui.transition[0]}`,
  zIndex: 300,

  [meetingSidebarMediaQuery]: {
    display: 'none'
  }
}))

const LayoutPusher = styled('div')(({isMeetingSidebarCollapsed}) => ({
  display: 'none',

  [meetingSidebarMediaQuery]: {
    display: 'block',
    flexShrink: 0,
    transition: `width ${ui.transition[0]}`,
    width: isMeetingSidebarCollapsed ? 0 : meetingSidebarWidth
  }
}))

const MeetingAreaHeader = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flexShrink: 0,
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  margin: 0,
  maxWidth: '100%',
  padding: '0 1rem 1rem',
  width: '100%',
  [minWidthMediaQueries[3]]: {
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

type Variables = {
  meetingId: string,
  facilitatorStageId: ?string,
  completedStageId?: string
}

class NewMeeting extends Component<Props> {
  constructor (props) {
    super(props)
    const {bindHotkey} = props
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
    } = findStageById(phases, stageId)
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
    const {
      atmosphere,
      viewer: {
        team: {teamId, isMeetingSidebarCollapsed}
      }
    } = this.props
    commitLocalUpdate(atmosphere, (store) => {
      store.get(teamId).setValue(!isMeetingSidebarCollapsed, 'isMeetingSidebarCollapsed')
    })
  }

  render () {
    const {atmosphere, meetingType, viewer} = this.props
    const {team} = viewer
    const {newMeeting, isMeetingSidebarCollapsed, teamName, tier} = team
    const {facilitatorStageId, facilitatorUserId, localPhase, localStage} = newMeeting || {}
    const {viewerId} = atmosphere
    const isFacilitating = viewerId === facilitatorUserId
    const meetingLabel = meetingTypeToLabel[meetingType]
    const inSync = localStage ? localStage.localStageId === facilitatorStageId : true
    const localPhaseType = localPhase && localPhase.phaseType
    const retroLobbyHelpContent = tier === PRO ? RETRO_LOBBY_PAID : RETRO_LOBBY_FREE
    return (
      <MeetingContainer>
        <Helmet title={`${meetingLabel} Meeting | ${teamName}`} />
        <MeetingSidebarLayout isMeetingSidebarCollapsed={isMeetingSidebarCollapsed}>
          <NewMeetingSidebar
            gotoStageId={this.gotoStageId}
            meetingType={meetingType}
            toggleSidebar={this.toggleSidebar}
            viewer={viewer}
          />
        </MeetingSidebarLayout>
        <SidebarBackdrop
          onClick={this.toggleSidebar}
          isMeetingSidebarCollapsed={isMeetingSidebarCollapsed}
        />
        <MeetingArea>
          <LayoutPusher isMeetingSidebarCollapsed={isMeetingSidebarCollapsed} />
          <MeetingContent>
            {/* For performance, the correct height of this component should load synchronously, otherwise the grouping grid will be off */}
            <MeetingAreaHeader>
              <NewMeetingPhaseHeading
                meeting={newMeeting}
                isMeetingSidebarCollapsed={isMeetingSidebarCollapsed}
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
        isMeetingSidebarCollapsed
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
