import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {forwardRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {DiscussionThreadList_meeting} from '__generated__/DiscussionThreadList_meeting.graphql'
import {DiscussionThreadList_threadables} from '__generated__/DiscussionThreadList_threadables.graphql'
import DiscussionThreadListEmptyState from './DiscussionThreadListEmptyState'
import ThreadedComment from './ThreadedComment'
import ThreadedTask from './ThreadedTask'

const EmptyWrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'center'
})

const Wrapper = styled('div')({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
  padding: 8
})

// https://stackoverflow.com/questions/36130760/use-justify-content-flex-end-and-to-have-vertical-scrollbar
const PusherDowner = styled('div')({
  margin: 'auto'
})

interface Props {
  meeting: DiscussionThreadList_meeting
  reflectionGroupId: string
  replyingToComment: string
  setReplyingToComment: (commentId: string) => void
  threadables: DiscussionThreadList_threadables
}

const DiscussionThreadList = forwardRef((props: Props, ref: any) => {
  const {meeting, reflectionGroupId, replyingToComment, setReplyingToComment, threadables} = props
  const isEmpty = threadables.length === 0
  if (isEmpty) {
    return (
      <EmptyWrapper>
        <DiscussionThreadListEmptyState />
      </EmptyWrapper>
    )
  }
  return (
    <Wrapper ref={ref}>
      <PusherDowner />
      {threadables.map((threadable) => {
        const {__typename, id} = threadable
        return __typename === 'Task' ? (
          <ThreadedTask key={id} task={threadable} />
        ) : (
          <ThreadedComment
            key={id}
            comment={threadable}
            meeting={meeting}
            reflectionGroupId={reflectionGroupId}
            isReplying={id === replyingToComment}
            setReplyingToComment={setReplyingToComment}
          />
        )
      })}
    </Wrapper>
  )
})

export default createFragmentContainer(DiscussionThreadList, {
  meeting: graphql`
    fragment DiscussionThreadList_meeting on RetrospectiveMeeting {
      ...ThreadedComment_meeting
    }
  `,
  threadables: graphql`
    fragment DiscussionThreadList_threadables on Threadable @relay(plural: true) {
      ...ThreadedTask_task
      ...ThreadedComment_comment
      __typename
      id
    }
  `
})
