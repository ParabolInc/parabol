import React, {useState} from 'react'
import styled from '@emotion/styled'
import MiniPokerCardPlaceholder from './MiniPokerCardPlaceholder'
import PokerVotingAvatarGroup from './PokerVotingAvatarGroup'
import PokerVotingRowBase from './PokerVotingRowBase'
import PokerVotingRowEmpty from './PokerVotingRowEmpty'
import Icon from './Icon'
import TipBanner from './TipBanner'
import SecondaryButtonCool from './SecondaryButtonCool'
import {PALETTE} from '~/styles/paletteV2'
import useHotkey from '~/hooks/useHotkey'
import getPokerVoters from '~/utils/getPokerVoters'

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
  scores: Array<any>
  teamMembers: Array<any>
}

const PokerActiveVoting = (props: Props) => {

  const {scores, teamMembers} = props

  const [hasVotes, setHasVotes] = useState(true)
  useHotkey('v', () => {
    setHasVotes(!hasVotes)
  })

  const [isFacilitator, setIsFacilitator] = useState(true)
  useHotkey('f', () => {
    setIsFacilitator(!isFacilitator)
  })

  const [viewerHasVoted, setViewerHasVoted] = useState(false)
  useHotkey('p', () => {
    setViewerHasVoted(!viewerHasVoted)
  })

  // Show the facilitator a tooltip if nobody has voted yet
  // Show the participant a tooltip if they haven’t voted yet
  // Consider dismissing the tooltip silently if each role has seen their tooltip once
  // - Show the facilitator a tooltip if nobody has voted yet and the facilitator hasn’t revealed once
  // - Show the participant a tooltip if they haven’t voted once
  const showTip = Boolean(isFacilitator && !hasVotes || !isFacilitator && !viewerHasVoted)
  const tipCopy = isFacilitator
    ? 'Votes are automatically revealed once everyone has voted.'
    : 'Tap a card to vote. Swipe to view each dimension.'

  // Todo: Peeking avatars animate into the pre-revealed row
  //       - The array of voters has an index
  //       - The pre-revealed row has an x and y position
  //       - Animate the peeking avatar to the  y position and the x + (index * avatar width)
  //       - Transition out the peeking avatar, transition in the actual avatar in the row

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

export default PokerActiveVoting
