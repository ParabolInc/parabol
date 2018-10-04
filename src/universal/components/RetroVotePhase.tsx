import {RetroVotePhase_team} from '__generated__/RetroVotePhase_team.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import FlatButton from 'universal/components/FlatButton'
import IconLabel from 'universal/components/IconLabel'
import VoteHelpMenu from 'universal/components/MeetingHelp/VoteHelpMenu'
import MeetingPhaseWrapper from 'universal/components/MeetingPhaseWrapper'
import ScrollableBlock from 'universal/components/ScrollableBlock'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar'
import {minWidthMediaQueries} from 'universal/styles/breakpoints'
import {meetingVoteIcon} from 'universal/styles/meeting'
import {fontFamily, typeScale} from 'universal/styles/theme/typography'
import ui from 'universal/styles/ui'
import {DISCUSS} from 'universal/utils/constants'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import handleRightArrow from '../utils/handleRightArrow'
import PhaseItemMasonry from './PhaseItemMasonry'
import {IDiscussPhase} from 'universal/types/graphql'

interface Props extends WithAtmosphereProps {
  gotoNext: () => void
  gotoNextRef: React.RefObject<HTMLDivElement>
  team: RetroVotePhase_team
}

const votePhaseBreakpoint = minWidthMediaQueries[1]

const ControlBarInner = styled('div')(
  ({isFacilitating}: {isFacilitating: boolean | null | undefined}) => ({
    alignItems: 'center',
    display: 'flex',
    // ts tells me 0 isn't valid
    // flexWrap: 0,
    justifyContent: isFacilitating ? 'space-between' : 'center',
    width: '100%',
    [votePhaseBreakpoint]: {
      justifyContent: 'center'
    }
  })
)

const VoteMeta = styled('div')({
  [votePhaseBreakpoint]: {
    alignItems: 'center',
    display: 'flex',
    marginRight: 0
  }
})

const MetaBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'nowrap',
  [votePhaseBreakpoint]: {
    marginRight: '2rem'
  }
})

const Label = styled('div')({
  color: ui.labelHeadingColor,
  fontSize: typeScale[1],
  fontWeight: 600,
  lineHeight: typeScale[6],
  marginRight: '.75rem',
  whiteSpace: 'nowrap',
  [votePhaseBreakpoint]: {
    fontSize: typeScale[2]
  }
})

const CheckIcon = styled(StyledFontAwesome)(({isDark}: {isDark: boolean | undefined | null}) => ({
  color: ui.palette.warm,
  display: 'block',
  height: ui.iconSize,
  opacity: isDark ? 1 : 0.2,
  marginRight: '.25rem',
  width: ui.iconSize
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

const RetroVotePhase = (props: Props) => {
  const {
    atmosphere: {viewerId},
    gotoNext,
    gotoNextRef,
    team
  } = props
  const {
    meetingSettings: {totalVotes = 0},
    newMeeting
  } = team
  if (!newMeeting) return null
  const {facilitatorUserId, phases, viewerMeetingMember} = newMeeting
  const teamVotesRemaining = newMeeting.teamVotesRemaining || 0
  const myVotesRemaining = viewerMeetingMember.myVotesRemaining || 0
  const isFacilitating = facilitatorUserId === viewerId
  const discussPhase = phases.find((phase) => phase.phaseType === DISCUSS) as IDiscussPhase
  const discussStage = discussPhase.stages[0]
  const nextPhaseLabel = phaseLabelLookup[DISCUSS]
  const checkMarks = [...Array(totalVotes).keys()]
  return (
    <React.Fragment>
      <ScrollableBlock>
        <MeetingPhaseWrapper>
          <PhaseItemMasonry meeting={newMeeting} />
        </MeetingPhaseWrapper>
      </ScrollableBlock>
      <MeetingControlBar>
        <ControlBarInner isFacilitating={isFacilitating}>
          <VoteMeta>
            <MetaBlock>
              <Label>{'My Votes Remaining'}</Label>
              <MyVotesCountLabel>{myVotesRemaining}</MyVotesCountLabel>
              <CheckMarkRow>
                {checkMarks.map((idx) => (
                  <CheckIcon key={idx} name={meetingVoteIcon} isDark={idx < myVotesRemaining} />
                ))}
              </CheckMarkRow>
            </MetaBlock>
            <MetaBlock>
              <Label>{'Team Votes Remaining'}</Label>
              <VoteCountLabel>{teamVotesRemaining}</VoteCountLabel>
            </MetaBlock>
          </VoteMeta>
          {isFacilitating && (
            <FlatButton
              size='medium'
              disabled={!discussStage.isNavigableByFacilitator}
              onClick={gotoNext}
              onKeyDown={handleRightArrow(gotoNext)}
              innerRef={gotoNextRef}
            >
              <IconLabel
                icon='arrow-circle-right'
                iconAfter
                iconColor='warm'
                iconLarge
                label={`Done! Let’s ${nextPhaseLabel}`}
              />
            </FlatButton>
          )}
        </ControlBarInner>
      </MeetingControlBar>
      {/* Set floatAboveBottomBar to true because the bottom bar is always present in this view */}
      <VoteHelpMenu floatAboveBottomBar />
    </React.Fragment>
  )
}

export default createFragmentContainer(
  withAtmosphere(RetroVotePhase),
  graphql`
    fragment RetroVotePhase_team on Team {
      meetingSettings(meetingType: $meetingType) {
        ... on RetrospectiveMeetingSettings {
          totalVotes
        }
      }
      newMeeting {
        meetingId: id
        facilitatorUserId
        ...PhaseItemColumn_meeting
        phases {
          phaseType
          ... on DiscussPhase {
            stages {
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
