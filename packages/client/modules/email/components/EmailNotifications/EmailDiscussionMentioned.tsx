import graphql from 'babel-plugin-relay/macro'
import {convertFromRaw, Editor, EditorState} from 'draft-js'
import editorDecorators from 'parabol-client/components/TaskEditor/decorators'
import {EmailDiscussionMentioned_notification$key} from 'parabol-client/__generated__/EmailDiscussionMentioned_notification.graphql'
import React, {useMemo, useRef} from 'react'
import {useFragment} from 'react-relay'
import {cardShadow} from '../../../../styles/elevation'
import {PALETTE} from '../../../../styles/paletteV3'
import {FONT_FAMILY} from '../../../../styles/typographyV2'
import makeAppURL from '../../../../utils/makeAppURL'
import fromStageIdToUrl from '../../../../utils/meetings/fromStageIdToUrl'
import {notificationSummaryUrlParams} from '../NotificationSummaryEmail'
import EmailNotificationTemplate from './EmailNotificationTemplate'

const editorStyles: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderColor: PALETTE.SLATE_400,
  borderRadius: '4px',
  borderStyle: 'solid',
  borderWidth: '1px',
  color: PALETTE.SLATE_700,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: '14px',
  boxShadow: cardShadow,
  lineHeight: '20px',
  margin: '4px 0 0',
  padding: 8
}

interface Props {
  notificationRef: EmailDiscussionMentioned_notification$key
  appOrigin: string
}

const EmailDiscussionMentioned = (props: Props) => {
  const {notificationRef, appOrigin} = props
  const notification = useFragment(
    graphql`
      fragment EmailDiscussionMentioned_notification on NotifyDiscussionMentioned {
        ...EmailNotificationTemplate_notification
        author {
          rasterPicture
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
  const {meeting, author, comment, discussion} = notification
  const {rasterPicture: authorPicture, preferredName: authorName} = author
  const {stage} = discussion
  const {id: meetingId, name: meetingName, facilitatorStageId} = meeting
  const {id: stageId, response} = stage ?? {}

  const directUrl = stageId ? fromStageIdToUrl(stageId, meeting) : `/meet/${meetingId}`

  const searchParams = response?.id
    ? {
        ...notificationSummaryUrlParams,
        responseId: response?.id
      }
    : notificationSummaryUrlParams

  const linkUrl = makeAppURL(appOrigin, directUrl, {
    searchParams
  })

  const contentState = useMemo(() => convertFromRaw(JSON.parse(comment.content)), [comment.content])
  const editorStateRef = useRef<EditorState>()
  const getEditorState = () => {
    return editorStateRef.current
  }
  editorStateRef.current = EditorState.createWithContent(
    contentState,
    editorDecorators(getEditorState)
  )

  return (
    <EmailNotificationTemplate
      avatar={authorPicture}
      message={`${authorName} mentioned you in a discussion in ${meetingName}.`}
      notificationRef={notification}
      linkLabel={'See the discussion'}
      linkUrl={linkUrl}
    >
      <div style={editorStyles}>
        <Editor
          readOnly
          editorState={editorStateRef.current}
          onChange={() => {
            /**/
          }}
        />
      </div>
    </EmailNotificationTemplate>
  )
}

export default EmailDiscussionMentioned
