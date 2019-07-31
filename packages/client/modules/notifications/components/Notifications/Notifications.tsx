import React from 'react'
import styled from '@emotion/styled'
import Helmet from 'react-helmet'
import FlatButton from '../../../../components/FlatButton'
import IconLabel from '../../../../components/IconLabel'
import Panel from '../../../../components/Panel/Panel'
import SettingsWrapper from '../../../../components/Settings/SettingsWrapper'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../../decorators/withAtmosphere/withAtmosphere'
import NotificationRow from '../NotificationRow/NotificationRow'
import UserSettingsWrapper from '../../../userDashboard/components/UserSettingsWrapper/UserSettingsWrapper'
import ClearNotificationMutation from '../../../../mutations/ClearNotificationMutation'
import {PALETTE} from '../../../../styles/paletteV2'
import {Layout} from '../../../../types/constEnums'
import {PAYMENT_REJECTED} from '../../../../utils/constants'
import withMutationProps, {WithMutationProps} from '../../../../utils/relay/withMutationProps'

const ClearAllButton = styled(FlatButton)({
  alignSelf: 'center',
  minWidth: '5.75rem',
  paddingLeft: '.5em',
  paddingRight: '.5em'
})

const NotificationListBlock = styled('div')({
  width: '100%'
})

const NotificationsEmptyBlock = styled('div')({
  alignItems: 'center',
  borderTop: `1px solid ${PALETTE.BORDER_LIGHTER}`,
  color: PALETTE.TEXT_MAIN,
  display: 'flex',
  fontSize: 20,
  height: 77,
  justifyContent: 'center',
  lineHeight: '1.5',
  padding: Layout.ROW_GUTTER,
  textAlign: 'center',
  width: '100%'
})

const NOTIFICATION_TYPES_REQUIRING_ACTION = new Set([PAYMENT_REJECTED])

const requiresAction = (type): boolean => NOTIFICATION_TYPES_REQUIRING_ACTION.has(type)

interface Props extends WithAtmosphereProps, WithMutationProps {
  notifications: any
}

const Notifications = (props: Props) => {
  const {atmosphere, notifications, submitMutation, onCompleted, onError, submitting} = props
  if (!notifications) return null
  const clearableNotifs = notifications.edges.filter(({node}) => node && !requiresAction(node.type))
  const clearAllNotifications = () => {
    submitMutation()
    clearableNotifs.forEach(({node}) => {
      ClearNotificationMutation(atmosphere, node.id, onError, onCompleted)
    })
  }

  const clearAllButton = () => (
    <ClearAllButton aria-label='Clear all notifications' onClick={clearAllNotifications}>
      <IconLabel icon='check' iconAfter label='Clear All' />
    </ClearAllButton>
  )

  return (
    <UserSettingsWrapper>
      <Helmet title='My Notifications | Parabol' />
      <SettingsWrapper>
        <Panel
          label='Notifications'
          controls={!submitting && clearableNotifs.length > 0 && clearAllButton()}
        >
          {notifications && notifications.edges.length ? (
            <NotificationListBlock>
              {notifications.edges
                .filter(({node}) => Boolean(node))
                .map(({node}) => (
                  <NotificationRow key={`notification${node.id}`} notification={node} />
                ))}
            </NotificationListBlock>
          ) : (
            <NotificationsEmptyBlock>
              {'Hey there! You’re all caught up! 💯'}
            </NotificationsEmptyBlock>
          )}
        </Panel>
      </SettingsWrapper>
    </UserSettingsWrapper>
  )
}

export default withAtmosphere(withMutationProps(Notifications))
