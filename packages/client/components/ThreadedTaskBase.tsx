import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {ReactNode, useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {PALETTE} from '~/styles/paletteV3'
import {ThreadedTaskBase_discussion} from '~/__generated__/ThreadedTaskBase_discussion.graphql'
import {ThreadedTaskBase_task} from '~/__generated__/ThreadedTaskBase_task.graphql'
import {ThreadedTaskBase_viewer} from '~/__generated__/ThreadedTaskBase_viewer.graphql'
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
  task: ThreadedTaskBase_task
  children?: ReactNode
  discussion: ThreadedTaskBase_discussion
  isReply?: boolean // this comment is a reply & should be indented
  setReplyMention: SetReplyMention
  replyMention?: ReplyMention
  dataCy: string
  viewer: ThreadedTaskBase_viewer
}

const ThreadedTaskBase = (props: Props) => {
  const {
    allowedThreadables,
    children,
    discussion,
    setReplyMention,
    replyMention,
    task,
    dataCy,
    viewer
  } = props

  const {t} = useTranslation()

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
    <ThreadedItemWrapper
      data-cy={t('ThreadedTaskBase.DataCyWrapper', {
        dataCy
      })}
      isReply={isReply}
      ref={ref}
    >
      <ThreadedAvatarColumn isReply={isReply} picture={picture} />
      <BodyCol>
        <ThreadedItemHeaderDescription
          title={preferredName}
          subTitle={t('ThreadedTaskBase.AddedATask')}
        >
          <HeaderActions>
            <ThreadedReplyButton
              dataCy={t('ThreadedTaskBase.DataCy', {
                dataCy
              })}
              onReply={onReply}
            />
          </HeaderActions>
        </ThreadedItemHeaderDescription>
        <StyledNullableTask
          dataCy={t('ThreadedTaskBase.DataCy', {
            dataCy
          })}
          area='meeting'
          task={task}
        />
        {children}
        <ThreadedItemReply
          allowedThreadables={allowedThreadables}
          dataCy={t('ThreadedTaskBase.DataCyReply', {
            dataCy
          })}
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

export default createFragmentContainer(ThreadedTaskBase, {
  viewer: graphql`
    fragment ThreadedTaskBase_viewer on User {
      ...ThreadedItemReply_viewer
    }
  `,
  discussion: graphql`
    fragment ThreadedTaskBase_discussion on Discussion {
      ...ThreadedItemReply_discussion
      id
      replyingToCommentId
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
