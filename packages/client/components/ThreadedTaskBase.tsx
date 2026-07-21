import graphql from 'babel-plugin-relay/macro'
import {type ReactNode, useRef} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import type {ThreadedTaskBase_discussion$key} from '~/__generated__/ThreadedTaskBase_discussion.graphql'
import type {ThreadedTaskBase_task$key} from '~/__generated__/ThreadedTaskBase_task.graphql'
import type {ThreadedTaskBase_viewer$key} from '~/__generated__/ThreadedTaskBase_viewer.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import DiscussionThreadInput from './DiscussionThreadInput'
import type {DiscussionThreadables} from './DiscussionThreadList'
import NullableTask from './NullableTask/NullableTask'
import ThreadedAvatarColumn from './ThreadedAvatarColumn'
import ThreadedItemHeaderDescription from './ThreadedItemHeaderDescription'
import ThreadedItemWrapper from './ThreadedItemWrapper'
import ThreadedReplyButton from './ThreadedReplyButton'

interface Props {
  allowedThreadables: DiscussionThreadables[]
  task: ThreadedTaskBase_task$key
  repliesList?: ReactNode
  discussion: ThreadedTaskBase_discussion$key
  viewer: ThreadedTaskBase_viewer$key
  getMaxSortOrder: () => number
}

const ThreadedTaskBase = (props: Props) => {
  const {
    allowedThreadables,
    repliesList,
    getMaxSortOrder,
    discussion: discussionRef,
    task: taskRef,
    viewer: viewerRef
  } = props
  const viewer = useFragment(
    graphql`
      fragment ThreadedTaskBase_viewer on User {
        ...DiscussionThreadInput_viewer
      }
    `,
    viewerRef
  )
  const discussion = useFragment(
    graphql`
      fragment ThreadedTaskBase_discussion on Discussion {
        ...DiscussionThreadInput_discussion
        id
        replyingTo {
          id
        }
      }
    `,
    discussionRef
  )
  const task = useFragment(
    graphql`
      fragment ThreadedTaskBase_task on Task {
        ...NullableTask_task
        id
        content
        createdByUser {
          picture
          preferredName
        }
        threadParentId
      }
    `,
    taskRef
  )
  const {id: discussionId, replyingTo} = discussion
  const isReply = !repliesList
  const {id: taskId, createdByUser, threadParentId} = task
  const {picture, preferredName} = createdByUser
  const atmosphere = useAtmosphere()
  const ref = useRef<HTMLDivElement>(null)
  const ownerId = threadParentId || taskId
  const onReply = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const owner = store.get(ownerId)
      if (!owner) return
      store.get(discussionId)?.setLinkedRecord(owner, 'replyingTo')
    })
  }
  return (
    <ThreadedItemWrapper isReply={isReply} ref={ref}>
      <ThreadedAvatarColumn isReply={isReply} picture={picture} />
      <div className='flex w-full flex-col pb-2'>
        <ThreadedItemHeaderDescription title={preferredName} subTitle={'added a Task'}>
          <div className='pr-8 font-semibold text-fg-secondary'>
            <ThreadedReplyButton onReply={onReply} />
          </div>
        </ThreadedItemHeaderDescription>
        <div className='py-2'>
          <NullableTask className='max-w-[296px]' area='meeting' task={task} />
        </div>
        {repliesList}
        {replyingTo?.id === task.id && (
          <DiscussionThreadInput
            allowedThreadables={allowedThreadables}
            isReply
            discussion={discussion}
            viewer={viewer}
            getMaxSortOrder={getMaxSortOrder}
          />
        )}
      </div>
    </ThreadedItemWrapper>
  )
}

export default ThreadedTaskBase
