import graphql from 'babel-plugin-relay/macro'
import dayjs from 'dayjs'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import NotificationAction from '~/components/NotificationAction'
import type {TeamHealthResponseDue_notification$key} from '../__generated__/TeamHealthResponseDue_notification.graphql'
import NotificationTemplate from './NotificationTemplate'

interface Props {
  notification: TeamHealthResponseDue_notification$key
}

const TeamHealthResponseDue = (props: Props) => {
  const {notification: notificationRef} = props
  const notification = useFragment(
    graphql`
      fragment TeamHealthResponseDue_notification on NotifyTeamHealthResponseDue {
        ...NotificationTemplate_notification
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
  const navigate = useNavigate()
  const {meeting} = notification
  const {id: meetingId, name: meetingName, scheduledEndTime, team} = meeting
  const closesAt = scheduledEndTime ? dayjs(scheduledEndTime).format('ddd h:mm A') : 'soon'
  const goThere = () => {
    navigate(`/meet/${meetingId}`)
  }

  return (
    <NotificationTemplate
      message={
        <>
          <b>{meetingName}</b> for {team.name} closes {closesAt}. Share your responses before the
          results are revealed.
        </>
      }
      notification={notification}
      action={<NotificationAction label={'Share your responses'} onClick={goThere} />}
    />
  )
}

export default TeamHealthResponseDue
