import React, {RefObject, useCallback, useEffect, useRef} from 'react'
import spotlightGroupsQuery, {
  SpotlightGroupsQuery
} from '../__generated__/SpotlightGroupsQuery.graphql'
import SpotlightGroups from './SpotlightGroups'
import {useQueryLoader, fetchQuery, useRelayEnvironment, PreloadFetchPolicy} from 'react-relay'

interface Props {
  spotlightGroupId?: string
  phaseRef: RefObject<HTMLDivElement>
  meetingId: string
  spotlightSearchQuery: string
}

const SpotlightResultsRoot = (props: Props) => {
  const {meetingId, spotlightGroupId, phaseRef, spotlightSearchQuery} = props
  const groupIdRef = useRef('')
  const nextGroupId = spotlightGroupId ?? ''
  if (nextGroupId) {
    groupIdRef.current = nextGroupId
  }
  const environment = useRelayEnvironment()
  const [queryRef, loadQuery] = useQueryLoader<SpotlightGroupsQuery>(spotlightGroupsQuery)
  const refresh = useCallback(() => {
    const variables = {
      reflectionGroupId: groupIdRef.current,
      searchQuery: spotlightSearchQuery,
      meetingId
    }
    // fetchQuery will fetch the query and write the data to the Relay store.
    // This will ensure that when we re-render, the data is already cached
    // and we don't suspend, which would cause the results to flash
    fetchQuery(environment, spotlightGroupsQuery, variables).subscribe({
      complete: () => {
        // *After* the query has been fetched, we call loadQuery again to
        // re-render with a new queryRef. At this point the data for the
        // query should be cached, so we use the 'store-only' fetchPolicy
        // to avoid suspending.
        loadQuery(variables, {fetchPolicy: 'store-only' as PreloadFetchPolicy})
      }
    })
  }, [groupIdRef.current, spotlightSearchQuery, meetingId])

  useEffect(() => refresh(), [spotlightSearchQuery, groupIdRef.current])

  if (!queryRef) return null
  return <SpotlightGroups phaseRef={phaseRef} queryRef={queryRef} />
}
export default SpotlightResultsRoot
