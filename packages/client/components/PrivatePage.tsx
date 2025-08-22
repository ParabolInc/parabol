import {lazy} from 'react'
import useAuthRoute from '../hooks/useAuthRoute'
import useNoIndex from '../hooks/useNoIndex'

const DashboardRoot = lazy(() => import(/* webpackChunkName: 'DashboardRoot' */ './DashboardRoot'))

const PrivatePage = () => {
  useAuthRoute()
  useNoIndex()
  return <DashboardRoot />
}

export default PrivatePage
