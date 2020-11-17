import React from 'react'
import styled from '@emotion/styled'
import MiniPokerCardPlaceholder from './MiniPokerCardPlaceholder'
import PokerVotingAvatarGroup from './PokerVotingAvatarGroup'
import PokerVotingRowBase from './PokerVotingRowBase'
import PokerVotingRowEmpty from './PokerVotingRowEmpty'
import Icon from './Icon'
import TipBanner from './TipBanner'
import SecondaryButtonCool from './SecondaryButtonCool'
import {PALETTE} from '~/styles/paletteV2'
import getPokerVoters from '~/utils/getPokerVoters'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {PokerActiveVoting_meeting} from '../__generated__/PokerActiveVoting_meeting.graphql'
import {PokerActiveVoting_stage} from '../__generated__/PokerActiveVoting_stage.graphql'

const CheckIcon = styled(Icon)({
  color: PALETTE.TEXT_GREEN
})

const BannerWrap = styled('div')({
  margin: 'auto',
  padding: '8px 0 200px' // accounts for deck of cards below the tip
})

const StyledTipBanner = styled(TipBanner)({
  margin: 'auto'
})

const RevealButtonBlock = styled('div')({
  minHeight: 48, // reduce layout change when button not present
  padding: '8px 16px'
})

interface Props {
  meeting: PokerActiveVoting_meeting
  stage: PokerActiveVoting_stage
}

const PokerActiveVoting = (props: Props) => {

  const {meeting, stage} = props

  console.log(stage, 'active voting stage')

  const {scores} = stage
  const {team} = meeting
  const {teamMembers} = team

  const hasVotes = stage.scores.length > 0
  const isFacilitator = true
  const viewerHasVoted = false

  // Show the facilitator a tooltip if nobody has voted yet
  // Show the participant a tooltip if they haven’t voted yet
  // Consider dismissing the tooltip silently if each role has seen their tooltip once
  // - Show the facilitator a tooltip if nobody has voted yet and the facilitator hasn’t revealed once
  // - Show the participant a tooltip if they haven’t voted once
  const showTip = Boolean(isFacilitator && !hasVotes || !isFacilitator && !viewerHasVoted)
  const tipCopy = isFacilitator
    ? 'Votes are automatically revealed once everyone has voted.'
    : 'Tap a card to vote. Swipe to view each dimension.'

  // Todo: Peeking avatars animate into the preview or revealed row
  //       Check for refs from preview or revealed row
  //       See useDraggableReflectionCard.tsx to check every frame via requestAnimationFrame
  //       in case the peeking avatar is in flight and the stage changes from isVoting to discussion

  const voters = getPokerVoters(scores, teamMembers)

  return (
    <>
      {hasVotes
        ? <>
          <PokerVotingRowBase>
            <MiniPokerCardPlaceholder>
              <CheckIcon>check</CheckIcon>
            </MiniPokerCardPlaceholder>
            <PokerVotingAvatarGroup voters={voters} />
          </PokerVotingRowBase>
        </>
        : <PokerVotingRowEmpty />
      }
      <RevealButtonBlock>
        {/* Show the reveal button if 2+ people have voted */}
        {isFacilitator && scores.length > 1
          ? <SecondaryButtonCool>{'Reveal Votes'}</SecondaryButtonCool>
          : null
        }
      </RevealButtonBlock>
      {showTip
        ? <BannerWrap>
          <StyledTipBanner>{tipCopy}</StyledTipBanner>
        </BannerWrap>
        : null
      }
    </>
  )
}

export default createFragmentContainer(
  PokerActiveVoting,
  {
    meeting: graphql`
    fragment PokerActiveVoting_meeting on PokerMeeting {
      team {
        teamMembers {
          userId
          picture
        }
      }
      settings {
        selectedTemplate {
          dimensions {
            id
            name
          }
        }
      }
    }`,
    stage: graphql`
    fragment PokerActiveVoting_stage on EstimateStage {
      isVoting
      dimensionId
      scores {
        userId
        label
        value
      }
    }
    `
  }
)
