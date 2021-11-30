import React, {RefObject, Suspense, useRef} from 'react'
import spotlightGroupsQuery, {
  SpotlightGroupsQuery
} from '../__generated__/SpotlightGroupsQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import SpotlightGroups from './SpotlightGroups'

interface Props {
  spotlightGroupId?: string
  phaseRef: RefObject<HTMLDivElement>
  meetingId: string
  isSpotlightEntering: boolean
}

const ResultsRoot = (props: Props) => {
  const {meetingId, spotlightGroupId, phaseRef, isSpotlightEntering} = props
  const searchQuery = '' // TODO: implement searchQuery
  const groupIdRef = useRef('')
  const nextGroupId = spotlightGroupId ?? ''
  if (nextGroupId) {
    groupIdRef.current = nextGroupId
  }
  const queryRef = useQueryLoaderNow<SpotlightGroupsQuery>(
    spotlightGroupsQuery,
    {
      reflectionGroupId: groupIdRef.current,
      searchQuery,
      meetingId
    },
    // Results could be grouped or ungrouped since modal was last opened with identical variables
    'network-only'
  )
  return (
    <Suspense fallback={''}>
      {queryRef && (
        <SpotlightGroups
          phaseRef={phaseRef}
          queryRef={queryRef}
          isSpotlightEntering={isSpotlightEntering}
        />
      )}
    </Suspense>
  )
}
export default ResultsRoot
