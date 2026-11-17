import {Suspense} from 'react'
import dashboardQuery, {type DashboardQuery} from '../__generated__/DashboardQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import Dashboard from './Dashboard'

const DashboardRoot = () => {
  const queryRef = useQueryLoaderNow<DashboardQuery>(dashboardQuery, {
    first: 5,
    // relay-compiler has a bug where null literal values are stripped away. However, null != undefined.
    // The only workaround is to pass null as a variable instead of a literal
    // Issue here: https://github.com/facebook/relay/issues/4488
    nullId: null
  })
  return <Suspense fallback={''}>{queryRef && <Dashboard queryRef={queryRef} />}</Suspense>
}

export default DashboardRoot
