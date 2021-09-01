import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ThreadedPollBase_discussion} from '~/__generated__/ThreadedPollBase_discussion.graphql'
import {ThreadedPollBase_poll} from '~/__generated__/ThreadedPollBase_poll.graphql'
import {DiscussionThreadables} from './DiscussionThreadList'
import Poll from './Poll/Poll'
import PollOption from './Poll/PollOption'

interface Props {
  allowedThreadables: DiscussionThreadables[]
  poll: ThreadedPollBase_poll
  discussion: ThreadedPollBase_discussion
  dataCy: string
}

const PollRoot = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'start',
  padding: '8px 0'
})

const PollOptionRoot = styled.div({})

const ThreadedPollBase = (props: Props) => {
  const {dataCy, poll} = props
  return (
    <Poll as={PollRoot} data-cy={`${dataCy}-wrapper`} poll={poll}>
      {poll.options.map((option) => (
        <PollOption as={PollOptionRoot} key={option.id} id={option.id}>
          {option.title}
        </PollOption>
      ))}
    </Poll>
  )
}

export default createFragmentContainer(ThreadedPollBase, {
  discussion: graphql`
    fragment ThreadedPollBase_discussion on Discussion {
      ...Poll_discussion
      id
    }
  `,
  poll: graphql`
    fragment ThreadedPollBase_poll on Poll {
      ...Poll_poll
      id
      title
      threadSortOrder
      options {
        id
        title
      }
    }
  `
})
