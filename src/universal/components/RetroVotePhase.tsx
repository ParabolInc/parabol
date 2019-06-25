import {RetroVotePhase_team} from '__generated__/RetroVotePhase_team.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import BottomNavControl from 'universal/components/BottomNavControl'
import BottomNavIconLabel from 'universal/components/BottomNavIconLabel'
import ErrorBoundary from 'universal/components/ErrorBoundary'
import Icon from 'universal/components/Icon'
import LabelHeading from 'universal/components/LabelHeading/LabelHeading'
import MeetingContent from 'universal/components/MeetingContent'
import MeetingContentHeader from 'universal/components/MeetingContentHeader'
import MeetingPhaseWrapper from 'universal/components/MeetingPhaseWrapper'
import MeetingHelpToggle from 'universal/components/MenuHelpToggle'
import PhaseHeaderDescription from 'universal/components/PhaseHeaderDescription'
import PhaseHeaderTitle from 'universal/components/PhaseHeaderTitle'
import {RetroMeetingPhaseProps} from 'universal/components/RetroMeeting'
import ScrollableBlock from 'universal/components/ScrollableBlock'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar'
import {minWidthMediaQueries} from 'universal/styles/breakpoints'
import {MD_ICONS_SIZE_18} from 'universal/styles/icons'
import {meetingVoteIcon} from 'universal/styles/meeting'
import {PALETTE} from 'universal/styles/paletteV2'
import {fontFamily, typeScale} from 'universal/styles/theme/typography'
import ui from 'universal/styles/ui'
import {NewMeetingPhaseTypeEnum} from 'universal/types/graphql'
import {DISCUSS} from 'universal/utils/constants'
import lazyPreload from 'universal/utils/lazyPreload'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import handleRightArrow from '../utils/handleRightArrow'
import isDemoRoute from '../utils/isDemoRoute'
import EndMeetingButton from './EndMeetingButton'
import PhaseItemMasonry from './PhaseItemMasonry'
import {RetroVotePhase_meetingSettings} from '__generated__/RetroVotePhase_meetingSettings.graphql'
import StageTimerControl from 'universal/components/StageTimerControl'
import StageTimerDisplay from 'universal/components/RetroReflectPhase/StageTimerDisplay'

interface Props extends WithAtmosphereProps, RetroMeetingPhaseProps {
  meetingSettings: RetroVotePhase_meetingSettings
  team: RetroVotePhase_team
}

const votePhaseBreakpoint = minWidthMediaQueries[1]

const VoteMeta = styled('div')({
  alignItems: 'center',
  borderBottom: `.0625rem solid ${PALETTE.BORDER_LIGHT}`,
  display: 'flex',
  justifyContent: 'center',
  margin: '0 auto 1rem',
  padding: '.5rem .5rem',
  width: '100%',
  [votePhaseBreakpoint]: {
    padding: '0 0 .5rem'
  }
})

const MetaBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'nowrap',
  userSelect: 'none'
})

const StyledMetaBlock = styled(MetaBlock)({
  marginRight: '1.5rem',
  [votePhaseBreakpoint]: {
    marginRight: '2rem'
  }
})

const Label = styled(LabelHeading)({
  fontSize: typeScale[0],
  marginRight: '.5rem',
  whiteSpace: 'nowrap',
  [votePhaseBreakpoint]: {
    fontSize: typeScale[1],
    marginRight: '.75rem',
    paddingTop: '.125rem'
  }
})

const CheckIcon = styled(Icon)(({isDark}: {isDark: boolean | undefined | null}) => ({
  color: ui.palette.warm,
  display: 'block',
  fontSize: MD_ICONS_SIZE_18,
  opacity: isDark ? 1 : 0.2,
  marginRight: '.25rem'
}))

const CheckMarkRow = styled('div')({
  display: 'none',
  [votePhaseBreakpoint]: {
    display: 'flex'
  }
})

const VoteCountLabel = styled('div')({
  color: ui.palette.warm,
  fontFamily: fontFamily.monospace,
  fontSize: typeScale[3],
  fontWeight: 600,
  lineHeight: '1.5',
  margin: 0,
  padding: 0,
  [votePhaseBreakpoint]: {
    fontSize: typeScale[4]
  }
})

const MyVotesCountLabel = styled(VoteCountLabel)({
  [votePhaseBreakpoint]: {
    display: 'none'
  }
})

const TeamVotesCountLabel = styled(VoteCountLabel)({
  // most likely will start out with 2 digits
  // min-width reduces change in layout
  minWidth: '1.25rem'
})

const StyledBottomBar = styled(MeetingControlBar)({
  justifyContent: 'space-between'
})

const BottomControlSpacer = styled('div')({
  minWidth: 96
})

