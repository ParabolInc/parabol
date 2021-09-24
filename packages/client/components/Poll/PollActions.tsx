import React, {Ref} from 'react'
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
  marginTop: '12px',
  fontSize: '14px',
  fontWeight: 500,
  background: PALETTE.SLATE_300,
  color: PALETTE.SLATE_700,
  border: 'none',
  borderRadius: '24px',
  ':hover': {
    background: PALETTE.SLATE_400
  }
})

const StartPollWrapper = styled('div')({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '12px'
})

const PollActions = React.forwardRef((_, ref: Ref<HTMLDivElement>) => {
  const {
    pollState,
    poll,
    canCreatePoll,
    addPollOption,
    createPoll,
    selectedPollOptionId
  } = usePollContext()

  const renderPollActions = () => {
    if (pollState === 'creating') {
      return (
        <StartPollWrapper>
          {poll.options.length < Polls.MAX_OPTIONS && (
            <AddPollOptionButton dataCy='poll-option' onClick={addPollOption} />
          )}
          <StartPollButton onClick={createPoll} disabled={!canCreatePoll}>
            Start
          </StartPollButton>
        </StartPollWrapper>
      )
    }

    if (selectedPollOptionId) {
      return <SubmitVoteButton>Submit and view results</SubmitVoteButton>
    }
    return null
  }

  return <PollActionsRoot ref={ref}>{renderPollActions()}</PollActionsRoot>
})

export default PollActions
