import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {convertToRaw, EditorState, SelectionState} from 'draft-js'
import useAtmosphere from 'hooks/useAtmosphere'
import useEditorState from 'hooks/useEditorState'
import useMutationProps from 'hooks/useMutationProps'
import AddReactjiToReactableMutation from 'mutations/AddReactjiToReactableMutation'
import UpdateCommentContentMutation from 'mutations/UpdateCommentContentMutation'
import React, {useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import {ReactableEnum} from 'types/graphql'
import convertToTaskContent from 'utils/draftjs/convertToTaskContent'
import isAndroid from 'utils/draftjs/isAndroid'
import isTempId from 'utils/relay/isTempId'
import {ThreadedComment_comment} from '__generated__/ThreadedComment_comment.graphql'
import {ThreadedComment_meeting} from '__generated__/ThreadedComment_meeting.graphql'
import anonymousAvatar from '../styles/theme/images/anonymous-avatar.svg'
import CommentEditor from './TaskEditor/CommentEditor'
import ThreadedAvatarColumn from './ThreadedAvatarColumn'
import ThreadedCommentFooter from './ThreadedCommentFooter'
import ThreadedCommentHeader from './ThreadedCommentHeader'
import ThreadedCommentReply from './ThreadedCommentReply'
import ThreadedRepliesList from './ThreadedRepliesList'
import {ThreadedReplyComment_comment} from '__generated__/ThreadedReplyComment_comment.graphql'
import {ThreadedReplyComment_meeting} from '__generated__/ThreadedReplyComment_meeting.graphql'
import ThreadedCommentBase from './ThreadedCommentBase'

const Wrapper = styled('div')(({isReply}) => ({
  display: 'flex',
  paddingLeft: isReply ? 16 : undefined,
  width: '100%'
}))

const BodyCol = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: 8,
  width: '100%'
})

interface Props {
  comment: ThreadedComment_comment
  meeting: ThreadedComment_meeting
  isReplying: boolean // the replying input is currently open
  reflectionGroupId: string
  setReplyingToComment: (commentId: string) => void
}

export const ThreadedComment = (props: Props) => {
  const {comment, reflectionGroupId, isReplying, setReplyingToComment, meeting} = props
  const {replies} = comment
  return (
    <ThreadedCommentBase
      comment={comment}
      meeting={meeting}
      isReplying={isReplying}
      reflectionGroupId={reflectionGroupId}
      setReplyingToComment={setReplyingToComment}
    >
      <ThreadedRepliesList
        meeting={meeting}
        replies={replies}
        reflectionGroupId={reflectionGroupId}
      />
    </ThreadedCommentBase>
  )
}

export default createFragmentContainer(ThreadedComment, {
  meeting: graphql`
    fragment ThreadedComment_meeting on RetrospectiveMeeting {
      ...ThreadedCommentBase_meeting
      ...ThreadedRepliesList_meeting
    }
  `,
  comment: graphql`
    fragment ThreadedComment_comment on Comment {
      ...ThreadedCommentBase_comment
      replies {
        ...ThreadedRepliesList_replies
      }
    }
  `
})
