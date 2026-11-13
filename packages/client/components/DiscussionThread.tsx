import graphql from 'babel-plugin-relay/macro'
import {type CSSProperties, type ReactNode, type RefObject, useMemo, useRef, useState} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {useCoverable} from '~/hooks/useControlBarCovers'
import {MeetingControlBarEnum} from '~/types/constEnums'
import type {DiscussionThreadQuery} from '../__generated__/DiscussionThreadQuery.graphql'
import {cn} from '../ui/cn'
import getDiscussionThreadCounts from '../utils/getDiscussionThreadCounts'
import DiscussionThreadFilter, {type DiscussionThreadFilterValue} from './DiscussionThreadFilter'
import DiscussionThreadInput, {type TaskDraft} from './DiscussionThreadInput'
import DiscussionThreadList, {type DiscussionThreadables} from './DiscussionThreadList'
import {isLocalPoll} from './Poll/local/newPoll'

interface Props {
  meetingContentRef?: RefObject<HTMLDivElement | null>
  allowedThreadables: DiscussionThreadables[]
  width?: string
  queryRef: PreloadedQuery<DiscussionThreadQuery>
  header?: ReactNode
  emptyState?: ReactNode
  autoFocus?: boolean
}

const DiscussionThread = (props: Props) => {
  const {meetingContentRef, allowedThreadables, width, queryRef, header, emptyState, autoFocus} =
    props
  const {viewerId} = useAtmosphere()
  const isDrawer = !!width // hack to say this is in a poker meeting
  const ref = useRef<HTMLDivElement>(null)
  const data = usePreloadedQuery<DiscussionThreadQuery>(
    graphql`
      query DiscussionThreadQuery($discussionId: ID!) @raw_response_type {
        viewer {
          ...DiscussionThreadInput_viewer
          ...DiscussionThreadList_viewer
          discussion(id: $discussionId) {
            ...DiscussionThreadInput_discussion
            ...DiscussionThreadList_discussion
            id
            replyingTo {
              id
            }
            commentors {
              id
              preferredName
              __typename
            }
            thread(first: 1000) @connection(key: "DiscussionThread_thread") {
              edges {
                node {
                  id
                  __typename
                  threadSortOrder
                  discussionId
                  ... on Comment {
                    isActive
                    authorId: createdBy
                  }
                  replies {
                    __typename
                    ... on Comment {
                      isActive
                      authorId: createdBy
                    }
                  }
                  ...DiscussionThreadList_threadables
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  )
  const {viewer} = data
  const [filterChoice, setFilterChoice] = useState<{
    discussionId: string
    value: DiscussionThreadFilterValue
  } | null>(null)
  const [taskDraft, setTaskDraft] = useState<TaskDraft | null>(null)
  const isExpanded =
    useCoverable(
      'threads',
      ref,
      MeetingControlBarEnum.COVER_HEIGHT,
      meetingContentRef,
      undefined,
      isDrawer
    ) || allowedThreadables.length === 0
  const {discussion} = viewer
  const commentors = discussion?.commentors ?? []
  const commentorNames = useMemo(
    () => commentors.filter(({id}) => id !== viewerId).map(({preferredName}) => preferredName),
    [viewerId, discussion]
  )
  if (!discussion) {
    return <div>No discussion found!</div>
  }

  const {replyingTo, thread} = discussion
  const edges = thread?.edges ?? [] // should never happen, but Terry reported it in demo. likely relay error
  const threadables = edges.map(({node}) => node)
  const getMaxSortOrder = () => {
    return Math.max(0, ...threadables.map((threadable) => threadable.threadSortOrder || 0))
  }
  const isCreatingPoll = threadables.some(isLocalPoll)
  const counts = getDiscussionThreadCounts(threadables)
  const allowTasks = allowedThreadables.includes('task')
  const filter: DiscussionThreadFilterValue =
    allowTasks && filterChoice?.discussionId === discussion.id ? filterChoice.value : 'all'
  const changeFilter = (value: DiscussionThreadFilterValue) =>
    setFilterChoice({discussionId: discussion.id, value})
  const addTask = () => {
    changeFilter('all')
    setTaskDraft({discussionId: discussion.id, isOpen: true})
  }

  return (
    <div
      className={cn(
        // sidebar-left height offset = MeetingControlBarEnum.COVER_HEIGHT (68px)
        // no card of its own — the thread sits directly on the drawer well, like the other tabs
        'flex h-full w-(--discussion-thread-width) flex-col justify-between overflow-hidden',
        !isExpanded && 'sidebar-left:h-[calc(100%-68px)]'
      )}
      style={{'--discussion-thread-width': width || '100%'} as CSSProperties}
      ref={ref}
    >
      {allowTasks && (
        <DiscussionThreadFilter
          allCount={counts.all}
          taskCount={counts.tasks}
          peopleCommentCount={counts.isTaskNudge ? counts.peopleComments : null}
          value={filter}
          onChange={changeFilter}
        />
      )}
      <DiscussionThreadList
        filter={filter}
        hiddenCommentCount={counts.comments}
        onAddTask={addTask}
        onShowAll={() => changeFilter('all')}
        discussion={discussion}
        allowedThreadables={allowedThreadables}
        commentorNames={commentorNames}
        threadables={threadables}
        viewer={viewer}
        header={header}
        emptyState={emptyState}
      />
      <div className={cn(filter === 'tasks' && 'hidden')}>
        <DiscussionThreadInput
          allowedThreadables={allowedThreadables}
          isDisabled={!!replyingTo?.id}
          getMaxSortOrder={getMaxSortOrder}
          discussion={discussion}
          viewer={viewer}
          isCreatingPoll={isCreatingPoll}
          autoFocus={autoFocus}
          taskDraft={taskDraft}
          onTaskDraftChange={setTaskDraft}
        />
      </div>
    </div>
  )
}

export default DiscussionThread
