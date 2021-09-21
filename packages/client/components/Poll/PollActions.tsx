import React from 'react'
import styled from '@emotion/styled'
import {usePollContext} from './PollContext'
import {PALETTE} from '../../styles/paletteV3'
import PlainButton from '../PlainButton/PlainButton'
import {AddPollOptionButton} from './AddPollOptionButton'
import {Polls} from '~/types/constEnums'

const PollActionsRoot = styled('div')({
  width: '100%',
  padding: `0px 12px 12px 12px`,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
})

const StartPollButton = styled(PlainButton)({
  padding: `8px 24px`,
  fontSize: '14px',
  fontWeight: 500,
  background: PALETTE.SKY_500,
  outline: 'none',
  color: PALETTE.WHITE,
  border: 'none',
  borderRadius: '24px',
  cursor: 'pointer',
  ':hover': {
    background: PALETTE.SKY_600
  },
  marginLeft: 'auto'
})

const SubmitVoteButton = styled(PlainButton)({
  padding: `8px 24px`,
  fontSize: '14px',
  fontWeight: 500,
  background: PALETTE.SLATE_300,
  outline: 'none',
  color: PALETTE.SLATE_700,
  border: 'none',
  borderRadius: '24px',
  cursor: 'pointer',
  ':hover': {
    background: PALETTE.SLATE_400
  }
})

const PollActions = () => {
  const {pollState, addPollOption, poll} = usePollContext()

  if (pollState === 'creating') {
    return (
      <PollActionsRoot>
        {poll.options.length < Polls.MAX_OPTIONS && (
          <AddPollOptionButton dataCy='poll-option' onClick={addPollOption} />
        )}
        <StartPollButton>Start</StartPollButton>
      </PollActionsRoot>
    )
  }

  return (
    <PollActionsRoot>
      <SubmitVoteButton>Submit and view results</SubmitVoteButton>
    </PollActionsRoot>
  )
}

export default PollActions
