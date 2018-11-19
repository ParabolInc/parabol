import PropTypes from 'prop-types'
import React from 'react'
import Notifications from 'universal/modules/notifications/components/Notifications/Notifications'

const NotificationsContainer = (props) => {
  const {notifications} = props
  // to avoid a waterfall we push notifications down the DOMs throat, but here it's worth the wait
  if (!notifications) return null
  return <Notifications notifications={notifications} />
}

NotificationsContainer.propTypes = {
  notifications: PropTypes.object
}

export default NotificationsContainer
