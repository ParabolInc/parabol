import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {ReactNode, useEffect, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import {DiscussionThreadList_discussion$key} from '~/__generated__/DiscussionThreadList_discussion.graphql'
import {DiscussionThreadList_threadables$key} from '~/__generated__/DiscussionThreadList_threadables.graphql'
import {DiscussionThreadList_viewer$key} from '~/__generated__/DiscussionThreadList_viewer.graphql'
import {RetroDiscussPhase_meeting$data} from '../__generated__/RetroDiscussPhase_meeting.graphql'
import {PALETTE} from '../styles/paletteV3'
import CommentingStatusText from './CommentingStatusText'
import LabelHeading from './LabelHeading/LabelHeading'
import ThreadedItem from './ThreadedItem'
import Transcription from './Transcription'

export const Header = styled(LabelHeading)({
  borderBottom: `1px solid ${PALETTE.SLATE_300}`,
  margin: '0 0 8px',
  padding: '12px',
  textTransform: 'none',
  width: '100%'
})

export type DiscussionThreadables = 'task' | 'comment' | 'poll'

interface Props {
  allowedThreadables: DiscussionThreadables[]
  discussion: DiscussionThreadList_discussion$key
  preferredNames: string[] | null
  threadables: DiscussionThreadList_threadables$key
  viewer: DiscussionThreadList_viewer$key
  header?: ReactNode
  emptyState?: ReactNode
  transcription?: RetroDiscussPhase_meeting$data['transcription']
  showTranscription?: boolean
}

const DiscussionThreadList = (props: Props) => {
  const {
    allowedThreadables,
    discussion: discussionRef,
    threadables: threadablesRef,
    preferredNames,
    viewer: viewerRef,
    header,
    transcription,
    emptyState,
    showTranscription
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
        threadParentId
        id
      }
    `,
    threadablesRef
  )
  const isEmpty = showTranscription
    ? !transcription || transcription.length === 0
    : threadables.length === 0

  // Scroll to the new message at bottom if the viewer is already at the bottom
  const listRef = useRef<HTMLDivElement>(null)
  const threadBottomRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const handleScroll = () => {
    const listEl = listRef.current
    if (!listEl) return
    const {scrollTop, scrollHeight, clientHeight} = listEl
    setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 20)
  }
  useEffect(() => {
    if (!isAtBottom) return
    threadBottomRef.current?.scrollIntoView({behavior: 'smooth'})
  }, [threadables])

  if (isEmpty && emptyState) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center overflow-auto'>
        {header}
        {emptyState}
        <div className='h-9 w-full'>
          <CommentingStatusText preferredNames={preferredNames} />
        </div>
      </div>
    )
  }
  return (
    <div ref={listRef} className='flex flex-1 flex-col overflow-auto' onScroll={handleScroll}>
      {header}
      {/* https://stackoverflow.com/questions/36130760/use-justify-content-flex-end-and-to-have-vertical-scrollbar */}
      <div className='mx-0 mt-0 mb-auto' />
      {showTranscription && transcription ? (
        <Transcription transcription={transcription} />
      ) : (
        threadables.map((threadable) => {
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
        })
      )}
      <div ref={threadBottomRef}></div>
      <CommentingStatusText preferredNames={preferredNames} />
    </div>
  )
}

export default DiscussionThreadList
