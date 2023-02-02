import React, {lazy, useEffect} from 'react'
import {Route, useLocation} from 'react-router'
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
  toggle: () => void
  checkoutFlowFlag: boolean
}

const UserDashboard = (props: Props) => {
  const {match, toggle, checkoutFlowFlag} = props
  const location = useLocation()
  const {pathname} = location
  useEffect(() => {
    if (checkoutFlowFlag && pathname.startsWith(`${match.url}/organizations`)) {
      toggle()
    }
  }, [pathname])

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
