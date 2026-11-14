import {Suspense} from 'react'
import reportsRedirectQuery, {
  type ReportsRedirectQuery
} from '../../__generated__/ReportsRedirectQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import ReportsRedirect from './ReportsRedirect'

const ReportsRoot = () => {
  const queryRef = useQueryLoaderNow<ReportsRedirectQuery>(reportsRedirectQuery, {})
  return <Suspense fallback={''}>{queryRef && <ReportsRedirect queryRef={queryRef} />}</Suspense>
}

export default ReportsRoot
