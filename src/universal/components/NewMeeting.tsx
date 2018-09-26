import FastRTCSwarm from '@mattkrick/fast-rtc-swarm'
import {NewMeeting_viewer} from '__generated__/NewMeeting_viewer.graphql'
import React from 'react'
import {DragDropContext as dragDropContext} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import styled from 'react-emotion'
import {Helmet} from 'react-helmet'
import withHotkey from 'react-hotkey-hoc'
import {connect} from 'react-redux'
import {commitLocalUpdate, createFragmentContainer, graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import {Dispatch} from 'redux'
import ErrorBoundary from 'universal/components/ErrorBoundary'
import NewMeetingCheckIn from 'universal/components/NewMeetingCheckIn'
import NewMeetingLobby from 'universal/components/NewMeetingLobby'
import NewMeetingPhaseHeading from 'universal/components/NewMeetingPhaseHeading/NewMeetingPhaseHeading'
import NewMeetingSidebar from 'universal/components/NewMeetingSidebar'
import RetroDiscussPhase from 'universal/components/RetroDiscussPhase'
import RetroGroupPhase from 'universal/components/RetroGroupPhase'
import RetroReflectPhase from 'universal/components/RetroReflectPhase/RetroReflectPhase'
import RetroVotePhase from 'universal/components/RetroVotePhase'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import NewMeetingAvatarGroup from 'universal/modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup'
import RejoinFacilitatorButton from 'universal/modules/meeting/components/RejoinFacilitatorButton/RejoinFacilitatorButton'
import EndNewMeetingMutation from 'universal/mutations/EndNewMeetingMutation'
import NavigateMeetingMutation from 'universal/mutations/NavigateMeetingMutation'
import NewMeetingCheckInMutation from 'universal/mutations/NewMeetingCheckInMutation'
import {minWidthMediaQueries} from 'universal/styles/breakpoints'
import makeShadowColor from 'universal/styles/helpers/makeShadowColor'
import {
  meetingChromeBoxShadow,
  meetingSidebarMediaQuery,
  meetingSidebarWidth
} from 'universal/styles/meeting'
import ui from 'universal/styles/ui'
import {CHECKIN, DISCUSS, GROUP, REFLECT, VOTE} from 'universal/utils/constants'
import findStageAfterId from 'universal/utils/meetings/findStageAfterId'
import findStageBeforeId from 'universal/utils/meetings/findStageBeforeId'
import findStageById from 'universal/utils/meetings/findStageById'
import handleHotkey from 'universal/utils/meetings/handleHotkey'
import isForwardProgress from 'universal/utils/meetings/isForwardProgress'
import {meetingTypeToLabel} from 'universal/utils/meetings/lookups'
import updateLocalStage from 'universal/utils/relay/updateLocalStage'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import UNSTARTED_MEETING from '../utils/meetings/unstartedMeeting'
import INavigateMeetingOnMutationArguments = GQL.INavigateMeetingOnMutationArguments
import MeetingTypeEnum = GQL.MeetingTypeEnum

const {Component} = React

const boxShadowNone = makeShadowColor(0)

const MeetingContainer = styled('div')({
  backgroundColor: ui.backgroundColor,
  display: 'flex',
  height: '100vh',
  overflowX: 'auto'
})

interface SidebarStyleProps {
  isMeetingSidebarCollapsed?: boolean | null
}

const MeetingSidebarLayout = styled('div')(({isMeetingSidebarCollapsed}: SidebarStyleProps) => ({
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
  width: '100%'
  // This just seemed wrong & blocked modals
  // zIndex: 100
})

const MeetingContent = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  width: '100%'
})

const SidebarBackdrop = styled('div')(({isMeetingSidebarCollapsed}: SidebarStyleProps) => ({
  backgroundColor: ui.modalBackdropBackgroundColor,
  bottom: 0,
  left: 0,
  opacity: isMeetingSidebarCollapsed ? 0 : 1,
  pointerEvents: isMeetingSidebarCollapsed ? 'none' : undefined,
  position: 'fixed',
  right: 0,
  top: 0,
  transition: `opacity ${ui.transition[0]}`,
  zIndex: 300,

  [meetingSidebarMediaQuery]: {
    display: 'none'
  }
}))

