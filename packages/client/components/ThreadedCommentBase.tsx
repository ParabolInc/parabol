import graphql from 'babel-plugin-relay/macro'
import {ReactNode, useEffect} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import {ThreadedCommentBase_comment$key} from '~/__generated__/ThreadedCommentBase_comment.graphql'
import {ThreadedCommentBase_discussion$key} from '~/__generated__/ThreadedCommentBase_discussion.graphql'
import {ThreadedCommentBase_viewer$key} from '~/__generated__/ThreadedCommentBase_viewer.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import AddReactjiToReactableMutation from '~/mutations/AddReactjiToReactableMutation'
import UpdateCommentContentMutation from '~/mutations/UpdateCommentContentMutation'
import isTempId from '~/utils/relay/isTempId'
import {useTipTapCommentEditor} from '../hooks/useTipTapCommentEditor'
import anonymousAvatar from '../styles/theme/images/anonymous-avatar.svg'
import deletedAvatar from '../styles/theme/images/deleted-avatar-placeholder.svg'
import {PARABOL_AI_USER_ID} from '../utils/constants'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import {DiscussionThreadables} from './DiscussionThreadList'
import {TipTapEditor} from './promptResponse/TipTapEditor'
import ThreadedAvatarColumn from './ThreadedAvatarColumn'
import ThreadedCommentFooter from './ThreadedCommentFooter'
import ThreadedCommentHeader from './ThreadedCommentHeader'
import ThreadedItemReply from './ThreadedItemReply'
import ThreadedItemWrapper from './ThreadedItemWrapper'

interface Props {
  allowedThreadables: DiscussionThreadables[]
  comment: ThreadedCommentBase_comment$key
  children?: ReactNode // the replies, listed here to avoid a circular reference
  discussion: ThreadedCommentBase_discussion$key
  isReply?: boolean // this comment is a reply & should be indented

  viewer: ThreadedCommentBase_viewer$key
}

const ThreadedCommentBase = (props: Props) => {
  const {
    allowedThreadables,
    children,
    comment: commentRef,
    discussion: discussionRef,
    viewer: viewerRef
  } = props
  const viewer = useFragment(
    graphql`
      fragment ThreadedCommentBase_viewer on User {
        ...ThreadedItemReply_viewer
        billingTier
      }
    `,
    viewerRef
  )
  const discussion = useFragment(
    graphql`
      fragment ThreadedCommentBase_discussion on Discussion {
        ...DiscussionThreadInput_discussion
        ...ThreadedItemReply_discussion
        id
        meetingId
        teamId
        discussionTopicId
      }
    `,
    discussionRef
  )
  const comment = useFragment(
    graphql`
      fragment ThreadedCommentBase_comment on Comment {
        ...ThreadedCommentHeader_comment
        ...ThreadedItemReply_threadable
        id
        isActive
        content
        createdByUserNullable: createdByUser {
          id
          preferredName
          picture
        }
        reactjis {
          ...ThreadedCommentFooter_reactjis
          id
          isViewerReactji
        }
        threadParentId
      }
    `,
    commentRef
  )
  const isReply = !!props.isReply
  const {id: discussionId, meetingId, teamId, discussionTopicId} = discussion
  const {
    id: commentId,
    content,
    createdByUserNullable,
    isActive,
    reactjis,
    threadParentId
  } = comment
  const picture = isActive ? (createdByUserNullable?.picture ?? anonymousAvatar) : deletedAvatar
  const {submitMutation, submitting, onError, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()
  const {editor, setLinkState, linkState} = useTipTapCommentEditor(content, {
    readOnly: true,
    atmosphere,
    teamId
  })
  const editComment = () => {
    if (!editor) return
    editor.setEditable(true)
    editor.commands.focus()
  }

  useEffect(() => {
    if (createdByUserNullable?.id === PARABOL_AI_USER_ID) {
      SendClientSideEvent(atmosphere, 'AI Summary Viewed', {
        source: 'Discussion',
        tier: viewer.billingTier,
        meetingId,
        discussionTopicId
      })
    }
  }, [])

  const onToggleReactji = (emojiId: string) => {
    if (submitting) return
    const isRemove = !!reactjis.find((reactji) => {
      return reactji.isViewerReactji && reactji.id.split(':')[1] === emojiId
    })
    submitMutation()
    AddReactjiToReactableMutation(
      atmosphere,
      {
        reactableType: 'COMMENT',
        reactableId: commentId,
        isRemove,
        reactji: emojiId,
        meetingId
      },
      {onCompleted, onError}
    )
  }

  const onReply = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const comment = store.get(commentId)
      if (!comment) return
      comment.setValue(threadParentId, 'threadParentId')
      store
        .getRoot()
        .getLinkedRecord('viewer')
        ?.getLinkedRecord('discussion', {id: discussionId})
        ?.setLinkedRecord(comment, 'replyingTo')
    })
  }

  const onSubmit = () => {
    if (submitting || isTempId(commentId) || !editor || editor.isEmpty) return
    editor.setEditable(false)
    const nextContent = JSON.stringify(editor.getJSON())
    if (content === nextContent) return
    submitMutation()
    UpdateCommentContentMutation(
      atmosphere,
      {commentId, content: nextContent, meetingId},
      {onError, onCompleted}
    )
  }
  if (!editor) return null
  return (
    <ThreadedItemWrapper isReply={isReply}>
      <ThreadedAvatarColumn isReply={isReply} picture={picture} />
      <div className='flex w-[calc(100%-56px)] flex-col pb-2'>
        <ThreadedCommentHeader
          comment={comment}
          editComment={editComment}
          meetingId={meetingId}
          onToggleReactji={onToggleReactji}
          onReply={onReply}
        />
        {isActive && (
          <div className='pr-4'>
            <TipTapEditor
              editor={editor}
              setLinkState={setLinkState}
              linkState={linkState}
              onBlur={onSubmit}
            />
          </div>
        )}
        {isActive && (
          <ThreadedCommentFooter
            reactjis={reactjis}
            onToggleReactji={onToggleReactji}
            onReply={onReply}
          />
        )}
        {children}
        <ThreadedItemReply
          allowedThreadables={allowedThreadables}
          discussion={discussion}
          threadable={comment}
          viewer={viewer}
        />
      </div>
    </ThreadedItemWrapper>
  )
}

export default ThreadedCommentBase
