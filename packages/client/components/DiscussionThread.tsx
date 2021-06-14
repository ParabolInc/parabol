import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject, useMemo, useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {useCoverable} from '~/hooks/useControlBarCovers'
import {Breakpoint, DiscussionThreadEnum, MeetingControlBarEnum} from '~/types/constEnums'
import {DiscussionThread_viewer} from '~/__generated__/DiscussionThread_viewer.graphql'
import {Elevation} from '../styles/elevation'
import makeMinWidthMediaQuery from '../utils/makeMinWidthMediaQuery'
import DiscussionThreadInput from './DiscussionThreadInput'
import DiscussionThreadList, {DiscussionThreadables} from './DiscussionThreadList'

const Wrapper = styled('div')<{isExpanded: boolean; width?: string}>(({isExpanded, width}) => ({
  background: '#fff',
  borderRadius: 4,
  boxShadow: Elevation.DISCUSSION_THREAD,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '100%',
  overflow: 'hidden',
  width: width || '100%',
  [makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)]: {
    height: isExpanded ? '100%' : `calc(100% - ${MeetingControlBarEnum.HEIGHT}px)`,
    width: DiscussionThreadEnum.WIDTH
  }
}))

interface Props {
  meetingContentRef?: RefObject<HTMLDivElement>
  isReadOnly: boolean
  allowedThreadables: DiscussionThreadables[]
  width?: string
  viewer: DiscussionThread_viewer
}

const DiscussionThread = (props: Props) => {
  const {meetingContentRef, isReadOnly, allowedThreadables, width, viewer} = props
  const isDrawer = !!width // hack to say this is in a poker meeting
  const listRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const ref = useRef<HTMLDivElement>(null)
  const isExpanded =
    useCoverable(
      'threads',
      ref,
      MeetingControlBarEnum.HEIGHT,
      meetingContentRef,
      undefined,
      isDrawer
    ) || isReadOnly
  const {discussion} = viewer
  const commentors = discussion?.thread?.commentors ?? []
  const preferredNames = useMemo(() => commentors.map(({preferredName}) => preferredName), [
    commentors
  ])
  if (!discussion) {
    return <div>No discussion found!</div>
  }

  const {replyingToCommentId, thread} = discussion
  const edges = thread?.edges ?? [] // should never happen, but Terry reported it in demo. likely relay error
  const threadables = edges.map(({node}) => node)
  const getMaxSortOrder = () => {
    return Math.max(0, ...threadables.map((threadable) => threadable.threadSortOrder || 0))
  }

  return (
    <Wrapper isExpanded={isExpanded} width={width} ref={ref}>
      <DiscussionThreadList
        dataCy='discuss-thread-list'
        discussion={discussion}
        allowedThreadables={allowedThreadables}
        isReadOnly={isReadOnly}
        preferredNames={preferredNames}
        threadables={threadables}
        ref={listRef}
        editorRef={editorRef}
        viewer={viewer}
      />
      <DiscussionThreadInput
        allowedThreadables={allowedThreadables}
        dataCy='discuss-input'
        editorRef={editorRef}
        isDisabled={!!replyingToCommentId}
        getMaxSortOrder={getMaxSortOrder}
        discussion={discussion}
        viewer={viewer}
      />
    </Wrapper>
  )
}

export default createFragmentContainer(DiscussionThread, {
  viewer: graphql`
    fragment DiscussionThread_viewer on User {
      ...DiscussionThreadInput_viewer
      ...DiscussionThreadList_viewer
      discussion(id: $discussionId) {
        ...DiscussionThreadInput_discussion
        ...DiscussionThreadList_discussion
        id
        replyingToCommentId
        thread(first: 1000) @connection(key: "DiscussionThread_thread") {
          commentors {
            id
            preferredName
          }
          edges {
            node {
              threadSortOrder
              discussionId
              ...DiscussionThreadList_threadables
              threadSortOrder
            }
          }
        }
      }
    }
  `
})
