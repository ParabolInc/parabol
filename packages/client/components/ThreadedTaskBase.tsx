import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {ReactNode, useRef} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import {ThreadedTaskBase_discussion$key} from '~/__generated__/ThreadedTaskBase_discussion.graphql'
import {ThreadedTaskBase_task$key} from '~/__generated__/ThreadedTaskBase_task.graphql'
import {ThreadedTaskBase_viewer$key} from '~/__generated__/ThreadedTaskBase_viewer.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import {PALETTE} from '~/styles/paletteV3'
import DiscussionThreadInput from './DiscussionThreadInput'
import {DiscussionThreadables} from './DiscussionThreadList'
import NullableTask from './NullableTask/NullableTask'
import ThreadedAvatarColumn from './ThreadedAvatarColumn'
import ThreadedItemHeaderDescription from './ThreadedItemHeaderDescription'
import ThreadedItemWrapper from './ThreadedItemWrapper'
import ThreadedReplyButton from './ThreadedReplyButton'

const BodyCol = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: 8,
  width: '100%'
})

const HeaderActions = styled('div')({
  color: PALETTE.SLATE_600,
  fontWeight: 60,
  paddingRight: 32
})

const StyledNullableTask = styled(NullableTask)({
  maxWidth: 296
})

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
      <BodyCol>
        <ThreadedItemHeaderDescription title={preferredName} subTitle={'added a Task'}>
          <HeaderActions>
            <ThreadedReplyButton onReply={onReply} />
          </HeaderActions>
        </ThreadedItemHeaderDescription>
        <div className='py-2'>
          <StyledNullableTask area='meeting' task={task} />
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
      </BodyCol>
    </ThreadedItemWrapper>
  )
}

export default ThreadedTaskBase
