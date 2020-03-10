import React, {useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import DiscussionThreadList from './DiscussionThreadList'
import {DiscussionThreadEnum} from 'types/constEnums'
import {Elevation} from '../styles/elevation'
import {DiscussionThread_reflectionGroup} from '__generated__/DiscussionThread_reflectionGroup.graphql'
import DiscussionThreadInput from './DiscussionThreadInput'
import {DiscussionThread_meeting} from '__generated__/DiscussionThread_meeting.graphql'

const Wrapper = styled('div')({
  background: '#fff',
  borderRadius: 4,
  boxShadow: Elevation.DISCUSSION_THREAD,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  marginBottom: 16,
  overflow: 'hidden',
  width: DiscussionThreadEnum.WIDTH
})

interface Props {
  meeting: DiscussionThread_meeting
  reflectionGroup: DiscussionThread_reflectionGroup
}

const DiscussionThread = (props: Props) => {
  const {meeting, reflectionGroup} = props
  const {id: reflectionGroupId, thread} = reflectionGroup
  const {edges} = thread
  const threadables = edges.map(({node}) => node)
  const getMaxSortOrder = () => {
    return Math.max(0, ...threadables.map((threadable) => threadable.threadSortOrder || 0))
  }
  const listRef = useRef<HTMLDivElement>(null)
  const onSubmit = () => {
    // wait a tick so the optimistic comment can hit the DOM
    setImmediate(() => {
      listRef.current?.scrollTo({top: 1e6, behavior: 'smooth'})
    })
  }
  // use a string to guarantee single reply open even when click from reply to reply with full comment
  const [replyingToComment, setReplyingToComment] = useState('')
  const editorRef = useRef<HTMLTextAreaElement>(null)
  return (
    <Wrapper>
      <DiscussionThreadList
        reflectionGroupId={reflectionGroupId}
        meeting={meeting}
        replyingToComment={replyingToComment}
        setReplyingToComment={setReplyingToComment}
        threadables={threadables}
        ref={listRef}
      />
      <DiscussionThreadInput
        editorRef={editorRef}
        isDisabled={!!replyingToComment}
        getMaxSortOrder={getMaxSortOrder}
        meeting={meeting}
        onSubmit={onSubmit}
        reflectionGroupId={reflectionGroupId}
      />
    </Wrapper>
  )
}

export default createFragmentContainer(DiscussionThread, {
  meeting: graphql`
    fragment DiscussionThread_meeting on RetrospectiveMeeting {
      ...DiscussionThreadInput_meeting
      ...DiscussionThreadList_meeting
    }
  `,
  reflectionGroup: graphql`
    fragment DiscussionThread_reflectionGroup on RetroReflectionGroup {
      id
      thread(first: 1000) @connection(key: "DiscussionThread_thread") {
        edges {
          node {
            threadSortOrder
            threadId
            threadSource
            ...DiscussionThreadList_threadables
            threadSortOrder
          }
        }
      }
    }
  `
})
