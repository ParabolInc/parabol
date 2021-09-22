import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {ThreadedPollBase_poll$key} from '~/__generated__/ThreadedPollBase_poll.graphql'
import {ThreadedPollBase_discussion$key} from '~/__generated__/ThreadedPollBase_discussion.graphql'
import {DiscussionThreadables} from './DiscussionThreadList'
import Poll from './Poll/Poll'
import PollOptions from './Poll/PollOptions'
import PollTitle from './Poll/PollTitle'
import PollActions from './Poll/PollActions'

interface Props {
  allowedThreadables: DiscussionThreadables[]
  poll: ThreadedPollBase_poll$key
  discussion: ThreadedPollBase_discussion$key
  dataCy: string
}

const ThreadedPollBase = (props: Props) => {
  const {dataCy, poll: pollRef, discussion: discussionRef} = props
  const poll = useFragment(
    graphql`
      fragment ThreadedPollBase_poll on Poll {
        ...Poll_poll
      }
    `,
    pollRef
  )
  const discussion = useFragment(
    graphql`
      fragment ThreadedPollBase_discussion on Discussion {
        ...Poll_discussion
      }
    `,
    discussionRef
  )

  return (
    <Poll dataCy={`${dataCy}-poll`} poll={poll} discussion={discussion}>
      <PollTitle />
      <PollOptions />
      <PollActions />
    </Poll>
  )
}

export default ThreadedPollBase
