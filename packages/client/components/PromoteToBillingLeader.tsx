import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import useRouter from '~/hooks/useRouter'
import defaultOrgAvatar from '~/styles/theme/images/avatar-organization.svg'
import {PromoteToBillingLeader_notification} from '~/__generated__/PromoteToBillingLeader_notification.graphql'
import NotificationAction from './NotificationAction'
import NotificationTemplate from './NotificationTemplate'
interface Props {
  notification: PromoteToBillingLeader_notification
}

const PromoteToBillingLeader = (props: Props) => {
  const {notification} = props

  const {t} = useTranslation()

  const {history} = useRouter()
  const {organization} = notification
  const {name: orgName, id: orgId, picture: orgPicture} = organization

  const goToOrg = () => {
    history.push(
      t('PromoteToBillingLeader.MeOrganizationsOrgId', {
        orgId
      })
    )
  }

  return (
    <NotificationTemplate
      avatar={orgPicture || defaultOrgAvatar}
      message={t('PromoteToBillingLeader.YouVeBeenPromotedToBillingLeaderForOrgName', {
        orgName
      })}
      action={
        <NotificationAction label={t('PromoteToBillingLeader.SeeOrganization')} onClick={goToOrg} />
      }
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
        picture
      }
    }
  `
})
