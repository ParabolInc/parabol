import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router-dom'
import NotificationAction from '~/components/NotificationAction'
import type {MeetingStageTimeLimitEnd_notification$key} from '../__generated__/MeetingStageTimeLimitEnd_notification.graphql'
import NotificationTemplate from './NotificationTemplate'

interface Props {
  notification: MeetingStageTimeLimitEnd_notification$key
}

const MeetingStageTimeLimitEnd = (props: Props) => {
  const {notification: notificationRef} = props
  const notification = useFragment(
    graphql`
      fragment MeetingStageTimeLimitEnd_notification on NotificationMeetingStageTimeLimitEnd {
        ...NotificationTemplate_notification
        id
        meeting {
          id
          name
          team {
            name
          }
        }
      }
    `,
    notificationRef
  )
  const navigate = useNavigate()
  const {meeting} = notification
  const {id: meetingId, name: meetingName, team} = meeting
  const {name: teamName} = team
  const goThere = () => {
    navigate(`/meet/${meetingId}`)
  }

  return (
    <NotificationTemplate
      message={`Your meeting ${meetingName} with ${teamName} is ready to move forward`}
      notification={notification}
      action={<NotificationAction label={'Go to meeting'} onClick={goThere} />}
    />
  )
}

export default MeetingStageTimeLimitEnd
