import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {DiscussionThreadEnum} from 'types/constEnums'
import {Elevation} from '../styles/elevation'
import DiscussionThreadInput from './DiscussionThreadInput'
import DiscussionThreadList from './DiscussionThreadList'
import {DiscussionThread_viewer} from '__generated__/DiscussionThread_viewer.graphql'

const Wrapper = styled('div')({
  background: '#fff',
  borderRadius: 4,
  boxShadow: Elevation.DISCUSSION_THREAD,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  marginBottom: 64,
  overflow: 'hidden',
  width: DiscussionThreadEnum.WIDTH
})

interface Props {
  viewer: DiscussionThread_viewer
}

const DiscussionThread = (props: Props) => {
  const {viewer} = props
  const meeting = viewer.meeting!
  const {replyingToCommentId, reflectionGroup} = meeting
  const {id: reflectionGroupId, thread} = reflectionGroup!
  const edges = thread?.edges ?? [] // should never happen, but Terry reported it in demo. likely relay error
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
  viewer: graphql`
    fragment DiscussionThread_viewer on User {
      meeting(meetingId: $meetingId) {
        ... on RetrospectiveMeeting {
          ...DiscussionThreadInput_meeting
          ...DiscussionThreadList_meeting
          replyingToCommentId
          reflectionGroup(reflectionGroupId: $reflectionGroupId) {
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
        }
      }
    }
  `
})
