import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useRef, RefObject} from 'react'
import {createFragmentContainer} from 'react-relay'
import {useCoverable} from '~/hooks/useControlBarCovers'
import {Breakpoint, DiscussionThreadEnum, MeetingControlBarEnum} from '~/types/constEnums'
import {DiscussionThread_viewer} from '~/__generated__/DiscussionThread_viewer.graphql'
import {Elevation} from '../styles/elevation'
import makeMinWidthMediaQuery from '../utils/makeMinWidthMediaQuery'
import DiscussionThreadInput from './DiscussionThreadInput'
import DiscussionThreadList from './DiscussionThreadList'

const Wrapper = styled('div')<{isExpanded: boolean}>(({isExpanded}) => ({
  background: '#fff',
  borderRadius: 4,
  boxShadow: Elevation.DISCUSSION_THREAD,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
  width: 'calc(100% - 16px)',
  [makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)]: {
    height: isExpanded ? '100%' : `calc(100% - ${MeetingControlBarEnum.HEIGHT}px)`,
    width: DiscussionThreadEnum.WIDTH
  }
}))

interface Props {
  meetingContentRef: RefObject<HTMLDivElement>
  viewer: DiscussionThread_viewer
}

const DiscussionThread = (props: Props) => {
  const {meetingContentRef, viewer} = props

  const meeting = viewer.meeting!
  const {endedAt, replyingToCommentId, threadSource} = meeting
  const {thread} = threadSource!

  const threadSourceId = threadSource!.id!
  const edges = thread?.edges ?? [] // should never happen, but Terry reported it in demo. likely relay error
  const threadables = edges.map(({node}) => node)
  const getMaxSortOrder = () => {
    return Math.max(0, ...threadables.map((threadable) => threadable.threadSortOrder || 0))
  }
  const listRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const ref = useRef<HTMLDivElement>(null)
  const isExpanded =
    useCoverable('threads', ref, MeetingControlBarEnum.HEIGHT, meetingContentRef) || !!endedAt

  return (
    <Wrapper isExpanded={isExpanded} ref={ref}>
      <DiscussionThreadList
        dataCy='discuss-thread-list'
        threadSourceId={threadSourceId}
        meeting={meeting}
        threadables={threadables}
        ref={listRef}
        editorRef={editorRef}
      />
      <DiscussionThreadInput
        dataCy='discuss-input'
        editorRef={editorRef}
        isDisabled={!!replyingToCommentId}
        getMaxSortOrder={getMaxSortOrder}
        meeting={meeting}
        threadSourceId={threadSourceId}
      />
    </Wrapper>
  )
}

graphql`
  fragment DiscussionThread_threadSource on ThreadSource {
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
export default createFragmentContainer(DiscussionThread, {
  viewer: graphql`
    fragment DiscussionThread_viewer on User {
      meeting(meetingId: $meetingId) {
        ... on NewMeeting {
          ...DiscussionThreadInput_meeting
          ...DiscussionThreadList_meeting
          endedAt
          replyingToCommentId
        }
        ... on RetrospectiveMeeting {
          threadSource: reflectionGroup(reflectionGroupId: $threadSourceId) {
            ...DiscussionThread_threadSource @relay(mask: false)
          }
        }
        ... on ActionMeeting {
          threadSource: agendaItem(agendaItemId: $threadSourceId) {
            ...DiscussionThread_threadSource @relay(mask: false)
          }
        }
      }
    }
  `
})
