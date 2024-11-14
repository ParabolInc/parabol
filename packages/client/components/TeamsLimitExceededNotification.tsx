import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {useFragment} from 'react-relay'
import {TeamsLimitExceededNotification_notification$key} from '~/__generated__/TeamsLimitExceededNotification_notification.graphql'
import useRouter from '~/hooks/useRouter'
import defaultOrgAvatar from '~/styles/theme/images/avatar-organization.svg'
import useAtmosphere from '../hooks/useAtmosphere'
import {Threshold} from '../types/constEnums'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import NotificationAction from './NotificationAction'
import NotificationTemplate from './NotificationTemplate'

interface Props {
  notification: TeamsLimitExceededNotification_notification$key
}

const TeamsLimitExceededNotification = (props: Props) => {
  const {notification: notificationRef} = props
  const atmosphere = useAtmosphere()
  const notification = useFragment(
    graphql`
      fragment TeamsLimitExceededNotification_notification on NotifyTeamsLimitExceeded {
        ...NotificationTemplate_notification
        id
        orgId
        orgName
        orgPicture
      }
    `,
    notificationRef
  )
  const {history} = useRouter()
  const {orgId, orgName, orgPicture} = notification

  useEffect(() => {
    SendClientSideEvent(atmosphere, 'Upgrade CTA Viewed', {
      upgradeCTALocation: 'teamsLimitExceededNotification',
      orgId
    })
  }, [])

  const onActionClick = () => {
    SendClientSideEvent(atmosphere, 'Upgrade CTA Clicked', {
      upgradeCTALocation: 'teamsLimitExceededNotification'
    })
    history.push(`/me/organizations/${orgId}`)
  }

  return (
    <NotificationTemplate
      avatar={orgPicture || defaultOrgAvatar}
      message={`"${orgName}" is over the limit of ${Threshold.MAX_STARTER_TIER_TEAMS} free teams.`}
      action={<NotificationAction label={'Upgrade'} onClick={onActionClick} />}
      notification={notification}
    />
  )
}

export default TeamsLimitExceededNotification
