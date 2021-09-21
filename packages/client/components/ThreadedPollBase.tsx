import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ThreadedPollBase_poll} from '~/__generated__/ThreadedPollBase_poll.graphql'
import {DiscussionThreadables} from './DiscussionThreadList'
import Poll from './Poll/Poll'
import PollOptions from './Poll/PollOptions'
import PollTitle from './Poll/PollTitle'
import PollActions from './Poll/PollActions'

interface Props {
  allowedThreadables: DiscussionThreadables[]
  poll: ThreadedPollBase_poll
  dataCy: string
}

const ThreadedPollBase = (props: Props) => {
  const {dataCy, poll} = props

  return (
    <Poll dataCy={`${dataCy}-poll`} poll={poll}>
      <PollTitle />
      <PollOptions />
      <PollActions />
    </Poll>
  )
}

export default createFragmentContainer(ThreadedPollBase, {
  poll: graphql`
    fragment ThreadedPollBase_poll on Poll {
      ...Poll_poll
    }
  `
})
