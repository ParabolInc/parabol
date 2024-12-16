import {generateHTML} from '@tiptap/html'
import graphql from 'babel-plugin-relay/macro'
import {EmailResponseReplied_notification$key} from 'parabol-client/__generated__/EmailResponseReplied_notification.graphql'
import {useFragment} from 'react-relay'
import {serverTipTapExtensions} from '../../../../shared/tiptap/serverTipTapExtensions'
import {cardShadow} from '../../../../styles/elevation'
import {PALETTE} from '../../../../styles/paletteV3'
import anonymousAvatar from '../../../../styles/theme/images/anonymous-avatar.png'
import {FONT_FAMILY} from '../../../../styles/typographyV2'
import makeAppURL from '../../../../utils/makeAppURL'
import {notificationSummaryUrlParams} from '../NotificationSummaryEmail'
import EmailNotificationTemplate from './EmailNotificationTemplate'

const editorStyles = {
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
  notificationRef: EmailResponseReplied_notification$key
  appOrigin: string
}

const EmailResponseReplied = (props: Props) => {
  const {notificationRef, appOrigin} = props
  const notification = useFragment(
    graphql`
      fragment EmailResponseReplied_notification on NotifyResponseReplied {
        ...EmailNotificationTemplate_notification
        author {
          rasterPicture
          preferredName
        }
        response {
          id
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
  const {meeting, author, comment, response} = notification
  const authorPicture = author ? author.rasterPicture : anonymousAvatar
  const authorName = author ? author.preferredName : 'Anonymous'

  const {id: meetingId, name: meetingName} = meeting

  // :TRICKY: If the URL we navigate to isn't the full URL w/ phase name (e.g. just
  // '/meet/<meetingId>'), the URL will be overwritten and the 'responseId' will be lost.
  const linkUrl = makeAppURL(appOrigin, `/meet/${meetingId}/responses`, {
    searchParams: {
      ...notificationSummaryUrlParams,
      responseId: response.id
    }
  })

  const htmlContent = generateHTML(JSON.parse(comment.content), serverTipTapExtensions)

  return (
    <EmailNotificationTemplate
      avatar={authorPicture}
      message={`${authorName} replied to your response in ${meetingName}.`}
      notificationRef={notification}
      linkLabel={'See their response'}
      linkUrl={linkUrl}
    >
      <div style={editorStyles}>
        <div dangerouslySetInnerHTML={{__html: htmlContent}}></div>
      </div>
    </EmailNotificationTemplate>
  )
}

export default EmailResponseReplied
