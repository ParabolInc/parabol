import styled from '@emotion/styled'
import {Check as CheckIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import useMutationProps from '~/hooks/useMutationProps'
import {PALETTE} from '~/styles/paletteV3'
import useAtmosphere from '../hooks/useAtmosphere'
import PokerRevealVotesMutation from '../mutations/PokerRevealVotesMutation'
import {BezierCurve, PokerCards} from '../types/constEnums'
import {PokerActiveVoting_meeting} from '../__generated__/PokerActiveVoting_meeting.graphql'
import {PokerActiveVoting_stage} from '../__generated__/PokerActiveVoting_stage.graphql'
import AvatarList from './AvatarList'
import CircularProgress from './CircularProgress'
import MiniPokerCard from './MiniPokerCard'
import PokerVotingNoVotes from './PokerVotingNoVotes'
import PokerVotingRowBase from './PokerVotingRowBase'
import RaisedButton from './RaisedButton'
import TipBanner from './TipBanner'

const StyledCheckIcon = styled(CheckIcon)({
  color: PALETTE.JADE_400
})

const BannerWrap = styled('div')<{showTip: boolean}>(({showTip}) => ({
  margin: '0 auto',
  padding: '8px 16px',
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
  color: PALETTE.TOMATO_500,
  fontWeight: 400
})

const RevealLabel = styled('div')<{color: string}>(({color}) => ({
  color,
  paddingLeft: 8
}))

const RevealButton = styled(RaisedButton)<{color}>(({color}) => ({
  backgroundColor: '#fff',
  color,
  fontWeight: 600,
  height: 56,
  position: 'relative'
}))

const Progress = styled(CircularProgress)({
  transform: `translate(-4px, 0px)`,
  // prevent color overlap & bleed with static progress ring
  zIndex: 1
})

const RevealButtonIcon = styled('div')<{color: string}>(({color}) => ({
  alignItems: 'center',
  border: `1px solid rgba(130, 128, 154, 0.2)`,
  borderRadius: '100%',
  boxShadow: `0px 0px 2px rgba(68, 66, 88, 0.14), 0px 2px 2px rgba(68, 66, 88, 0.12), 0px 1px 3px rgba(68, 66, 88, 0.2)`,
  display: 'flex',
  height: 40,
  justifyContent: 'center',
  left: 19,
  position: 'absolute',
  top: 7,
  width: 40,
  '& svg': {
    fill: color,
    stroke: color,
    strokeWidth: 1
  }
}))

const MiniCardWrapper = styled('div')({
  // This adds the gutter between the mini card and the avatars
  marginRight: 16
})

interface Props {
  isClosing: boolean
  meeting: PokerActiveVoting_meeting
  stage: PokerActiveVoting_stage
  isInitialStageRender: boolean
}

const PokerActiveVoting = (props: Props) => {
  const {isClosing, meeting, stage, isInitialStageRender} = props

  const {t} = useTranslation()

  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {facilitatorUserId, id: meetingId, meetingMembers} = meeting
  const {id: stageId, scores} = stage
  const hasVotes = scores.length > 0
  const isFacilitator = viewerId === facilitatorUserId
  const viewerHasVoted = scores.find(({userId}) => userId === viewerId)
  const checkedInCount = useMemo(
    () => meetingMembers.filter(({isSpectating}) => !isSpectating).length,
    [meetingMembers]
  )
  const votePercent = scores.length / checkedInCount
  const allVotesIn = scores.length === checkedInCount
  // Show the facilitator a tooltip if nobody has voted yet
  // Show the participant a tooltip if they haven’t voted yet
  // Consider dismissing the tooltip silently if each role has seen their tooltip once
  // - Show the facilitator a tooltip if nobody has voted yet and the facilitator hasn’t revealed once
  // - Show the participant a tooltip if they haven’t voted once
  const showTip = Boolean((isFacilitator && !hasVotes) || (!isFacilitator && !viewerHasVoted))
  const tipCopy = isFacilitator
    ? t('PokerActiveVoting.VotesAreAutomaticallyRevealedOnceEveryoneHasVoted')
    : t('PokerActiveVoting.TapACardToVoteSwipeToViewEachDimension')
  const showRevealButton = isFacilitator && scores.length > 0
  const {onError, onCompleted, submitMutation, submitting, error} = useMutationProps()
  const reveal = () => {
    if (submitting) return
    submitMutation()
    PokerRevealVotesMutation(atmosphere, {meetingId, stageId}, {onError, onCompleted})
  }
  const users = scores.map(({user}) => user)
  return (
    <>
      <PokerVotingRowBase>
        <MiniCardWrapper>
          <MiniPokerCard>
            <StyledCheckIcon />
          </MiniPokerCard>
        </MiniCardWrapper>
        <AvatarList
          users={isClosing ? [] : users}
          size={PokerCards.AVATAR_WIDTH as 46}
          isAnimated={!isInitialStageRender}
          borderColor={PALETTE.SLATE_300}
          emptyEl={<PokerVotingNoVotes />}
        />
      </PokerVotingRowBase>
      <RevealButtonBlock>
        {showRevealButton && (
          <RevealButton onClick={reveal} color={PALETTE.SLATE_600}>
            <Progress radius={22} thickness={4} stroke={PALETTE.JADE_400} progress={votePercent} />
            <RevealButtonIcon color={allVotesIn ? PALETTE.JADE_400 : PALETTE.SLATE_400}>
              <CheckIcon />
            </RevealButtonIcon>
            <RevealLabel color={allVotesIn ? PALETTE.JADE_400 : PALETTE.SLATE_600}>
              {t('PokerActiveVoting.RevealVotes')}
            </RevealLabel>
          </RevealButton>
        )}
        {error && <StyledError>{error.message}</StyledError>}
      </RevealButtonBlock>
      <BannerWrap showTip={showTip}>
        <StyledTipBanner>{tipCopy}</StyledTipBanner>
      </BannerWrap>
    </>
  )
}

export default createFragmentContainer(PokerActiveVoting, {
  stage: graphql`
    fragment PokerActiveVoting_stage on EstimateStage {
      id
      scores {
        userId
        user {
          ...AvatarList_users
        }
      }
    }
  `,
  meeting: graphql`
    fragment PokerActiveVoting_meeting on PokerMeeting {
      facilitatorUserId
      id
      meetingMembers {
        id
        isSpectating
      }
    }
  `
})
