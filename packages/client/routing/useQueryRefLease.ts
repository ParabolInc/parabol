import {rootRouteId, useRouteContext} from '@tanstack/react-router'
import {useEffect} from 'react'
import type {PreloadedQuery} from 'react-relay'
import type {OperationType} from 'relay-runtime'

// Holds a route loader's query while its page shows it, so the registry keeps it until the page closes
const useQueryRefLease = <TQuery extends OperationType>(
  queryRef: PreloadedQuery<TQuery> | null
) => {
  const {queryRefs} = useRouteContext({from: rootRouteId})
  useEffect(() => {
    if (!queryRef) return
    return queryRefs.lease(queryRef)
  }, [queryRefs, queryRef])
}

export default useQueryRefLease
