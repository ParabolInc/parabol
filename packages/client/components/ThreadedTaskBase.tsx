import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {ReactNode, useRef} from 'react'
import {createFragmentContainer, commitLocalUpdate} from 'react-relay'
import {PALETTE} from 'styles/paletteV2'
import {AreaEnum} from 'types/graphql'
import {ThreadedTaskBase_task} from '__generated__/ThreadedTaskBase_task.graphql'
import NullableTask from './NullableTask/NullableTask'
import ThreadedAvatarColumn from './ThreadedAvatarColumn'
import ThreadedReplyButton from './ThreadedReplyButton'
import useAtmosphere from 'hooks/useAtmosphere'
import {ThreadedTaskBase_meeting} from '__generated__/ThreadedTaskBase_meeting.graphql'
import ThreadedItemReply from './ThreadedItemReply'
import ThreadedItemWrapper from './ThreadedItemWrapper'
import {SetReplyMention, ReplyMention} from './ThreadedItem'
import ThreadedItemHeaderDescription from './ThreadedItemHeaderDescription'

const BodyCol = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: 8,
  width: '100%'
})

const HeaderActions = styled('div')({
  color: PALETTE.TEXT_GRAY,
  fontWeight: 60,
  paddingRight: 32
})

const StyledNullableTask = styled(NullableTask)({
  //make the task assignee avatar line up with comment avatar above/below
  marginLeft: -12
})

interface Props {
  task: ThreadedTaskBase_task
  children?: ReactNode
  meeting: ThreadedTaskBase_meeting
  isReply?: boolean // this comment is a reply & should be indented
  reflectionGroupId: string
  setReplyMention: SetReplyMention
  replyMention?: ReplyMention
}

const ThreadedTaskBase = (props: Props) => {
  const {children, meeting, reflectionGroupId, setReplyMention, replyMention, task} = props
  const isReply = !!props.isReply
  const {id: meetingId} = meeting
  const {id: taskId, createdByUser, threadParentId} = task
  const {picture, preferredName} = createdByUser
  const atmosphere = useAtmosphere()
  const ref = useRef<HTMLDivElement>(null)
  const replyEditorRef = useRef<HTMLTextAreaElement>(null)
  const ownerId = threadParentId || taskId
  const onReply = () => {
    commitLocalUpdate(atmosphere, (store) => {
      store.get(meetingId)?.setValue(ownerId, 'replyingToCommentId')
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
        <StyledNullableTask area={AreaEnum.meeting} task={task} />
        {children}
        <ThreadedItemReply
          reflectionGroupId={reflectionGroupId}
          meeting={meeting}
          threadable={task}
          editorRef={replyEditorRef}
          replyMention={replyMention}
          setReplyMention={setReplyMention}
        />
      </BodyCol>
    </ThreadedItemWrapper>
  )
}

export default createFragmentContainer(ThreadedTaskBase, {
  meeting: graphql`
    fragment ThreadedTaskBase_meeting on RetrospectiveMeeting {
      ...ThreadedItemReply_meeting
      id
    }
  `,
  task: graphql`
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
  `
})
