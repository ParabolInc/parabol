import graphql from 'babel-plugin-relay/macro'
import type * as React from 'react'
import {useFragment} from 'react-relay'
import {Polls, PollsAriaLabels} from '~/types/constEnums'
import type {EditablePollTitle_poll$key} from '../../__generated__/EditablePollTitle_poll.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import {updateLocalPoll} from './local/newPoll'

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
    <input
      className='border-0 border-hairline-strong border-b border-solid px-3 py-[10px] text-[14px] text-fg-primary hover:outline-none focus:outline-none active:outline-none'
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
