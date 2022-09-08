import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import {ThreadedRepliesList_discussion} from '~/__generated__/ThreadedRepliesList_discussion.graphql'
import {ThreadedRepliesList_replies} from '~/__generated__/ThreadedRepliesList_replies.graphql'
import {ThreadedRepliesList_viewer} from '~/__generated__/ThreadedRepliesList_viewer.graphql'
import {DiscussionThreadables} from './DiscussionThreadList'
import ThreadedCommentBase from './ThreadedCommentBase'
import {SetReplyMention} from './ThreadedItem'
import ThreadedTaskBase from './ThreadedTaskBase'

interface Props {
  allowedThreadables: DiscussionThreadables[]
  discussion: ThreadedRepliesList_discussion
  replies: ThreadedRepliesList_replies
  setReplyMention: SetReplyMention
  dataCy: string
  viewer: ThreadedRepliesList_viewer
}

const ThreadedRepliesList = (props: Props) => {
  const {allowedThreadables, replies, setReplyMention, discussion, dataCy, viewer} = props

  const {t} = useTranslation()

  // https://sentry.io/organizations/parabol/issues/1569570376/?project=107196&query=is%3Aunresolved
  // not sure why this is required addComment and createTask but request replies
  if (!replies) return null
  return (
    <>
      {replies.map((reply) => {
        const {__typename, id} = reply
        return __typename === t('ThreadedRepliesList.Task') ? (
          <ThreadedTaskBase
            allowedThreadables={allowedThreadables}
            dataCy={t('ThreadedRepliesList.DataCyTask', {
              dataCy
            })}
            key={id}
            isReply
            task={reply}
            discussion={discussion}
            setReplyMention={setReplyMention}
            viewer={viewer}
          />
        ) : (
          <ThreadedCommentBase
            allowedThreadables={allowedThreadables}
            dataCy={t('ThreadedRepliesList.DataCyComment', {
              dataCy
            })}
            key={id}
            isReply
            comment={reply}
            discussion={discussion}
            setReplyMention={setReplyMention}
            viewer={viewer}
          />
        )
      })}
    </>
  )
}

export default createFragmentContainer(ThreadedRepliesList, {
  viewer: graphql`
    fragment ThreadedRepliesList_viewer on User {
      ...ThreadedCommentBase_viewer
      ...ThreadedTaskBase_viewer
    }
  `,
  discussion: graphql`
    fragment ThreadedRepliesList_discussion on Discussion {
      ...ThreadedCommentBase_discussion
      ...ThreadedTaskBase_discussion
    }
  `,
  replies: graphql`
    fragment ThreadedRepliesList_replies on Threadable @relay(plural: true) {
      ...ThreadedTaskBase_task
      ...ThreadedCommentBase_comment
      __typename
      id
    }
  `
})
