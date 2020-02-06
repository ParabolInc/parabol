import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PromoteToBillingLeader_notification} from '../../../../__generated__/PromoteToBillingLeader_notification.graphql'
import NotificationAction from './NotificationAction'
import NotificationTemplate from './NotificationTemplate'
import useRouter from 'hooks/useRouter'

interface Props {
  notification: PromoteToBillingLeader_notification
}

const PromoteToBillingLeader = (props: Props) => {
  const {notification} = props
  const {history} = useRouter()
  const {organization} = notification
  const {name: orgName, id: orgId, picture: orgPicture} = organization

  const goToOrg = () => {
    history.push(`/me/organizations/${orgId}`)
  }

  return (
    <NotificationTemplate
      avatar={orgPicture}
      message={`You‘ve been promoted to billing leader for ${orgName}`}
      action={<NotificationAction label={'See organization'} onClick={goToOrg} />}
      notification={notification}
    />
  )
}

export default createFragmentContainer(PromoteToBillingLeader, {
  notification: graphql`
    fragment PromoteToBillingLeader_notification on NotifyPromoteToOrgLeader {
      ...NotificationTemplate_notification
      id
      organization {
        id
        name
      }
    }
  `
})
