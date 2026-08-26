import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import NotificationAction from '~/components/NotificationAction'
import type {TeamHealthResponseRequested_notification$key} from '../__generated__/TeamHealthResponseRequested_notification.graphql'
import NotificationTemplate from './NotificationTemplate'

interface Props {
  notification: TeamHealthResponseRequested_notification$key
}

const TeamHealthResponseRequested = (props: Props) => {
  const {notification: notificationRef} = props
  const notification = useFragment(
    graphql`
      fragment TeamHealthResponseRequested_notification on NotificationTeamHealthResponseRequested {
        ...NotificationTemplate_notification
        id
        meeting {
          id
        }
        team {
          name
        }
      }
    `,
    notificationRef
  )
  const navigate = useNavigate()
  const {meeting, team} = notification
  const goThere = () => {
    navigate(`/meet/${meeting.id}`)
  }

  return (
    <NotificationTemplate
      message={`Team Health for ${team.name} closes soon and we haven't heard from you yet. It takes about 2 minutes.`}
      notification={notification}
      action={<NotificationAction label={'Answer now'} onClick={goThere} />}
    />
  )
}

export default TeamHealthResponseRequested
