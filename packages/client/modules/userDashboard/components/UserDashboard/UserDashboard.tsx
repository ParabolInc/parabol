import React, {lazy} from 'react'
import {useTranslation} from 'react-i18next'
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
  notifications: any
}

const UserDashboard = (props: Props) => {
  const {match} = props

  const {t} = useTranslation()

  return (
    <Switch>
      <Route
        path={t('UserDashboard.MatchUrlProfile', {
          matchUrl: match.url
        })}
        component={UserProfile}
      />
      <Route
        exact
        path={t('UserDashboard.MatchUrlOrganizations', {
          matchUrl: match.url
        })}
        component={Organizations}
      />
      <Route
        path={t('UserDashboard.MatchUrlOrganizationsOrgId', {
          matchUrl: match.url
        })}
        component={Organization}
      />
      <Route path={match.url} component={UserDashMain} />
    </Switch>
  )
}

export default UserDashboard
