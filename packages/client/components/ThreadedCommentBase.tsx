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
import useEventCallback from '../hooks/useEventCallback'
import {useTipTapCommentEditor} from '../hooks/useTipTapCommentEditor'
import {isEqualWhenSerialized} from '../shared/isEqualWhenSerialized'
import anonymousAvatar from '../styles/theme/images/anonymous-avatar.svg'
import deletedAvatar from '../styles/theme/images/deleted-avatar-placeholder.svg'
import {PARABOL_AI_USER_ID} from '../utils/constants'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import DiscussionThreadInput from './DiscussionThreadInput'
import {DiscussionThreadables} from './DiscussionThreadList'
import {TipTapEditor} from './promptResponse/TipTapEditor'
import ThreadedAvatarColumn from './ThreadedAvatarColumn'
import ThreadedCommentFooter from './ThreadedCommentFooter'
import ThreadedCommentHeader from './ThreadedCommentHeader'
import ThreadedItemWrapper from './ThreadedItemWrapper'

interface Props {
  allowedThreadables: DiscussionThreadables[]
  comment: ThreadedCommentBase_comment$key
  discussion: ThreadedCommentBase_discussion$key
  viewer: ThreadedCommentBase_viewer$key
  repliesList?: ReactNode
  getMaxSortOrder: () => number
}

const ThreadedCommentBase = (props: Props) => {
  const {
    allowedThreadables,
    comment: commentRef,
    discussion: discussionRef,
    viewer: viewerRef,
    repliesList,
    getMaxSortOrder
  } = props
  const viewer = useFragment(
    graphql`
      fragment ThreadedCommentBase_viewer on User {
        ...DiscussionThreadInput_viewer
        billingTier
      }
    `,
    viewerRef
  )
  const discussion = useFragment(
    graphql`
      fragment ThreadedCommentBase_discussion on Discussion {
        ...DiscussionThreadInput_discussion
        id
        meetingId
        teamId
        discussionTopicId
        replyingTo {
          id
        }
      }
    `,
    discussionRef
  )
  const comment = useFragment(
    graphql`
      fragment ThreadedCommentBase_comment on Comment {
        ...ThreadedCommentHeader_comment
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
      }
    `,
    commentRef
  )
  const isReply = !repliesList
  const {id: discussionId, meetingId, teamId, discussionTopicId, replyingTo} = discussion
  const {id: commentId, content, createdByUserNullable, isActive, reactjis} = comment
  const picture = isActive ? (createdByUserNullable?.picture ?? anonymousAvatar) : deletedAvatar
  const {submitMutation, submitting, onError, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()
  const onSubmit = useEventCallback(() => {
    if (submitting || isTempId(commentId) || !editor || editor.isEmpty) return
    editor.setEditable(false)
    const nextContentJSON = editor.getJSON()
    if (isEqualWhenSerialized(nextContentJSON, JSON.parse(content))) return
    submitMutation()
    UpdateCommentContentMutation(
      atmosphere,
      {commentId, content: JSON.stringify(nextContentJSON), meetingId},
      {onError, onCompleted}
    )
  })
  const onEscape = useEventCallback(() => {
    editor?.commands.setContent(JSON.parse(content))
    editor?.setEditable(false)
  })

  const {editor} = useTipTapCommentEditor(content, {
    readOnly: true,
    atmosphere,
    teamId,
    onEnter: onSubmit,
    onEscape
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
      store
        .getRoot()
        .getLinkedRecord('viewer')
        ?.getLinkedRecord('discussion', {id: discussionId})
        ?.setLinkedRecord(comment, 'replyingTo')
    })
  }

  if (!editor) return null
  return (
    <ThreadedItemWrapper isReply={isReply}>
      <ThreadedAvatarColumn isReply={isReply} picture={picture} />
      <div className='flex w-[calc(100%-56px)] flex-col pb-3'>
        <ThreadedCommentHeader
          comment={comment}
          editComment={editComment}
          meetingId={meetingId}
          onToggleReactji={onToggleReactji}
          onReply={onReply}
        />
        {isActive && (
          <div className='pr-4'>
            <TipTapEditor editor={editor} onBlur={onSubmit} />
          </div>
        )}
        {isActive && (
          <ThreadedCommentFooter
            reactjis={reactjis}
            onToggleReactji={onToggleReactji}
            onReply={onReply}
          />
        )}
        {repliesList}
        {replyingTo?.id === comment.id && (
          <DiscussionThreadInput
            allowedThreadables={allowedThreadables}
            isReply
            getMaxSortOrder={getMaxSortOrder}
            discussion={discussion}
            viewer={viewer}
          />
        )}
      </div>
    </ThreadedItemWrapper>
  )
}

export default ThreadedCommentBase
