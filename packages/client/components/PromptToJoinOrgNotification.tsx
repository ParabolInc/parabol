import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {useFragment} from 'react-relay'
import {PromptToJoinOrgNotification_notification$key} from '~/__generated__/PromptToJoinOrgNotification_notification.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import RequestToJoinDomainMutation from '../mutations/RequestToJoinDomainMutation'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import NotificationAction from './NotificationAction'
import NotificationTemplate from './NotificationTemplate'

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
        type
      }
    `,
    notificationRef
  )
  const {activeDomain, type} = notification

  useEffect(() => {
    SendClientSideEvent(atmosphere, 'Notification Viewed', {
      notificationType: type
    })
  }, [])

  const onActionClick = () => {
    RequestToJoinDomainMutation(atmosphere, {})
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
