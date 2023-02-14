import React, {lazy} from 'react'
import {Route} from 'react-router'
import {Switch} from 'react-router-dom'

const Organizations = lazy(
  () =>
    import(
      /* webpackChunkName: 'OrganizationsRoot' */ '../../containers/Organizations/OrganizationsRoot'
    )
)
const Organization = lazy(
  () =>
    import(
      /* webpackChunkName: 'OrganizationRoot' */ '../../containers/Organization/OrganizationRoot'
    )
)
const UserDashMain = lazy(
  () => import(/* webpackChunkName: 'UserDashMain' */ '../UserDashMain/UserDashMain')
)
const UserProfile = lazy(
  () => import(/* webpackChunkName: 'UserProfileRoot' */ '../UserProfileRoot')
)

interface Props {
  match: any
}

const UserDashboard = (props: Props) => {
  const {match} = props

  return (
    <Switch>
      <Route path={`${match.url}/profile`} component={UserProfile} />
      <Route exact path={`${match.url}/organizations`} component={Organizations} />
      <Route path={`${match.url}/organizations/:orgId`} component={Organization} />
      <Route path={match.url} component={UserDashMain} />
    </Switch>
  )
}

export default UserDashboard
