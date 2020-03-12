import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useRef, useEffect} from 'react'
import {createFragmentContainer} from 'react-relay'
import {DiscussionThreadEnum} from 'types/constEnums'
import {DiscussionThread_meeting} from '__generated__/DiscussionThread_meeting.graphql'
import {DiscussionThread_reflectionGroup} from '__generated__/DiscussionThread_reflectionGroup.graphql'
import {Elevation} from '../styles/elevation'
import DiscussionThreadInput from './DiscussionThreadInput'
import DiscussionThreadList from './DiscussionThreadList'
import useInitialRender from 'hooks/useInitialRender'

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
  const {replyingToCommentId} = meeting
  const {id: reflectionGroupId, thread} = reflectionGroup
  const {edges} = thread
  const threadables = edges.map(({node}) => node)
  const getMaxSortOrder = () => {
    return Math.max(0, ...threadables.map((threadable) => threadable.threadSortOrder || 0))
  }
  const listRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  return (
    <Wrapper>
      <DiscussionThreadList
        reflectionGroupId={reflectionGroupId}
        meeting={meeting}
        threadables={threadables}
        ref={listRef}
        editorRef={editorRef}
      />
      <DiscussionThreadInput
        editorRef={editorRef}
        isDisabled={!!replyingToCommentId}
        getMaxSortOrder={getMaxSortOrder}
        meeting={meeting}
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
      replyingToCommentId
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
