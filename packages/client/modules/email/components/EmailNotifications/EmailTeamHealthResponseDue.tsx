import graphql from 'babel-plugin-relay/macro'
import dayjs from 'dayjs'
import type {EmailTeamHealthResponseDue_notification$key} from 'parabol-client/__generated__/EmailTeamHealthResponseDue_notification.graphql'
import {useFragment} from 'react-relay'
import makeAppURL from '../../../../utils/makeAppURL'
import {notificationSummaryUrlParams} from '../NotificationSummaryEmail'
import EmailNotificationTemplate from './EmailNotificationTemplate'

interface Props {
  notificationRef: EmailTeamHealthResponseDue_notification$key
  appOrigin: string
}

const EmailTeamHealthResponseDue = (props: Props) => {
  const {notificationRef, appOrigin} = props
  const notification = useFragment(
    graphql`
      fragment EmailTeamHealthResponseDue_notification on NotifyTeamHealthResponseDue {
        ...EmailNotificationTemplate_notification
        id
        meeting {
          id
          name
          scheduledEndTime
          team {
            name
          }
        }
      }
    `,
    notificationRef
  )
  const {meeting} = notification
  const {id: meetingId, name: meetingName, scheduledEndTime, team} = meeting
  const closesAt = scheduledEndTime ? dayjs(scheduledEndTime).format('ddd h:mm A') : 'soon'

  const linkUrl = makeAppURL(appOrigin, `/meet/${meetingId}`, {
    searchParams: notificationSummaryUrlParams
  })

  return (
    <EmailNotificationTemplate
      message={`${meetingName} for ${team.name} closes ${closesAt}. Share your responses before the results are revealed.`}
      notificationRef={notification}
      linkLabel={'Share your responses'}
      linkUrl={linkUrl}
    />
  )
}

export default EmailTeamHealthResponseDue
