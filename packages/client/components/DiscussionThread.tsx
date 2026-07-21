import graphql from 'babel-plugin-relay/macro'
import {type CSSProperties, type ReactNode, type RefObject, useMemo, useRef} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {useCoverable} from '~/hooks/useControlBarCovers'
import {MeetingControlBarEnum} from '~/types/constEnums'
import type {DiscussionThreadQuery} from '../__generated__/DiscussionThreadQuery.graphql'
import {cn} from '../ui/cn'
import DiscussionThreadInput from './DiscussionThreadInput'
import DiscussionThreadList, {type DiscussionThreadables} from './DiscussionThreadList'
import {isLocalPoll} from './Poll/local/newPoll'

interface Props {
  meetingContentRef?: RefObject<HTMLDivElement>
  allowedThreadables: DiscussionThreadables[]
  width?: string
  queryRef: PreloadedQuery<DiscussionThreadQuery>
  header?: ReactNode
  emptyState?: ReactNode
}

const DiscussionThread = (props: Props) => {
  const {meetingContentRef, allowedThreadables, width, queryRef, header, emptyState} = props
  const {viewerId} = useAtmosphere()
  const isDrawer = !!width // hack to say this is in a poker meeting
  const ref = useRef<HTMLDivElement>(null)
  const data = usePreloadedQuery<DiscussionThreadQuery>(
    graphql`
      query DiscussionThreadQuery($discussionId: ID!) {
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
                  threadSortOrder
                  discussionId
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

  return (
    <div
      className={cn(
        // sidebar-left height offset = MeetingControlBarEnum.COVER_HEIGHT (68px); width = DiscussionThreadEnum.WIDTH (360px)
        'flex h-full sidebar-left:w-[360px] w-(--discussion-thread-width) flex-col justify-between overflow-hidden rounded bg-surface-card shadow-discussion-thread',
        !isExpanded && 'sidebar-left:h-[calc(100%-68px)]'
      )}
      style={{'--discussion-thread-width': width || '100%'} as CSSProperties}
      ref={ref}
    >
      <DiscussionThreadList
        discussion={discussion}
        allowedThreadables={allowedThreadables}
        commentorNames={commentorNames}
        threadables={threadables}
        viewer={viewer}
        header={header}
        emptyState={emptyState}
      />
      <DiscussionThreadInput
        allowedThreadables={allowedThreadables}
        isDisabled={!!replyingTo?.id}
        getMaxSortOrder={getMaxSortOrder}
        discussion={discussion}
        viewer={viewer}
        isCreatingPoll={isCreatingPoll}
      />
    </div>
  )
}

export default DiscussionThread
