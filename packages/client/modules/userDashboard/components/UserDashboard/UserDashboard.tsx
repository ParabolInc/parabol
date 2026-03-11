import {lazy} from 'react'
import {Route, Routes} from 'react-router-dom'

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
const UserDashMain = lazy(() => import(/* webpackChunkName: 'UserDashMain' */ '../UserDashMain'))
const UserProfile = lazy(
  () => import(/* webpackChunkName: 'UserProfileRoot' */ '../UserProfileRoot')
)

const UserDashboard = () => {
  return (
    <Routes>
      <Route path='profile' element={<UserProfile />} />
      <Route path='organizations' element={<Organizations />} />
      <Route path='organizations/:orgId/*' element={<Organization />} />
      <Route path='*' element={<UserDashMain />} />
    </Routes>
  )
}

export default UserDashboard
