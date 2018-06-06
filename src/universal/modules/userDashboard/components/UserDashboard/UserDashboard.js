import PropTypes from 'prop-types'
import React from 'react'
import {Switch} from 'react-router-dom'
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute'
import userDashReducer from 'universal/modules/userDashboard/ducks/userDashDuck'
import withReducer from '../../../../decorators/withReducer/withReducer'

const organizations = () =>
  import(/* webpackChunkName: 'OrganizationsRoot' */ 'universal/modules/userDashboard/containers/Organizations/OrganizationsRoot')
const organization = () =>
  import(/* webpackChunkName: 'OrganizationRoot' */ 'universal/modules/userDashboard/containers/Organization/OrganizationRoot')
const userDashRoot = () =>
  import(/* webpackChunkName: 'UserDashRoot' */ 'universal/modules/userDashboard/components/UserDashRoot')
const userSettings = () =>
  import(/* webpackChunkName: 'UserSettingsRoot' */ 'universal/modules/userDashboard/components/UserSettingsRoot')
const notificationsMod = () =>
  import(/* webpackChunkName: 'NotificationsContainer' */ 'universal/modules/notifications/containers/Notifications/NotificationsContainer')

const UserDashboard = (props) => {
  const {match, notifications} = props
  return (
    <Switch>
      <AsyncRoute exact path={match.url} mod={userDashRoot} />
      <AsyncRoute path={`${match.url}/settings`} mod={userSettings} />
      <AsyncRoute exact path={`${match.url}/organizations`} mod={organizations} />
      <AsyncRoute path={`${match.url}/organizations/:orgId`} mod={organization} />
      <AsyncRoute
        path={`${match.url}/notifications`}
        mod={notificationsMod}
        extraProps={{notifications}}
      />
    </Switch>
  )
}

UserDashboard.propTypes = {
  match: PropTypes.object.isRequired,
  notifications: PropTypes.object
}

export default withReducer({userDashboard: userDashReducer})(UserDashboard)
