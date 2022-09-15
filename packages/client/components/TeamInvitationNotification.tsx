import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import NotificationAction from '~/components/NotificationAction'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import useRouter from '~/hooks/useRouter'
import {TeamInvitationNotification_notification} from '~/__generated__/TeamInvitationNotification_notification.graphql'
import AcceptTeamInvitationMutation from '../mutations/AcceptTeamInvitationMutation'
import NotificationTemplate from './NotificationTemplate'

interface Props {
  notification: TeamInvitationNotification_notification
}

const TeamInvitationNotification = (props: Props) => {
  const {notification} = props
  const {submitMutation, onError, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {id: notificationId, invitation, team} = notification
  const {name: teamName} = team
  const {token, inviter} = invitation
  const {preferredName: inviterName, picture: inviterPicture} = inviter
  const accept = () => {
    submitMutation()
    AcceptTeamInvitationMutation(
      atmosphere,
      {notificationId, invitationToken: token},
      {history, onError, onCompleted}
    )
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

export default createFragmentContainer(TeamInvitationNotification, {
  notification: graphql`
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
  `
})
