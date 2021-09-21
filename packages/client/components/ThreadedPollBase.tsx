import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ThreadedPollBase_poll} from '~/__generated__/ThreadedPollBase_poll.graphql'
import {ThreadedPollBase_discussion} from '~/__generated__/ThreadedPollBase_discussion.graphql'
import {DiscussionThreadables} from './DiscussionThreadList'
import Poll from './Poll/Poll'
import PollOptions from './Poll/PollOptions'
import PollTitle from './Poll/PollTitle'
import PollActions from './Poll/PollActions'

interface Props {
  allowedThreadables: DiscussionThreadables[]
  poll: ThreadedPollBase_poll
  discussion: ThreadedPollBase_discussion
  dataCy: string
}

const ThreadedPollBase = (props: Props) => {
  const {dataCy, poll, discussion} = props

  return (
    <Poll dataCy={`${dataCy}-poll`} poll={poll} discussion={discussion}>
      <PollTitle />
      <PollOptions />
      <PollActions />
    </Poll>
  )
}

export default createFragmentContainer(ThreadedPollBase, {
  discussion: graphql`
    fragment ThreadedPollBase_discussion on Discussion {
      ...Poll_discussion
    }
  `,
  poll: graphql`
    fragment ThreadedPollBase_poll on Poll {
      ...Poll_poll
    }
  `
})
