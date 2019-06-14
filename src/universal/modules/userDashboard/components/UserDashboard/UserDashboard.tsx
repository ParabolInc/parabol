import React, {lazy} from 'react'
import {Route} from 'react-router'
import {Switch} from 'react-router-dom'
import userDashReducer from 'universal/modules/userDashboard/ducks/userDashDuck'
import withReducer from '../../../../decorators/withReducer/withReducer'

const Organizations = lazy(() =>
  import(/* webpackChunkName: 'OrganizationsRoot' */ 'universal/modules/userDashboard/containers/Organizations/OrganizationsRoot')
)
const Organization = lazy(() =>
  import(/* webpackChunkName: 'OrganizationRoot' */ 'universal/modules/userDashboard/containers/Organization/OrganizationRoot')
)
const UserDashMain = lazy(() =>
  import(/* webpackChunkName: 'UserDashMain' */ 'universal/modules/userDashboard/components/UserDashMain/UserDashMain')
)
const UserProfile = lazy(() =>
  import(/* webpackChunkName: 'UserProfileRoot' */ 'universal/modules/userDashboard/components/UserProfileRoot')
)
const Notifications = lazy(() =>
  import(/* webpackChunkName: 'NotificationsContainer' */ 'universal/modules/notifications/components/Notifications/Notifications')
)

interface Props {
  match: any
  notifications: any
}

const UserDashboard = (props: Props) => {
  const {match, notifications} = props
  return (
    <Switch>
      <Route path={`${match.url}/profile`} component={UserProfile} />
      <Route exact path={`${match.url}/organizations`} component={Organizations} />
      <Route path={`${match.url}/organizations/:orgId`} component={Organization} />
      <Route
        path={`${match.url}/notifications`}
        render={(p) => <Notifications {...p} notifications={notifications} />}
      />
      <Route path={match.url} component={UserDashMain} />
    </Switch>
  )
}

export default withReducer({userDashboard: userDashReducer})(UserDashboard)
