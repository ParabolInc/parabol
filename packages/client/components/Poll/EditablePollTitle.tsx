import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import {Polls, PollsAriaLabels} from '~/types/constEnums'
import useAtmosphere from '../../hooks/useAtmosphere'
import {EditablePollTitle_poll$key} from '../../__generated__/EditablePollTitle_poll.graphql'
import {updateLocalPoll} from './local/newPoll'

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
  pollRef: EditablePollTitle_poll$key
  onFocus: () => void
  onBlur: () => void
}

const EditablePollTitle = (props: Props) => {
  const {pollRef, onFocus, onBlur} = props
  const poll = useFragment(
    graphql`
      fragment EditablePollTitle_poll on Poll {
        id
        title
      }
    `,
    pollRef
  )
  const atmosphere = useAtmosphere()
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
      onFocus={onFocus}
      onBlur={onBlur}
    />
  )
}

export default EditablePollTitle
