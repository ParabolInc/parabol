import {RetroVotePhase_team} from '__generated__/RetroVotePhase_team.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import FlatButton from 'universal/components/FlatButton'
import IconLabel from 'universal/components/IconLabel'
import VoteHelpMenu from 'universal/components/MeetingHelp/VoteHelpMenu'
import MeetingPhaseWrapper from 'universal/components/MeetingPhaseWrapper'
import ScrollableBlock from 'universal/components/ScrollableBlock'
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
import Icon from 'universal/components/Icon'
import {MD_ICONS_SIZE_18} from 'universal/styles/icons'
import {PALETTE} from 'universal/styles/paletteV2'
import LabelHeading from 'universal/components/LabelHeading/LabelHeading'

interface Props extends WithAtmosphereProps {
  gotoNext: () => void
  gotoNextRef: React.RefObject<HTMLDivElement>
  team: RetroVotePhase_team
}

const votePhaseBreakpoint = minWidthMediaQueries[1]

const VoteMeta = styled('div')({
  alignItems: 'center',
  borderBottom: `.0625rem solid ${PALETTE.BORDER.LIGHT}`,
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
  flexWrap: 'nowrap'
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
          <VoteCountLabel>{teamVotesRemaining}</VoteCountLabel>
        </MetaBlock>
      </VoteMeta>
      <ScrollableBlock>
        <MeetingPhaseWrapper>
          <PhaseItemMasonry meeting={newMeeting} />
        </MeetingPhaseWrapper>
      </ScrollableBlock>
      {isFacilitating && (
        <MeetingControlBar>
          <FlatButton
            size='medium'
            disabled={!discussStage.isNavigableByFacilitator}
            onClick={gotoNext}
            onKeyDown={handleRightArrow(gotoNext)}
            innerRef={gotoNextRef}
          >
            <IconLabel
              icon='arrow_forward'
              iconAfter
              iconColor='warm'
              iconLarge
              label={`Done! Let’s ${nextPhaseLabel}`}
            />
          </FlatButton>
        </MeetingControlBar>
      )}
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
