import React from 'react'
import styled from '@emotion/styled'
import {usePollContext} from './PollContext'
import {PALETTE} from '~/styles/paletteV3'

const PollTitleHeader = styled('div')({
  padding: `10px 12px 0px 12px`,
  fontSize: '14px'
})

const PollTitleInput = styled('input')({
  padding: `10px 12px`,
  fontSize: '14px',
  border: 'none',
  color: PALETTE.SLATE_900,
  borderBottom: `1px solid ${PALETTE.SLATE_400}`,
  ':hover, :focus, :active': {
    outline: 'none'
  }
})

const PollTitle = () => {
  const {pollState, poll, updatePoll} = usePollContext()

  if (pollState === 'creating') {
    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      updatePoll(poll.id, event.target.value)
    }

    return (
      <PollTitleInput
        value={poll.title}
        placeholder='Ask a question...'
        onChange={handleTitleChange}
      />
    )
  }

  return <PollTitleHeader>{poll.title}</PollTitleHeader>
}

export default PollTitle
