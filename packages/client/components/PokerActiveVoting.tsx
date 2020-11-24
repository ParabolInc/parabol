import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useMutationProps from '~/hooks/useMutationProps'
import {PALETTE} from '~/styles/paletteV2'
import useAtmosphere from '../hooks/useAtmosphere'
import PokerRevealVotesMutation from '../mutations/PokerRevealVotesMutation'
import {BezierCurve} from '../types/constEnums'
import {PokerActiveVoting_meeting} from '../__generated__/PokerActiveVoting_meeting.graphql'
import {PokerActiveVoting_stage} from '../__generated__/PokerActiveVoting_stage.graphql'
import Icon from './Icon'
import MiniPokerCard from './MiniPokerCard'
import PokerVotingAvatarGroup from './PokerVotingAvatarGroup'
import PokerVotingRowBase from './PokerVotingRowBase'
import SecondaryButtonCool from './SecondaryButtonCool'
import TipBanner from './TipBanner'

const CheckIcon = styled(Icon)({
  color: PALETTE.TEXT_GREEN
})

const BannerWrap = styled('div')<{showTip: boolean}>(({showTip}) => ({
  margin: 'auto',
  padding: '8px 16px 200px', // accounts for deck of cards below the tip
  opacity: showTip ? 1 : 0,
  transition: `opacity 200ms ${BezierCurve.DECELERATE}`
}))

const StyledTipBanner = styled(TipBanner)({
  margin: 'auto'
})

const RevealButtonBlock = styled('div')({
  minHeight: 48, // reduce layout change when button not present
  padding: '8px 16px'
})

const StyledError = styled('div')({
  paddingLeft: 8,
  fontSize: 14,
  color: PALETTE.ERROR_MAIN,
  fontWeight: 400,
})
interface Props {
  meeting: PokerActiveVoting_meeting
  stage: PokerActiveVoting_stage
}

const PokerActiveVoting = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {meeting, stage} = props
  const {facilitatorUserId, id: meetingId} = meeting
  const {id: stageId, scores} = stage
  const hasVotes = scores.length > 0
  const isFacilitator = viewerId === facilitatorUserId
  const viewerHasVoted = Boolean(scores.find(({userId}) => userId === viewerId))

  // Show the facilitator a tooltip if nobody has voted yet
  // Show the participant a tooltip if they haven’t voted yet
  // Consider dismissing the tooltip silently if each role has seen their tooltip once
  // - Show the facilitator a tooltip if nobody has voted yet and the facilitator hasn’t revealed once
  // - Show the participant a tooltip if they haven’t voted once
  const showTip = Boolean(isFacilitator && !hasVotes || !isFacilitator && !viewerHasVoted)
  const tipCopy = isFacilitator
    ? 'Votes are automatically revealed once everyone has voted.'
    : 'Tap a card to vote. Swipe to view each dimension.'
  const showRevealButton = isFacilitator && scores.length > 0
  const {onError, onCompleted, submitMutation, submitting, error} = useMutationProps()
  const reveal = () => {
    if (submitting) return
    submitMutation()
    PokerRevealVotesMutation(
      atmosphere,
      {meetingId, stageId},
      {onError, onCompleted}
    )
  }

  return (
    <>
      <PokerVotingRowBase>
        <MiniPokerCard>
          <CheckIcon>check</CheckIcon>
        </MiniPokerCard>
        <PokerVotingAvatarGroup scores={scores} />
      </PokerVotingRowBase>
      <RevealButtonBlock>
        {showRevealButton && <SecondaryButtonCool onClick={reveal}>{'Reveal Votes'}</SecondaryButtonCool>}
        {error && <StyledError>{error.message}</StyledError>}
      </RevealButtonBlock>
      <BannerWrap showTip={showTip}>
        <StyledTipBanner>{tipCopy}</StyledTipBanner>
      </BannerWrap>
    </>
  )
}


export default createFragmentContainer(
  PokerActiveVoting,
  {
    stage: graphql`
    fragment PokerActiveVoting_stage on EstimateStage {
      id
      dimensionId
      scores {
        ...PokerVotingAvatarGroup_scores
        userId
      }
    }`,
    meeting: graphql`
    fragment PokerActiveVoting_meeting on PokerMeeting {
      facilitatorUserId
      id
    }`,
  }
)
