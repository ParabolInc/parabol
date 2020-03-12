import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import useInitialRender from 'hooks/useInitialRender'
import React, {forwardRef, RefObject, useEffect} from 'react'
import {createFragmentContainer} from 'react-relay'
import {DiscussionThreadList_meeting} from '__generated__/DiscussionThreadList_meeting.graphql'
import {DiscussionThreadList_threadables} from '__generated__/DiscussionThreadList_threadables.graphql'
import DiscussionThreadListEmptyState from './DiscussionThreadListEmptyState'
import ThreadedItem from './ThreadedItem'

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
  if (isEmpty) {
    return (
      <EmptyWrapper>
        <DiscussionThreadListEmptyState />
      </EmptyWrapper>
    )
  }
  const isInit = useInitialRender()
  // if we're at or near the bottom of the scroll container
  // and the body is the active element
  // then scroll to the bottom whenever threadables changes

  useEffect(() => {
    const {current: el} = ref
    if (!el) return

    const {scrollTop, scrollHeight, clientHeight} = el
    if (isInit) {
      el.scrollTo({top: scrollHeight})
      return
    }
    // get the element for the draft-js el or android fallback
    const edEl = (editorRef.current as any)?.editor || editorRef.current

    // if i'm writing something or i'm almost at the bottom, go to the bottom
    if (document.activeElement === edEl || scrollTop + clientHeight > scrollHeight - 20) {
      el.scrollTo({top: scrollHeight, behavior: 'smooth'})
    }
  }, [isInit, threadables])

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
