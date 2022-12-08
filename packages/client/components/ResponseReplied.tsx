import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {Editor} from 'draft-js'
import React from 'react'
import {useFragment} from 'react-relay'
import NotificationAction from '~/components/NotificationAction'
import useEditorState from '../hooks/useEditorState'
import useRouter from '../hooks/useRouter'
import {cardShadow} from '../styles/elevation'
import {ResponseReplied_notification$key} from '../__generated__/ResponseReplied_notification.graphql'
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
  notification: ResponseReplied_notification$key
}

const ResponseReplied = (props: Props) => {
  const {notification: notificationRef} = props
  const notification = useFragment(
    graphql`
      fragment ResponseReplied_notification on NotifyResponseReplied {
        ...NotificationTemplate_notification
        author {
          picture
          preferredName
        }
        meeting {
          id
          name
        }
        comment {
          content
        }
      }
    `,
    notificationRef
  )
  const {history} = useRouter()
  const {meeting, author, comment} = notification
  const {picture: authorPicture, preferredName: authorName} = author

  const {id: meetingId, name: meetingName} = meeting
  const goThere = () => {
    // :TODO: (jmtaber129): Link directly to card once we support that.
    history.push(`/meet/${meetingId}`)
  }

  const [editorState] = useEditorState(comment.content)

  return (
    <NotificationTemplate
      avatar={authorPicture}
      message={`${authorName} replied to your response in ${meetingName}.`}
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

export default ResponseReplied
