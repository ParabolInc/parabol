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
const userDashMain = () =>
  import(/* webpackChunkName: 'UserDashMain' */ 'universal/modules/userDashboard/components/UserDashMain/UserDashMain')
const userProfile = () =>
  import(/* webpackChunkName: 'UserProfileRoot' */ 'universal/modules/userDashboard/components/UserProfileRoot')
const notificationsMod = () =>
  import(/* webpackChunkName: 'NotificationsContainer' */ 'universal/modules/notifications/containers/Notifications/NotificationsContainer')

const UserDashboard = (props) => {
  const {match, notifications} = props
  return (
    <Switch>
      <AsyncRoute path={`${match.url}/profile`} mod={userProfile} />
      <AsyncRoute exact path={`${match.url}/organizations`} mod={organizations} />
      <AsyncRoute path={`${match.url}/organizations/:orgId`} mod={organization} />
      <AsyncRoute
        path={`${match.url}/notifications`}
        mod={notificationsMod}
        extraProps={{notifications}}
      />
      <AsyncRoute path={match.url} mod={userDashMain} />
    </Switch>
  )
}

UserDashboard.propTypes = {
  match: PropTypes.object.isRequired,
  notifications: PropTypes.object
}

export default withReducer({userDashboard: userDashReducer})(UserDashboard)
