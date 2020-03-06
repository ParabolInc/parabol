import React, {forwardRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import DiscussionThreadListEmptyState from './DiscussionThreadListEmptyState'
import {DiscussionThreadList_threadables} from '__generated__/DiscussionThreadList_threadables.graphql'
import {Elevation} from 'styles/elevation'
import ThreadedTask from './ThreadedTask'
import ThreadedComment from './ThreadedComment'

const EmptyWrapper = styled('div')({
  alignItems: 'center',
  boxShadow: Elevation.DISCUSSION_THREAD_INSET,
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
  paddingTop: 8
})

// https://stackoverflow.com/questions/36130760/use-justify-content-flex-end-and-to-have-vertical-scrollbar
const PusherDowner = styled('div')({
  margin: 'auto'
})

interface Props {
  teamId: string
  threadables: DiscussionThreadList_threadables
}

const DiscussionThreadList = forwardRef((props: Props, ref: any) => {
  const {teamId, threadables} = props
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
          <ThreadedComment key={id} comment={threadable} teamId={teamId} />
        )
      })}
    </Wrapper>
  )
})

export default createFragmentContainer(DiscussionThreadList, {
  threadables: graphql`
    fragment DiscussionThreadList_threadables on Threadable @relay(plural: true) {
      ...ThreadedTask_task
      ...ThreadedComment_comment
      ... on Comment {
        reactjis {
          id
        }
      }
      __typename
      id
      content
    }
  `
})
