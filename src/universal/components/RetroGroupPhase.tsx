import {RetroGroupPhase_team} from '__generated__/RetroGroupPhase_team.graphql'
import ms from 'ms'
/**
 * Renders the UI for the reflection phase of the retrospective meeting
 *
 */
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import BottomNavControl from 'universal/components/BottomNavControl'
import BottomNavIconLabel from 'universal/components/BottomNavIconLabel'
import ErrorBoundary from 'universal/components/ErrorBoundary'
import MeetingContent from 'universal/components/MeetingContent'
import MeetingContentHeader from 'universal/components/MeetingContentHeader'
import MeetingPhaseWrapper from 'universal/components/MeetingPhaseWrapper'
import MeetingHelpToggle from 'universal/components/MenuHelpToggle'
import PhaseHeaderDescription from 'universal/components/PhaseHeaderDescription'
import PhaseHeaderTitle from 'universal/components/PhaseHeaderTitle'
import {RetroMeetingPhaseProps} from 'universal/components/RetroMeeting'
import StyledError from 'universal/components/StyledError'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import useTimeoutWithReset from 'universal/hooks/useTimeoutWithReset'
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar'
import AutoGroupReflectionsMutation from 'universal/mutations/AutoGroupReflectionsMutation'
import {NewMeetingPhaseTypeEnum} from 'universal/types/graphql'
import {VOTE} from 'universal/utils/constants'
import lazyPreload from 'universal/utils/lazyPreload'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import handleRightArrow from '../utils/handleRightArrow'
import isDemoRoute from '../utils/isDemoRoute'
import EndMeetingButton from './EndMeetingButton'
import PhaseItemMasonry from './PhaseItemMasonry'
import StageTimerDisplay from 'universal/components/RetroReflectPhase/StageTimerDisplay'
import StageTimerControl from 'universal/components/StageTimerControl'

interface Props extends RetroMeetingPhaseProps, WithMutationProps, WithAtmosphereProps {
  team: RetroGroupPhase_team
}

const StyledBottomBar = styled(MeetingControlBar)({
  justifyContent: 'space-between'
})

const CenteredControlBlock = styled('div')({
  display: 'flex'
})

const BottomControlSpacer = styled('div')({
  minWidth: 96
})

const GroupHelpMenu = lazyPreload(async () =>
  import(/* webpackChunkName: 'GroupHelpMenu' */ 'universal/components/MeetingHelp/GroupHelpMenu')
)
const DemoGroupHelpMenu = lazyPreload(async () =>
  import(/* webpackChunkName: 'DemoGroupHelpMenu' */ 'universal/components/MeetingHelp/DemoGroupHelpMenu')
)

const RetroGroupPhase = (props: Props) => {
  const [isReadyToVote, resetActivityTimeout] = useTimeoutWithReset(ms('1m'), ms('30s'))
  const {
    avatarGroup,
    toggleSidebar,
    atmosphere,
    error,
    handleGotoNext,
    onError,
    onCompleted,
    submitting,
    submitMutation,
    team,
    isDemoStageComplete
  } = props
  const {viewerId} = atmosphere
  const {isMeetingSidebarCollapsed, newMeeting} = team
  if (!newMeeting) return null
  const {nextAutoGroupThreshold, facilitatorUserId, meetingId, localStage} = newMeeting
  const isComplete = localStage ? localStage.isComplete : false
  const isAsync = localStage ? localStage.isAsync : false
  const isFacilitating = facilitatorUserId === viewerId
  const nextPhaseLabel = phaseLabelLookup[VOTE]
  const {gotoNext, ref: gotoNextRef} = handleGotoNext
  const autoGroup = () => {
    if (submitting) return
    submitMutation()
    const groupingThreshold = nextAutoGroupThreshold || 0.5
    AutoGroupReflectionsMutation(atmosphere, {meetingId, groupingThreshold}, onError, onCompleted)
  }
  const canAutoGroup = !isDemoRoute() && (!nextAutoGroupThreshold || nextAutoGroupThreshold < 1)
  return (
    <MeetingContent>
      <MeetingContentHeader
        avatarGroup={avatarGroup}
        isMeetingSidebarCollapsed={!!isMeetingSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      >
        <PhaseHeaderTitle>{phaseLabelLookup[NewMeetingPhaseTypeEnum.group]}</PhaseHeaderTitle>
        <PhaseHeaderDescription>{'Drag cards to group by common topics'}</PhaseHeaderDescription>
      </MeetingContentHeader>
      <ErrorBoundary>
        <StageTimerDisplay stage={localStage!} />
        {error && <StyledError>{error}</StyledError>}
        <MeetingPhaseWrapper>
          <PhaseItemMasonry meeting={newMeeting} resetActivityTimeout={resetActivityTimeout} />
        </MeetingPhaseWrapper>
        {isFacilitating && (
          <StyledBottomBar>
            {isComplete ? (
              <BottomControlSpacer />
            ) : (
              <StageTimerControl defaultTimeLimit={5} meetingId={meetingId} team={team} />
            )}
            <CenteredControlBlock>
              <BottomNavControl
                isBouncing={isDemoStageComplete || (!isAsync && !isComplete && isReadyToVote)}
                onClick={() => gotoNext()}
                onKeyDown={handleRightArrow(() => gotoNext())}
                innerRef={gotoNextRef}
              >
                <BottomNavIconLabel
                  icon='arrow_forward'
                  iconColor='warm'
                  label={`Next: ${nextPhaseLabel}`}
                />
              </BottomNavControl>
              {canAutoGroup && !isComplete && (
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
      </ErrorBoundary>
    </MeetingContent>
  )
}

graphql`
  fragment RetroGroupPhase_stage on GenericMeetingStage {
    ...StageTimerDisplay_stage
    isAsync
    isComplete
  }
`

export default createFragmentContainer(withMutationProps(withAtmosphere(RetroGroupPhase)), {
  team: graphql`
    fragment RetroGroupPhase_team on Team {
      ...StageTimerControl_team
      isMeetingSidebarCollapsed
      newMeeting {
        meetingId: id
        facilitatorUserId
        ...PhaseItemColumn_meeting
        ... on RetrospectiveMeeting {
          ...PhaseItemMasonry_meeting
          localStage {
            ...RetroGroupPhase_stage @relay(mask: false)
          }
          phases {
            stages {
              ...RetroGroupPhase_stage @relay(mask: false)
            }
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
})
