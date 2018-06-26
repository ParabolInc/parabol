import PropTypes from 'prop-types'
import React from 'react'
import Atmosphere from 'universal/Atmosphere'
import Helmet from 'react-helmet'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import NotificationRow from 'universal/modules/notifications/components/NotificationRow/NotificationRow'
import UserSettingsWrapper from 'universal/modules/userDashboard/components/UserSettingsWrapper/UserSettingsWrapper'
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import styled from 'react-emotion'
import SettingsWrapper from 'universal/components/Settings/SettingsWrapper'
import FlatButton from 'universal/components/FlatButton'
import IconLabel from 'universal/components/IconLabel'
import Panel from 'universal/components/Panel/Panel'
import {PAYMENT_REJECTED, REQUEST_NEW_USER, TEAM_INVITE} from 'universal/utils/constants'

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
  borderTop: `1px solid ${ui.rowBorderColor}`,
  color: appTheme.palette.dark,
  display: 'flex',
  fontSize: appTheme.typography.s5,
  height: '4.8125rem',
  justifyContent: 'center',
  lineHeight: '1.5',
  padding: ui.rowGutter,
  textAlign: 'center',
  width: '100%'
})

const NOTIFICATION_TYPES_REQUIRING_ACTION = new Set([
  PAYMENT_REJECTED,
  REQUEST_NEW_USER,
  TEAM_INVITE
])

const requiresAction = (type): boolean => NOTIFICATION_TYPES_REQUIRING_ACTION.has(type)

const Notifications = (props) => {
  const {
    atmosphere,
    dispatch,
    notifications,
    submitMutation,
    onCompleted,
    onError,
    submitting
  } = props

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
          compact
          label='Notifications'
          controls={!submitting && clearableNotifs.length > 0 && clearAllButton()}
        >
          {notifications && notifications.edges.length ? (
            <NotificationListBlock>
              {notifications.edges
                .filter(({node}) => Boolean(node))
                .map(({node}) => (
                  <NotificationRow
                    dispatch={dispatch}
                    key={`notification${node.id}`}
                    notification={node}
                  />
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

Notifications.propTypes = {
  atmosphere: PropTypes.instanceOf(Atmosphere),
  dispatch: PropTypes.func.isRequired,
  notifications: PropTypes.object,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  submitMutation: PropTypes.func.isRequired
}

export default withAtmosphere(withMutationProps(Notifications))
