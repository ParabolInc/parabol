import React, {Suspense} from 'react'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import insightsQuery, {InsightsQuery} from '../__generated__/InsightsQuery.graphql'
import Insights from './Insights'

const InsightsRoot = () => {
  const queryRef = useQueryLoaderNow<InsightsQuery>(insightsQuery, {})
  return <Suspense fallback={''}>{queryRef && <Insights queryRef={queryRef} />}</Suspense>
}

export default InsightsRoot