const LayoutPusher = styled('div')(({isMeetingSidebarCollapsed}: SidebarStyleProps) => ({
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

interface Props extends WithAtmosphereProps, RouteComponentProps<{}>, WithMutationProps {
  bindHotkey: (mousetrapKey: string | Array<string>, cb: () => void) => void
  dispatch: Dispatch<any>
  meetingType: MeetingTypeEnum
  viewer: NewMeeting_viewer
}

export interface ViewerStreamLookup {
  [viewerId: string]: Array<MediaStream>
}

interface State {
  viewerStreamLookup: ViewerStreamLookup
}

class NewMeeting extends Component<Props, State> {
  state = {
    viewerStreamLookup: {}
  }

  constructor (props) {
    super(props)
    const {atmosphere, bindHotkey} = props
    bindHotkey('right', handleHotkey(this.maybeGotoNext))
    bindHotkey('left', handleHotkey(this.gotoPrev))
    bindHotkey('i c a n t h a c k i t', handleHotkey(this.endMeeting))
    if (atmosphere.transport.trebuchet) {
      this.createSwarm().catch()
    } else {
      atmosphere.eventEmitter.once('newSubscriptionClient', () => {
        this.createSwarm().catch()
      })
    }
  }

  sidebarRef = React.createRef()
  gotoNextRef = React.createRef<HTMLDivElement>()
  swarm!: FastRTCSwarm

  createSwarm = async () => {
    const {atmosphere} = this.props
    const {
      viewerId,
      transport: {trebuchet}
    } = atmosphere
    const {viewerStreamLookup} = this.state
    let streams
    try {
      streams = [await navigator.mediaDevices.getUserMedia({video: true, audio: true})]
    } catch (e) {
      streams = []
    }
    const audio = {streams}
    const video = {streams}
    const swarm = new FastRTCSwarm({sdpSemantics: 'unified-plan', video, audio} as any)
    trebuchet.on('data', (data) => {
      const payload = JSON.parse(data)
      swarm.dispatch(payload)
    })

    swarm.on('signal', (signal) => {
      trebuchet.send(JSON.stringify({type: 'WRTC_SIGNAL', signal}))
    })
    swarm.on('dataOpen', (peer) => {
      peer.send(JSON.stringify({type: 'init', viewerId}))
    })

    const initQueue: {[peerId: string]: Array<() => void>} = {}
    const addStream = (stream, peer) => {
      const {viewerId} = peer
      const streams = (viewerStreamLookup[viewerId] = viewerStreamLookup[viewerId] || [])
      if (!streams.includes(stream)) {
        streams.push(stream)
        this.setState({
          // low-effort immutability
          viewerStreamLookup: {...viewerStreamLookup}
        })
      }
    }

    swarm.on('data', (data, peer) => {
      const payload = JSON.parse(data)
      if (payload.type === 'init') {
        peer.viewerId = payload.viewerId
        const queue = initQueue[peer.id]
        if (queue) {
          queue.forEach((thunk) => thunk())
          delete initQueue[peer.id]
        }
      }
    })

    swarm.on('stream', (stream, peer) => {
      const {viewerId} = peer
      if (viewerId) {
        addStream(stream, peer)
      } else {
        initQueue[peer.id] = initQueue[peer.id] || []
        initQueue[peer.id].push(() => addStream(stream, peer))
      }
    })
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

  gotoStageId = (
    stageId: string,
    _submitMutation?: WithMutationProps['submitMutation'],
    onError?: WithMutationProps['onError'],
    onCompleted?: WithMutationProps['onCompleted']
  ) => {
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
      const variables = {
        meetingId,
        facilitatorStageId: stageId
      } as INavigateMeetingOnMutationArguments
      if (!isComplete && isForwardProgress(phases, facilitatorStageId, stageId)) {
        variables.completedStageId = facilitatorStageId
      }
      // submitMutation();
      NavigateMeetingMutation(atmosphere, variables, onError, onCompleted)
    }
  }

  maybeGotoNext = () => this.gotoNext({isHotkey: true})

  gotoNext = (options: {isCheckedIn?: boolean; isHotkey?: boolean} = {}) => {
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
      const nextCheckedInValue = 'isCheckedIn' in options ? options.isCheckedIn : true
      if (isCheckedIn !== nextCheckedInValue) {
        NewMeetingCheckInMutation(atmosphere, {meetingId, userId, isCheckedIn: nextCheckedInValue})
      }
    }
    const currentStageRes = findStageById(phases, localStageId)
    const nextStageRes = findStageAfterId(phases, localStageId)
    if (!nextStageRes) return
    const {
      stage: {id: nextStageId}
    } = nextStageRes
    const gotoNextDiv = this.gotoNextRef.current
    if (!options.isHotkey || currentStageRes.stage.isComplete) {
      this.gotoStageId(nextStageId)
    } else if (options.isHotkey) {
      gotoNextDiv && gotoNextDiv.focus()
    }
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
      store.get(teamId)!.setValue(!isMeetingSidebarCollapsed, 'isMeetingSidebarCollapsed')
    })
  }

  onSidebarTransitionEnd = (e) => {
    const {
      atmosphere: {eventEmitter},
      viewer: {
        team: {isMeetingSidebarCollapsed}
      }
    } = this.props
    if (e.target === this.sidebarRef.current && e.propertyName === 'transform') {
      eventEmitter.emit('meetingSidebarCollapsed', isMeetingSidebarCollapsed)
    }
  }

  render () {
    const {viewerStreamLookup} = this.state
    const {meetingType, viewer} = this.props
    const {team} = viewer
    const {newMeeting, teamName} = team
    const isMeetingSidebarCollapsed = team.isMeetingSidebarCollapsed || false
    const meeting = newMeeting || UNSTARTED_MEETING
    const {facilitatorStageId, localPhase, localStage} = meeting
    const meetingLabel = meetingTypeToLabel[meetingType]
    const inSync = localStage ? localStage.localStageId === facilitatorStageId : true
    const localPhaseType = localPhase && localPhase.phaseType
    return (
      <MeetingContainer>
        <Helmet title={`${meetingLabel} Meeting | ${teamName}`} />
        <MeetingSidebarLayout
          innerRef={this.sidebarRef}
          isMeetingSidebarCollapsed={isMeetingSidebarCollapsed}
          onTransitionEnd={this.onSidebarTransitionEnd}
        >
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
                newMeeting={newMeeting}
                isMeetingSidebarCollapsed={isMeetingSidebarCollapsed}
                toggleSidebar={this.toggleSidebar}
              />
              <NewMeetingAvatarGroup
                gotoStageId={this.gotoStageId}
                team={team}
                viewerStreamLookup={viewerStreamLookup}
              />
            </MeetingAreaHeader>
            <ErrorBoundary>
              <React.Fragment>
                {localPhaseType === CHECKIN && (
                  <NewMeetingCheckIn
                    // @ts-ignore
                    gotoNext={this.gotoNext}
                    gotoNextRef={this.gotoNextRef}
                    meetingType={meetingType}
                    team={team}
                  />
                )}
                {localPhaseType === REFLECT && (
                  <RetroReflectPhase
                    gotoNext={this.gotoNext}
                    gotoNextRef={this.gotoNextRef}
                    team={team}
                  />
                )}
                {localPhaseType === GROUP && (
                  <RetroGroupPhase
                    gotoNext={this.gotoNext}
                    gotoNextRef={this.gotoNextRef}
                    team={team}
                  />
                )}
                {localPhaseType === VOTE && (
                  <RetroVotePhase
                    gotoNext={this.gotoNext}
                    gotoNextRef={this.gotoNextRef}
                    team={team}
                  />
                )}
                {localPhaseType === DISCUSS && (
                  <RetroDiscussPhase
                    gotoNext={this.gotoNext}
                    gotoNextRef={this.gotoNextRef}
                    team={team}
                  />
                )}
                {!localPhaseType && <NewMeetingLobby meetingType={meetingType} team={team} />}
              </React.Fragment>
            </ErrorBoundary>
          </MeetingContent>
        </MeetingArea>
        {!inSync && (
          <RejoinFacilitatorButton onClickHandler={() => this.gotoStageId(facilitatorStageId)} />
        )}
      </MeetingContainer>
    )
  }
}

export default createFragmentContainer(
  dragDropContext(HTML5Backend)(
    (connect() as any)(withHotkey(withAtmosphere(withMutationProps(withRouter(NewMeeting)))))
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
          ...NewMeetingPhaseHeading_newMeeting
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
