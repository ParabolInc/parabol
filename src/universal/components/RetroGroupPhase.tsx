import {RetroGroupPhase_team} from '__generated__/RetroGroupPhase_team.graphql'
/**
 * Renders the UI for the reflection phase of the retrospective meeting
 *
 */
import React, {Component} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import BottomNavControl from 'universal/components/BottomNavControl'
import BottomNavIconLabel from 'universal/components/BottomNavIconLabel'
import MeetingPhaseWrapper from 'universal/components/MeetingPhaseWrapper'
import MeetingHelpToggle from 'universal/components/MenuHelpToggle'
import StyledError from 'universal/components/StyledError'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar'
import AutoGroupReflectionsMutation from 'universal/mutations/AutoGroupReflectionsMutation'
import {VOTE} from 'universal/utils/constants'
import lazyPreload from 'universal/utils/lazyPreload'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import handleRightArrow from '../utils/handleRightArrow'
import isDemoRoute from '../utils/isDemoRoute'
import EndMeetingButton from './EndMeetingButton'
import PhaseItemMasonry from './PhaseItemMasonry'
import ms from 'ms'

interface Props extends WithMutationProps, WithAtmosphereProps {
  gotoNext: () => void
  gotoNextRef: React.RefObject<HTMLDivElement>
  isDemoStageComplete: boolean
  team: RetroGroupPhase_team
}

const BottomControlSpacer = styled('div')({
  minWidth: '6rem'
})

const StyledBottomBar = styled(MeetingControlBar)({
  justifyContent: 'space-between'
})

const CenteredControlBlock = styled('div')({
  display: 'flex'
})

interface State {
  isReadyToVote: boolean
}

const GroupHelpMenu = lazyPreload(async () =>
  import(/* webpackChunkName: 'GroupHelpMenu' */ 'universal/components/MeetingHelp/GroupHelpMenu')
)
const DemoGroupHelpMenu = lazyPreload(async () =>
  import(/* webpackChunkName: 'DemoGroupHelpMenu' */ 'universal/components/MeetingHelp/DemoGroupHelpMenu')
)

class RetroGroupPhase extends Component<Props, State> {
  state = {
    isReadyToVote: false
  }
  activityTimeoutId = window.setTimeout(() => {
    this.setState({
      isReadyToVote: true
    })
  }, ms('1m'))

  componentWillUnmount (): void {
    window.clearTimeout(this.activityTimeoutId)
  }

  resetActivityTimeout = () => {
    window.clearTimeout(this.activityTimeoutId)
    if (this.state.isReadyToVote) {
      this.setState({
        isReadyToVote: false
      })
    }
    this.activityTimeoutId = window.setTimeout(() => {
      this.setState({
        isReadyToVote: true
      })
    }, ms('30s'))
  }

  render () {
    const {
      atmosphere,
      error,
      gotoNext,
      gotoNextRef,
      onError,
      onCompleted,
      submitting,
      submitMutation,
      team,
      isDemoStageComplete
    } = this.props
    const {isReadyToVote} = this.state
    const {viewerId} = atmosphere
    const {newMeeting} = team
    if (!newMeeting) return null
    const {nextAutoGroupThreshold, facilitatorUserId, meetingId, localStage} = newMeeting
    const isComplete = localStage ? localStage.isComplete : false
    const isFacilitating = facilitatorUserId === viewerId
    const nextPhaseLabel = phaseLabelLookup[VOTE]
    const autoGroup = () => {
      if (submitting) return
      submitMutation()
      const groupingThreshold = nextAutoGroupThreshold || 0.5
      AutoGroupReflectionsMutation(atmosphere, {meetingId, groupingThreshold}, onError, onCompleted)
    }
    const canAutoGroup = !isDemoRoute() && (!nextAutoGroupThreshold || nextAutoGroupThreshold < 1)
    return (
      <React.Fragment>
        {error && <StyledError>{error}</StyledError>}
        <MeetingPhaseWrapper>
          <PhaseItemMasonry meeting={newMeeting} resetActivityTimeout={this.resetActivityTimeout} />
        </MeetingPhaseWrapper>
        {isFacilitating && (
          <StyledBottomBar>
            {/* ControlBlock and div for layout spacing */}
            <BottomControlSpacer />
            <CenteredControlBlock>
              <BottomNavControl
                isBouncing={isDemoStageComplete || (!isComplete && isReadyToVote)}
                onClick={gotoNext}
                onKeyDown={handleRightArrow(gotoNext)}
                innerRef={gotoNextRef}
              >
                <BottomNavIconLabel
                  icon='arrow_forward'
                  iconColor='warm'
                  label={`Next: ${nextPhaseLabel}`}
                />
              </BottomNavControl>
              {canAutoGroup && (
                <BottomNavControl onClick={autoGroup} waiting={submitting}>
                  <BottomNavIconLabel
                    icon='photo_filter'
                    iconColor='midGray'
                    label={'Auto Group'}
                  />
                </BottomNavControl>
              )}
            </CenteredControlBlock>
            <EndMeetingButton meetingId={meetingId} />
          </StyledBottomBar>
        )}
        <MeetingHelpToggle
          floatAboveBottomBar={isFacilitating}
          menu={isDemoRoute() ? <DemoGroupHelpMenu /> : <GroupHelpMenu />}
        />
      </React.Fragment>
    )
  }
}

export default createFragmentContainer(
  withMutationProps(withAtmosphere(RetroGroupPhase)),
  graphql`
    fragment RetroGroupPhase_team on Team {
      newMeeting {
        meetingId: id
        facilitatorUserId
        ...PhaseItemColumn_meeting
        ... on RetrospectiveMeeting {
          ...PhaseItemMasonry_meeting
          localStage {
            isComplete
          }
          nextAutoGroupThreshold
          reflectionGroups {
            id
            meetingId
            sortOrder
            retroPhaseItemId
            reflections {
              id
              retroPhaseItemId
              sortOrder
            }
          }
        }
      }
    }
  `
)
