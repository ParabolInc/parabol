import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type {PromoteToBillingLeader_notification$key} from '~/__generated__/PromoteToBillingLeader_notification.graphql'
import defaultOrgAvatar from '~/styles/theme/images/avatar-organization.svg'
import NotificationAction from './NotificationAction'
import NotificationTemplate from './NotificationTemplate'

interface Props {
  notification: PromoteToBillingLeader_notification$key
}

const PromoteToBillingLeader = (props: Props) => {
  const {notification: notificationRef} = props
  const notification = useFragment(
    graphql`
      fragment PromoteToBillingLeader_notification on NotifyPromoteToOrgLeader {
        ...NotificationTemplate_notification
        id
        organization {
          id
          name
          picture
        }
      }
    `,
    notificationRef
  )
  const navigate = useNavigate()
  const {organization} = notification
  const {name: orgName, id: orgId, picture: orgPicture} = organization

  const goToOrg = () => {
    navigate(`/me/organizations/${orgId}`)
  }

  return (
    <NotificationTemplate
      avatar={orgPicture || defaultOrgAvatar}
      message={`You‘ve been promoted to billing leader for ${orgName}`}
      action={<NotificationAction label={'See organization'} onClick={goToOrg} />}
      notification={notification}
    />
  )
}

export default PromoteToBillingLeader
