import React, {Component} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import findKeyByValue from 'universal/utils/findKeyByValue'
import findStageById from 'universal/utils/meetings/findStageById'
import fromStageIdToUrl from 'universal/utils/meetings/fromStageIdToUrl'
import {meetingTypeToSlug, phaseTypeToSlug} from 'universal/utils/meetings/lookups'
import updateLocalStage from 'universal/utils/relay/updateLocalStage'
import {NewMeetingWithLocalState_viewer} from '__generated__/NewMeetingWithLocalState_viewer.graphql'
import {MeetingTypeEnum} from 'universal/types/graphql'
import NewMeeting from 'universal/components/NewMeeting'

/*
 * Creates a 2-way sync between the URL and the local state
 * On initial load, extracts state from the url & puts it in relay's local state
 * Listens for changes to the local state and updates the URL accordingly.
 * Updating the URL requires full knowledge of the meeting's phases & stages,
 * so by extracting it, components and callbacks (like onNext, which can't access the meeting) can
 * trigger a redirect by only knowing the stageId.
 * Also, by making the URL a function of the local state, we don't need to worry about
 * race conditions that exist between updating the URL & deriving state form the URL during rerender.
 *
 * tl;dr it gives the client a pretty URL for free and the dev doesn't have to muck around with history.push
 */

interface Props
  extends WithAtmosphereProps,
    RouteComponentProps<{teamId: string; localPhaseSlug: string; stageIdxSlug?: string}> {
  meetingType: MeetingTypeEnum
  viewer: NewMeetingWithLocalState_viewer
}

type State = {
  // true if the initial URL is legit, else false
  safeRoute: boolean
}

class NewMeetingWithLocalState extends Component<Props, State> {
  constructor (props) {
    super(props)
    // const isDemo = props.match.path.includes('retrospective-demo')
    // const {match: {localPhaseSlug, stageIdxSlug}} = props.params
    const safeRoute = this.updateRelayFromURL(props.match.params)
    this.state = {
      safeRoute
    }
  }

  componentWillReceiveProps (nextProps) {
    const {
      viewer: {
        team: {newMeeting}
      }
    } = nextProps
    const {
      viewer: {
        team: {newMeeting: oldMeeting}
      }
    } = this.props
    const localStageId = newMeeting && newMeeting.localStage && newMeeting.localStage.id
    const oldLocalStageId = oldMeeting && oldMeeting.localStage && oldMeeting.localStage.id
    if (localStageId !== oldLocalStageId) {
      const {
        history,
        match: {
          params: {teamId}
        },
        meetingType
      } = nextProps
      const meetingSlug = meetingTypeToSlug[meetingType]
      if (!newMeeting && teamId) {
        // goto lobby
        history.push(`/${meetingSlug}/${teamId}`)
        return
      }
      const {phases} = newMeeting
      const nextUrl = fromStageIdToUrl(localStageId, phases)
      history.push(nextUrl)
    }
    if (!this.state.safeRoute) {
      this.setState({safeRoute: true})
    }
  }

  updateRelayFromURL (params) {
    /*
     * Computing location depends on 3 binary variables: going to lobby, local stage exists (exit/reenter), meeting is active
     * the additional logic here has 2 benefits:
     *  1) no need for validation inside phase components
     *  2) guaranteed 1 redirect maximum (no URL flickering)
     */
    const {localPhaseSlug, stageIdxSlug} = params
    const {
      atmosphere,
      history,
      match: {
        params: {teamId}
      },
      viewer,
      meetingType
    } = this.props
    if (!viewer) {
      // server error
      history.push('/')
      return false
    }
    const {
      team: {newMeeting}
    } = viewer
    const meetingSlug = meetingTypeToSlug[meetingType]
    const {viewerId} = atmosphere

    // i'm trying to go to the lobby and there's no active meeting
    if (!localPhaseSlug && !newMeeting) {
      return true
    }

    // i'm trying to go to the middle of a meeting that hasn't started
    if (!newMeeting) {
      history.push(`/${meetingSlug}/${teamId}`)
      return false
    }

    const {facilitatorStageId, facilitatorUserId, localStage, meetingId, phases} = newMeeting

    // i'm headed to the lobby but the meeting is already going, send me there
    if (localStage && !localPhaseSlug) {
      const {id: localStageId} = localStage
      const nextUrl = fromStageIdToUrl(localStageId, phases)
      history.push(nextUrl)
      return false
    }

    const localPhaseType = findKeyByValue(phaseTypeToSlug, localPhaseSlug)
    const stageIdx = stageIdxSlug ? Number(stageIdxSlug) - 1 : 0

    const phase = phases.find((curPhase) => curPhase.phaseType === localPhaseType)
    if (!phase) {
      // typo in url, send to the facilitator
      const nextUrl = fromStageIdToUrl(facilitatorStageId, phases)
      history.push(nextUrl)
      updateLocalStage(atmosphere, meetingId, facilitatorStageId)
      return false
    }
    const stage = phase.stages[stageIdx]
    const stageId = stage && stage.id
    const isViewerFacilitator = viewerId === facilitatorUserId
    const itemStage = findStageById(phases, stageId)
    if (!itemStage) {
      // useful for e.g. /discuss/2, especially on the demo
      const nextUrl = teamId ? `/${meetingSlug}/${teamId}` : '/retrospective-demo/reflect'
      updateLocalStage(atmosphere, meetingId, facilitatorStageId)
      history.replace(nextUrl)
      return false
    }
    const {
      stage: {isNavigable, isNavigableByFacilitator}
    } = itemStage
    const canNavigate = isViewerFacilitator ? isNavigableByFacilitator : isNavigable
    if (!canNavigate) {
      // too early to visit meeting or typo, go to facilitator
      const nextUrl = fromStageIdToUrl(facilitatorStageId, phases)
      history.push(nextUrl)
      updateLocalStage(atmosphere, meetingId, facilitatorStageId)
      return false
    }

    // legit URL!
    updateLocalStage(atmosphere, meetingId, stage.id)
    return true
  }

  render () {
    return this.state.safeRoute ? <NewMeeting {...this.props} /> : null
  }
}

export default createFragmentContainer(
  withRouter(withAtmosphere(NewMeetingWithLocalState)),
  graphql`
    fragment NewMeetingWithLocalState_viewer on User {
      ...NewMeeting_viewer
      team(teamId: $teamId) {
        newMeeting {
          facilitatorStageId
          facilitatorUserId
          meetingId: id
          localStage {
            id
            isNavigable
            isNavigableByFacilitator
          }
          phases {
            id
            phaseType
            stages {
              id
              isNavigable
              isNavigableByFacilitator
            }
          }
        }
      }
    }
  `
)
