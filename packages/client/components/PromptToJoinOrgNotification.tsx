import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PromptToJoinOrgNotification_notification$key} from '~/__generated__/PromptToJoinOrgNotification_notification.graphql'
import NotificationAction from './NotificationAction'
import NotificationTemplate from './NotificationTemplate'
import useAtmosphere from '../hooks/useAtmosphere'

interface Props {
  notification: PromptToJoinOrgNotification_notification$key
}

const PromptToJoinOrgNotification = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {notification: notificationRef} = props
  const notification = useFragment(
    graphql`
      fragment PromptToJoinOrgNotification_notification on NotifyPromptToJoinOrg {
        ...NotificationTemplate_notification
        id
        activeDomain
      }
    `,
    notificationRef
  )
  const {activeDomain} = notification

  const onActionClick = () => {
    atmosphere.eventEmitter.emit('addSnackbar', {
      key: 'promptToJoinOrgSuccess',
      autoDismiss: 5,
      showDismissButton: true,
      message: `🎉 Success! We've let your team know you'd like to join them`
    })
  }

  return (
    <NotificationTemplate
      message={`Your teammates at ${activeDomain} are loving Parabol! Do you want to join them?`}
      action={<NotificationAction label={'Request to Join'} onClick={onActionClick} />}
      notification={notification}
    />
  )
}

export default PromptToJoinOrgNotification
