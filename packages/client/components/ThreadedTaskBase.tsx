import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {ReactNode, useRef} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {PALETTE} from '~/styles/paletteV3'
import {ThreadedTaskBase_discussion$key} from '~/__generated__/ThreadedTaskBase_discussion.graphql'
import {ThreadedTaskBase_task$key} from '~/__generated__/ThreadedTaskBase_task.graphql'
import {ThreadedTaskBase_viewer$key} from '~/__generated__/ThreadedTaskBase_viewer.graphql'
import {DiscussionThreadables} from './DiscussionThreadList'
import NullableTask from './NullableTask/NullableTask'
import ThreadedAvatarColumn from './ThreadedAvatarColumn'
import {ReplyMention, SetReplyMention} from './ThreadedItem'
import ThreadedItemHeaderDescription from './ThreadedItemHeaderDescription'
import ThreadedItemReply from './ThreadedItemReply'
import ThreadedItemWrapper from './ThreadedItemWrapper'
import ThreadedReplyButton from './ThreadedReplyButton'
import useFocusedReply from './useFocusedReply'

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

const StyledNullableTask = styled(NullableTask)({})

interface Props {
  allowedThreadables: DiscussionThreadables[]
  task: ThreadedTaskBase_task$key
  children?: ReactNode
  discussion: ThreadedTaskBase_discussion$key
  isReply?: boolean // this comment is a reply & should be indented
  setReplyMention: SetReplyMention
  replyMention?: ReplyMention
  dataCy: string
  viewer: ThreadedTaskBase_viewer$key
}

const ThreadedTaskBase = (props: Props) => {
  const {
    allowedThreadables,
    children,
    discussion: discussionRef,
    setReplyMention,
    replyMention,
    task: taskRef,
    dataCy,
    viewer: viewerRef
  } = props
  const viewer = useFragment(
    graphql`
      fragment ThreadedTaskBase_viewer on User {
        ...ThreadedItemReply_viewer
      }
    `,
    viewerRef
  )
  const discussion = useFragment(
    graphql`
      fragment ThreadedTaskBase_discussion on Discussion {
        ...ThreadedItemReply_discussion
        id
        replyingToCommentId
      }
    `,
    discussionRef
  )
  const task = useFragment(
    graphql`
      fragment ThreadedTaskBase_task on Task {
        ...NullableTask_task
        ...ThreadedItemReply_threadable
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
  const isReply = !!props.isReply
  const {id: discussionId, replyingToCommentId} = discussion
  const {id: taskId, createdByUser, threadParentId} = task
  const {picture, preferredName} = createdByUser
  const atmosphere = useAtmosphere()
  const ref = useRef<HTMLDivElement>(null)
  const replyEditorRef = useRef<HTMLTextAreaElement>(null)
  const ownerId = threadParentId || taskId
  const onReply = () => {
    commitLocalUpdate(atmosphere, (store) => {
      store.get(discussionId)?.setValue(ownerId, 'replyingToCommentId')
    })
  }
  useFocusedReply(ownerId, replyingToCommentId, ref, replyEditorRef)
  return (
    <ThreadedItemWrapper data-cy={`${dataCy}-wrapper`} isReply={isReply} ref={ref}>
      <ThreadedAvatarColumn isReply={isReply} picture={picture} />
      <BodyCol>
        <ThreadedItemHeaderDescription title={preferredName} subTitle={'added a Task'}>
          <HeaderActions>
            <ThreadedReplyButton dataCy={`${dataCy}`} onReply={onReply} />
          </HeaderActions>
        </ThreadedItemHeaderDescription>
        <StyledNullableTask dataCy={`${dataCy}`} area='meeting' task={task} />
        {children}
        <ThreadedItemReply
          allowedThreadables={allowedThreadables}
          dataCy={`${dataCy}-reply`}
          discussion={discussion}
          threadable={task}
          editorRef={replyEditorRef}
          replyMention={replyMention}
          setReplyMention={setReplyMention}
          viewer={viewer}
        />
      </BodyCol>
    </ThreadedItemWrapper>
  )
}

export default ThreadedTaskBase
