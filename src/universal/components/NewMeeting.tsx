import {NewMeeting_viewer} from '__generated__/NewMeeting_viewer.graphql'
import FastRTCSwarm from '@mattkrick/fast-rtc-swarm'
import {NewMeeting_viewer} from '__generated__/NewMeeting_viewer.graphql'
import React from 'react'
import {DragDropContext as dragDropContext} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import styled from 'react-emotion'
import {Helmet} from 'react-helmet'
import withHotkey from 'react-hotkey-hoc'
import {commitLocalUpdate, createFragmentContainer, graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
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
import {demoTeamId} from 'universal/modules/demo/initDB'
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
import {INavigateMeetingOnMutationArguments, MeetingTypeEnum} from 'universal/types/graphql'
import {CHECKIN, DISCUSS, GROUP, REFLECT, VOTE} from 'universal/utils/constants'
import findStageAfterId from 'universal/utils/meetings/findStageAfterId'
import findStageBeforeId from 'universal/utils/meetings/findStageBeforeId'
import findStageById from 'universal/utils/meetings/findStageById'
import handleHotkey from 'universal/utils/meetings/handleHotkey'
import isForwardProgress from 'universal/utils/meetings/isForwardProgress'
import {meetingTypeToLabel} from 'universal/utils/meetings/lookups'
import updateLocalStage from 'universal/utils/relay/updateLocalStage'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import Atmosphere from '../Atmosphere'
import LocalAtmosphere from '../modules/demo/LocalAtmosphere'
import UNSTARTED_MEETING from '../utils/meetings/unstartedMeeting'

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
  atmosphere: Atmosphere & LocalAtmosphere
  bindHotkey: (mousetrapKey: string | Array<string>, cb: () => void) => void
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

  constructor(props) {
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
    if (atmosphere.clientGraphQLServer) {
      atmosphere.clientGraphQLServer.on('botsFinished', () => {
        // for the demo, we're essentially using the isBotFinished() prop as state
        this.forceUpdate()
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
      history,
      viewer: {team}
    } = this.props
    const {newMeeting} = team!
    if (!newMeeting) return
    const {meetingId} = newMeeting
    EndNewMeetingMutation(atmosphere, {meetingId}, {history})
  }

  gotoStageId = async (
    stageId: string,
    _submitMutation?: WithMutationProps['submitMutation'],
    onError?: WithMutationProps['onError'],
    onCompleted?: WithMutationProps['onCompleted']
  ) => {
    const {
      atmosphere,
      submitting,
      viewer: {team}
    } = this.props
    if (submitting || !team) return
    const {newMeeting, teamId} = team
    if (!newMeeting) return
    const {facilitatorStageId, facilitatorUserId, meetingId, phases} = newMeeting
    const {viewerId} = atmosphere
    const isViewerFacilitator = viewerId === facilitatorUserId
    const {
      stage: {isNavigable, isNavigableByFacilitator}
    } = findStageById(phases, stageId)
    const canNavigate = isViewerFacilitator ? isNavigableByFacilitator : isNavigable
    if (!canNavigate) return
    if (teamId === demoTeamId) {
      await (atmosphere as LocalAtmosphere).clientGraphQLServer.finishBotActions()
    }
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
      NavigateMeetingMutation(atmosphere, variables, onError, onCompleted)
    }
  }

  maybeGotoNext = () => this.gotoNext({isHotkey: true})

  gotoNext = (options: {isCheckedIn?: boolean; isHotkey?: boolean} = {}) => {
    const {
      atmosphere,
      submitting,
      viewer: {team}
    } = this.props
    const {newMeeting} = team!
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
      this.gotoStageId(nextStageId).catch()
    } else if (options.isHotkey) {
      gotoNextDiv && gotoNextDiv.focus()
    }
  }

  gotoPrev = () => {
    const {
      viewer: {team}
    } = this.props
    const {newMeeting} = team!
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
    this.gotoStageId(nextStageId).catch()
  }

  toggleSidebar = () => {
    const {
      atmosphere,
      viewer: {team}
    } = this.props
    const {teamId, isMeetingSidebarCollapsed} = team!
    commitLocalUpdate(atmosphere, (store) => {
      store.get(teamId)!.setValue(!isMeetingSidebarCollapsed, 'isMeetingSidebarCollapsed')
    })
  }

  onSidebarTransitionEnd = (e) => {
    const {
      atmosphere: {eventEmitter},
      viewer: {team}
    } = this.props
    const {isMeetingSidebarCollapsed} = team!
    if (e.target === this.sidebarRef.current && e.propertyName === 'transform') {
      eventEmitter.emit('meetingSidebarCollapsed', isMeetingSidebarCollapsed)
    }
  }

  render() {
    const {viewerStreamLookup} = this.state
    const {atmosphere, meetingType, viewer} = this.props
    const {team} = viewer
    if (!team) return null
    const {newMeeting, teamName, teamId} = team
    const isMeetingSidebarCollapsed = team.isMeetingSidebarCollapsed || false
    const meeting = newMeeting || UNSTARTED_MEETING
    const {facilitatorStageId, localPhase, localStage} = meeting
    const meetingLabel = meetingTypeToLabel[meetingType]
    const inSync = localStage ? localStage.localStageId === facilitatorStageId : true
    const localPhaseType = localPhase && localPhase.phaseType
    const isDemoStageComplete =
      teamId === demoTeamId
        ? (atmosphere as LocalAtmosphere).clientGraphQLServer.isBotFinished()
        : false
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
                  // @ts-ignore
                  <NewMeetingCheckIn
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
                    isDemoStageComplete={isDemoStageComplete}
                  />
                )}
                {localPhaseType === GROUP && (
                  <RetroGroupPhase
                    gotoNext={this.gotoNext}
                    gotoNextRef={this.gotoNextRef}
                    team={team}
                    isDemoStageComplete={isDemoStageComplete}
                  />
                )}
                {localPhaseType === VOTE && (
                  <RetroVotePhase
                    gotoNext={this.gotoNext}
                    gotoNextRef={this.gotoNextRef}
                    team={team}
                    isDemoStageComplete={isDemoStageComplete}
                  />
                )}
                {localPhaseType === DISCUSS && (
                  <RetroDiscussPhase
                    gotoNext={this.gotoNext}
                    gotoNextRef={this.gotoNextRef}
                    team={team}
                    isDemoStageComplete={isDemoStageComplete}
                  />
                )}
                {!localPhaseType && (
                  // @ts-ignore
                  <NewMeetingLobby meetingType={meetingType} team={team} />
                )}
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
    withHotkey(withAtmosphere(withMutationProps(withRouter(NewMeeting))))
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
          isFacilitator
          isLead
          isSelf
          userId
          user {
            isConnected
          }
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
