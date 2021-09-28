import React, {Ref} from 'react'
import styled from '@emotion/styled'
import {usePollContext} from './PollContext'
import {PALETTE} from '~/styles/paletteV3'
import {PollsAriaLabels} from '~/types/constEnums'

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

const PollTitle = React.forwardRef((_, ref: Ref<any>) => {
  const {pollState, poll, updatePoll, onPollFocused, onPollBlurred} = usePollContext()

  if (pollState === 'creating') {
    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      updatePoll(poll.id, event.target.value)
    }

    return (
      <PollTitleInput
        ref={ref}
        aria-label={PollsAriaLabels.POLL_TITLE_EDITOR}
        data-cy='poll-title-input'
        autoFocus
        value={poll.title}
        placeholder='Ask a question...'
        onChange={handleTitleChange}
        onFocus={onPollFocused}
        onBlur={onPollBlurred}
      />
    )
  }

  return <PollTitleHeader ref={ref}>{poll.title}</PollTitleHeader>
})

export default PollTitle
