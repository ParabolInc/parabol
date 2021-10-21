import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import {useFragment} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import {Polls, PollsAriaLabels} from '~/types/constEnums'
import {updateLocalPoll} from './local/newPoll'
import useAtmosphere from '../../hooks/useAtmosphere'
import {getPollState} from './PollState'
import {PollTitle_poll$key} from '../../__generated__/PollTitle_poll.graphql'

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

interface Props {
  poll: PollTitle_poll$key
}

const PollTitle = (props: Props) => {
  const {poll: pollRef} = props
  const poll = useFragment(
    graphql`
      fragment PollTitle_poll on Poll {
        id
        title
      }
    `,
    pollRef
  )
  const pollState = getPollState(poll.id)
  const atmosphere = useAtmosphere()

  if (pollState === 'creating') {
    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      updateLocalPoll(atmosphere, poll.id, event.target.value)
    }

    return (
      <PollTitleInput
        aria-label={PollsAriaLabels.POLL_TITLE_EDITOR}
        autoFocus
        value={poll.title}
        maxLength={Polls.MAX_TITLE_LENGTH}
        placeholder='Ask a question...'
        onChange={handleTitleChange}
      />
    )
  }

  return <PollTitleHeader>{poll.title}</PollTitleHeader>
}

export default PollTitle