const VoteHelpMenu = lazyPreload(async () =>
  import(/* webpackChunkName: 'VoteHelpMenu' */ 'universal/components/MeetingHelp/VoteHelpMenu')
)
const DemoVoteHelpMenu = lazyPreload(async () =>
  import(/* webpackChunkName: 'DemoVoteHelpMenu' */ 'universal/components/MeetingHelp/DemoVoteHelpMenu')
)

const RetroVotePhase = (props: Props) => {
  const {
    avatarGroup,
    toggleSidebar,
    meetingSettings: {totalVotes = 0},
    atmosphere: {viewerId},
    handleGotoNext,
    team,
    isDemoStageComplete
  } = props
  const {isMeetingSidebarCollapsed, newMeeting} = team
  if (!newMeeting) return null
  const {gotoNext, ref: gotoNextRef} = handleGotoNext
  const {facilitatorUserId, meetingId, phases, viewerMeetingMember, localStage} = newMeeting
  const isComplete = localStage ? localStage.isComplete : false
  const teamVotesRemaining = newMeeting.teamVotesRemaining || 0
  const myVotesRemaining = viewerMeetingMember.myVotesRemaining || 0
  const isFacilitating = facilitatorUserId === viewerId
  const discussPhase = phases.find((phase) => phase.phaseType === DISCUSS)!
  const discussStage = discussPhase.stages![0]
  const nextPhaseLabel = phaseLabelLookup[DISCUSS]
  const checkMarks = [...Array(totalVotes).keys()]
  return (
    <MeetingContent>
      <MeetingContentHeader
        avatarGroup={avatarGroup}
        isMeetingSidebarCollapsed={!!isMeetingSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      >
        <PhaseHeaderTitle>{phaseLabelLookup[NewMeetingPhaseTypeEnum.vote]}</PhaseHeaderTitle>
        <PhaseHeaderDescription>{'Vote on the topics you want to discuss'}</PhaseHeaderDescription>
      </MeetingContentHeader>
      <ErrorBoundary>
        <VoteMeta>
          <StyledMetaBlock>
            <Label>{'My Votes Remaining'}</Label>
            <MyVotesCountLabel>{myVotesRemaining}</MyVotesCountLabel>
            <CheckMarkRow>
              {checkMarks.map((idx) => (
                <CheckIcon key={idx} isDark={idx < myVotesRemaining}>
                  {meetingVoteIcon}
                </CheckIcon>
              ))}
            </CheckMarkRow>
          </StyledMetaBlock>
          <MetaBlock>
            <Label>{'Team Votes Remaining'}</Label>
            <TeamVotesCountLabel>{teamVotesRemaining}</TeamVotesCountLabel>
          </MetaBlock>
        </VoteMeta>
        <StageTimerDisplay stage={localStage} />
        <ScrollableBlock>
          <MeetingPhaseWrapper>
            <PhaseItemMasonry meeting={newMeeting} />
          </MeetingPhaseWrapper>
        </ScrollableBlock>
        {isFacilitating && (
          <StyledBottomBar>
            {isComplete ? (
              <BottomControlSpacer />
            ) : (
              <StageTimerControl defaultTimeLimit={3} meetingId={meetingId} team={team} />
            )}
            <BottomNavControl
              isBouncing={isDemoStageComplete || teamVotesRemaining === 0}
              disabled={!discussStage.isNavigableByFacilitator}
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
            <EndMeetingButton meetingId={meetingId} />
          </StyledBottomBar>
        )}
        <MeetingHelpToggle
          floatAboveBottomBar={isFacilitating}
          menu={isDemoRoute() ? <DemoVoteHelpMenu /> : <VoteHelpMenu />}
        />
      </ErrorBoundary>
    </MeetingContent>
  )
}

export default createFragmentContainer(
  withAtmosphere(RetroVotePhase),
  graphql`
    fragment RetroVotePhase_meetingSettings on RetrospectiveMeetingSettings {
      totalVotes
    }
    fragment RetroVotePhase_team on Team {
      ...StageTimerControl_team
      isMeetingSidebarCollapsed
      newMeeting {
        ...PhaseItemColumn_meeting
        meetingId: id
        facilitatorUserId
        localStage {
          ...StageTimerDisplay_stage
          isComplete
        }
        phases {
          phaseType
          ... on DiscussPhase {
            stages {
              ...StageTimerDisplay_stage
              ... on RetroDiscussStage {
                id
                isNavigableByFacilitator
              }
            }
          }
        }
        viewerMeetingMember {
          ... on RetrospectiveMeetingMember {
            myVotesRemaining: votesRemaining
          }
        }
        ... on RetrospectiveMeeting {
          teamVotesRemaining: votesRemaining
          ...PhaseItemMasonry_meeting
        }
      }
    }
  `
)
