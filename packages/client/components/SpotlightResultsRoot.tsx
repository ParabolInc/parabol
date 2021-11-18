import React, {RefObject, Suspense, useRef} from 'react'
import spotlightGroupsQuery, {
  SpotlightGroupsQuery
} from '../__generated__/SpotlightGroupsQuery.graphql'
import SpotlightGroups from './SpotlightGroups'
import useQueryLoaderNow from '~/hooks/useQueryLoaderNow'

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
  const variables = {
    reflectionGroupId: groupIdRef.current,
    searchQuery: spotlightSearchQuery,
    meetingId
  }
  const queryRef = useQueryLoaderNow<SpotlightGroupsQuery>(
    spotlightGroupsQuery,
    variables,
    undefined,
    true
  )

  return (
    <Suspense fallback={''}>
      {queryRef && <SpotlightGroups phaseRef={phaseRef} queryRef={queryRef} />}
    </Suspense>
  )
}
export default SpotlightResultsRoot
