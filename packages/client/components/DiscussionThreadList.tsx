import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {forwardRef, RefObject} from 'react'
import {createFragmentContainer} from 'react-relay'
import {DiscussionThreadList_meeting} from '__generated__/DiscussionThreadList_meeting.graphql'
import {DiscussionThreadList_threadables} from '__generated__/DiscussionThreadList_threadables.graphql'
import DiscussionThreadListEmptyState from './DiscussionThreadListEmptyState'
import ThreadedItem from './ThreadedItem'
import useScrollThreadList from 'hooks/useScrollThreadList'

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
  padding: '8px 0'
})

// https://stackoverflow.com/questions/36130760/use-justify-content-flex-end-and-to-have-vertical-scrollbar
const PusherDowner = styled('div')({
  margin: 'auto'
})

interface Props {
  editorRef: RefObject<HTMLTextAreaElement>
  meeting: DiscussionThreadList_meeting
  reflectionGroupId: string
  threadables: DiscussionThreadList_threadables
}

const DiscussionThreadList = forwardRef((props: Props, ref: any) => {
  const {editorRef, meeting, reflectionGroupId, threadables} = props
  const isEmpty = threadables.length === 0
  useScrollThreadList(threadables, editorRef, ref)
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
        const {id} = threadable
        return (
          <ThreadedItem
            key={id}
            threadable={threadable}
            meeting={meeting}
            reflectionGroupId={reflectionGroupId}
          />
        )
      })}
    </Wrapper>
  )
})

export default createFragmentContainer(DiscussionThreadList, {
  meeting: graphql`
    fragment DiscussionThreadList_meeting on RetrospectiveMeeting {
      ...ThreadedItem_meeting
    }
  `,
  threadables: graphql`
    fragment DiscussionThreadList_threadables on Threadable @relay(plural: true) {
      ...ThreadedItem_threadable
      id
    }
  `
})
