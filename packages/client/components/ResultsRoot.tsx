import React, {RefObject, Suspense, useRef} from 'react'
import spotlightGroupsQuery, {
  SpotlightGroupsQuery
} from '../__generated__/SpotlightGroupsQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import SpotlightGroups from './SpotlightGroups'

interface Props {
  spotlightReflectionId?: string
  phaseRef: RefObject<HTMLDivElement>
  meetingId: string
}

const ResultsRoot = (props: Props) => {
  const {meetingId, spotlightReflectionId, phaseRef} = props
  const searchQuery = '' // TODO: implement searchQuery
  const reflectionIdRef = useRef('')
  const nextReflectionId = spotlightReflectionId ?? ''
  if (nextReflectionId) {
    reflectionIdRef.current = nextReflectionId
  }
  const queryRef = useQueryLoaderNow<SpotlightGroupsQuery>(
    spotlightGroupsQuery,
    {
      reflectionId: reflectionIdRef.current,
      searchQuery,
      meetingId
    },
    'network-only'
  )
  return (
    <Suspense fallback={''}>
      {queryRef && <SpotlightGroups phaseRef={phaseRef} queryRef={queryRef} />}
    </Suspense>
  )
}
export default ResultsRoot
