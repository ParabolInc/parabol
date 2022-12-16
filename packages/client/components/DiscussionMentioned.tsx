import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {Editor} from 'draft-js'
import React from 'react'
import {useFragment} from 'react-relay'
import NotificationAction from '~/components/NotificationAction'
import useEditorState from '../hooks/useEditorState'
import useRouter from '../hooks/useRouter'
import {cardShadow} from '../styles/elevation'
import fromStageIdToUrl from '../utils/meetings/fromStageIdToUrl'
import {DiscussionMentioned_notification$key} from '../__generated__/DiscussionMentioned_notification.graphql'
import NotificationTemplate from './NotificationTemplate'

const EditorWrapper = styled('div')({
  backgroundColor: '#fff',
  borderRadius: 4,
  boxShadow: cardShadow,
  fontSize: 14,
  lineHeight: '20px',
  margin: '4px 0 0',
  padding: 8
})

interface Props {
  notification: DiscussionMentioned_notification$key
}

const DiscussionMentioned = (props: Props) => {
  const {notification: notificationRef} = props
  const notification = useFragment(
    graphql`
      fragment DiscussionMentioned_notification on NotifyDiscussionMentioned {
        ...NotificationTemplate_notification
        author {
          picture
          preferredName
        }
        meeting {
          id
          name
          facilitatorStageId
          ...fromStageIdToUrl_meeting
        }
        comment {
          content
        }
        discussion {
          stage {
            __typename
            id
            ... on TeamPromptResponseStage {
              response {
                id
              }
            }
          }
        }
      }
    `,
    notificationRef
  )
  const {history} = useRouter()
  const {meeting, author, comment, discussion} = notification
  const {picture: authorPicture, preferredName: authorName} = author
  const {stage} = discussion
  const {id: stageId, response} = stage ?? {}
  const {id: meetingId, name: meetingName, facilitatorStageId} = meeting

  const directUrl = stageId
    ? fromStageIdToUrl(stageId, meeting, facilitatorStageId)
    : `/meet/${meetingId}`

  const goThere = () => {
    history.push(
      response ? `${directUrl}?responseId=${encodeURIComponent(response.id)}` : directUrl
    )
  }

  const [editorState] = useEditorState(comment.content)

  return (
    <NotificationTemplate
      avatar={authorPicture}
      message={`${authorName} mentioned you in a discussion in ${meetingName}.`}
      notification={notification}
      action={<NotificationAction label={'See the discussion'} onClick={goThere} />}
    >
      <EditorWrapper>
        <Editor
          readOnly
          editorState={editorState}
          onChange={() => {
            /*noop*/
          }}
        />
      </EditorWrapper>
    </NotificationTemplate>
  )
}

export default DiscussionMentioned
