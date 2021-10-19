import React, {RefObject, Suspense, useRef} from 'react'
import spotlightGroupsQuery, {
  SpotlightGroupsQuery
} from '../__generated__/SpotlightGroupsQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import SpotlightGroups from './SpotlightGroups'

interface Props {
  spotlightGroupId?: string
  resultsRef: RefObject<HTMLDivElement>
  phaseRef: RefObject<HTMLDivElement>
  meetingId: string
}

const ResultsRoot = (props: Props) => {
  const {meetingId, spotlightGroupId, resultsRef, phaseRef} = props
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
    'network-only'
  )
  return (
    <Suspense fallback={''}>
      {queryRef && (
        <SpotlightGroups resultsRef={resultsRef} phaseRef={phaseRef} queryRef={queryRef} />
      )}
    </Suspense>
  )
}
export default ResultsRoot
