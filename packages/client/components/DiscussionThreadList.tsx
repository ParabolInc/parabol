import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {forwardRef, ReactNode, RefObject} from 'react'
import {useFragment} from 'react-relay'
import useScrollThreadList from '~/hooks/useScrollThreadList'
import {DiscussionThreadList_discussion$key} from '~/__generated__/DiscussionThreadList_discussion.graphql'
import {DiscussionThreadList_threadables$key} from '~/__generated__/DiscussionThreadList_threadables.graphql'
import {DiscussionThreadList_viewer$key} from '~/__generated__/DiscussionThreadList_viewer.graphql'
import {PALETTE} from '../styles/paletteV3'
import CommentingStatusText from './CommentingStatusText'
import LabelHeading from './LabelHeading/LabelHeading'
import ThreadedItem from './ThreadedItem'

const EmptyWrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  flex: 1,
  padding: '8px 0',
  overflow: 'auto'
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
  margin: '0 0 auto'
})

export const Header = styled(LabelHeading)({
  borderBottom: `1px solid ${PALETTE.SLATE_300}`,
  margin: '0 0 8px',
  padding: '6px 12px 12px',
  textTransform: 'none',
  width: '100%'
})

const CommentingStatusBlock = styled('div')({
  height: 36,
  width: '100%'
})

export type DiscussionThreadables = 'task' | 'comment' | 'poll'

interface Props {
  allowedThreadables: DiscussionThreadables[]
  editorRef: RefObject<HTMLTextAreaElement>
  discussion: DiscussionThreadList_discussion$key
  preferredNames: string[] | null
  threadables: DiscussionThreadList_threadables$key
  viewer: DiscussionThreadList_viewer$key
  dataCy: string
  header?: ReactNode
  emptyState?: ReactNode
}

const DiscussionThreadList = forwardRef((props: Props, ref: any) => {
  const {
    allowedThreadables,
    editorRef,
    discussion: discussionRef,
    threadables: threadablesRef,
    dataCy,
    preferredNames,
    viewer: viewerRef,
    header,
    emptyState
  } = props
  const viewer = useFragment(
    graphql`
      fragment DiscussionThreadList_viewer on User {
        ...ThreadedItem_viewer
      }
    `,
    viewerRef
  )
  const discussion = useFragment(
    graphql`
      fragment DiscussionThreadList_discussion on Discussion {
        ...ThreadedItem_discussion
      }
    `,
    discussionRef
  )
  const threadables = useFragment(
    graphql`
      fragment DiscussionThreadList_threadables on Threadable @relay(plural: true) {
        ...ThreadedItem_threadable
        ... on Poll {
          updatedAt
        }
        id
      }
    `,
    threadablesRef
  )
  const isEmpty = threadables.length === 0
  useScrollThreadList(threadables, editorRef, ref, preferredNames)
  if (isEmpty && emptyState) {
    return (
      <EmptyWrapper>
        {header}
        {emptyState}
        <CommentingStatusBlock>
          <CommentingStatusText preferredNames={preferredNames} />
        </CommentingStatusBlock>
      </EmptyWrapper>
    )
  }

  return (
    <Wrapper data-cy={`${dataCy}`} ref={ref}>
      {header}
      <PusherDowner />
      {threadables.map((threadable) => {
        const {id} = threadable
        return (
          <ThreadedItem
            allowedThreadables={allowedThreadables}
            viewer={viewer}
            key={id}
            threadable={threadable}
            discussion={discussion}
          />
        )
      })}
      <CommentingStatusText preferredNames={preferredNames} />
    </Wrapper>
  )
})

export default DiscussionThreadList
