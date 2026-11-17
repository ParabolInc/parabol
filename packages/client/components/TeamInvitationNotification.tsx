import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type {TeamInvitationNotification_notification$key} from '~/__generated__/TeamInvitationNotification_notification.graphql'
import NotificationAction from '~/components/NotificationAction'
import useAtmosphere from '~/hooks/useAtmosphere'
import AcceptTeamInvitationMutation from '../mutations/AcceptTeamInvitationMutation'
import NotificationTemplate from './NotificationTemplate'

interface Props {
  notification: TeamInvitationNotification_notification$key
}

const TeamInvitationNotification = (props: Props) => {
  const {notification: notificationRef} = props
  const notification = useFragment(
    graphql`
      fragment TeamInvitationNotification_notification on NotificationTeamInvitation {
        ...NotificationTemplate_notification
        id
        invitation {
          token
          inviter {
            picture
            preferredName
          }
        }
        team {
          name
        }
      }
    `,
    notificationRef
  )
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const {id: notificationId, invitation, team} = notification
  const {name: teamName} = team
  const {token, inviter} = invitation
  const {preferredName: inviterName, picture: inviterPicture} = inviter
  const accept = () => {
    AcceptTeamInvitationMutation(atmosphere, {notificationId, invitationToken: token}, {navigate})
  }

  return (
    <NotificationTemplate
      avatar={inviterPicture}
      message={`${inviterName} invited you to the ${teamName} team`}
      notification={notification}
      action={<NotificationAction label={'Accept invitation'} onClick={accept} />}
    />
  )
}

export default TeamInvitationNotification
