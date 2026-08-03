import graphql from 'babel-plugin-relay/macro'
import {type ComponentProps, type ReactNode, useEffect, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import type {DiscussionThreadList_discussion$key} from '~/__generated__/DiscussionThreadList_discussion.graphql'
import type {DiscussionThreadList_threadables$key} from '~/__generated__/DiscussionThreadList_threadables.graphql'
import type {DiscussionThreadList_viewer$key} from '~/__generated__/DiscussionThreadList_viewer.graphql'
import {cn} from '../ui/cn'
import CommentingStatusText from './CommentingStatusText'
import LabelHeading from './LabelHeading/LabelHeading'
import ThreadedItem from './ThreadedItem'

export const Header = ({className, ...rest}: ComponentProps<typeof LabelHeading>) => (
  <LabelHeading
    {...rest}
    className={cn('m-0 mb-2 w-full border-hairline border-b p-3 normal-case', className)}
  />
)

export type DiscussionThreadables = 'task' | 'comment' | 'poll'

interface Props {
  allowedThreadables: DiscussionThreadables[]
  discussion: DiscussionThreadList_discussion$key
  commentorNames: string[] | null
  threadables: DiscussionThreadList_threadables$key
  viewer: DiscussionThreadList_viewer$key
  header?: ReactNode
  emptyState?: ReactNode
}

const DiscussionThreadList = (props: Props) => {
  const {
    allowedThreadables,
    discussion: discussionRef,
    threadables: threadablesRef,
    commentorNames,
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
        threadParentId
        id
      }
    `,
    threadablesRef
  )
  const isEmpty = threadables.length === 0

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
          <CommentingStatusText commentorNames={commentorNames} />
        </div>
      </div>
    )
  }
  return (
    <div ref={listRef} className='flex flex-1 flex-col overflow-auto' onScroll={handleScroll}>
      {header}
      {/* https://stackoverflow.com/questions/36130760/use-justify-content-flex-end-and-to-have-vertical-scrollbar */}
      <div className='mx-0 mt-0 mb-auto' />
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
      <div ref={threadBottomRef}></div>
      <CommentingStatusText commentorNames={commentorNames} />
    </div>
  )
}

export default DiscussionThreadList
